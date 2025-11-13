"""
Advanced AI Agent with Vertex AI capabilities
Supports: Document Q&A, Image Generation, Note Generation, YouTube Analysis, Personalized Recommendations
"""

import google.generativeai as genai
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime
import requests
import re
from youtube_transcript_api import YouTubeTranscriptApi

try:
    from .config import settings
except:
    from config import settings

logger = logging.getLogger(__name__)

class AIAgent:
    """
    Comprehensive AI Agent with multiple capabilities:
    - Document Q&A
    - Personalized study recommendations based on user history
    - Image generation for diagrams and illustrations
    - Note generation
    - YouTube video analysis
    - Multi-modal interactions
    """
    
    def __init__(self):
        if not settings.gemini_api_key:
            logger.error("Gemini API key is not configured!")
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        genai.configure(api_key=settings.gemini_api_key)
        
        # Use Gemini 2.0 Flash for text generation
        self.text_model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # For image generation, we'll use Imagen (via Vertex AI)
        # Note: Requires Vertex AI setup with proper authentication
        
        # Storage
        self.session_data: Dict[str, Dict] = {}  # session_id -> session data
        self.user_sessions: Dict[str, str] = {}  # user_id -> session_id (for persistence)
        
        logger.info("AI Agent initialized with full capabilities")
    
    def process_message(
        self, 
        session_id: str, 
        user_id: Optional[str],
        message: str, 
        conversation_history: List[Dict],
        user_stats: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Process a message with full agentic capabilities
        Detects intent and routes to appropriate handler
        """
        
        # Use user_id as persistent session if available
        if user_id:
            # Link user to session for persistence
            self.user_sessions[user_id] = session_id
            # If this user has previous session data, restore it
            if user_id in self.user_sessions and session_id != self.user_sessions[user_id]:
                old_session = self.user_sessions[user_id]
                if old_session in self.session_data:
                    # Merge old session data into current session
                    if session_id not in self.session_data:
                        self.session_data[session_id] = {}
                    self.session_data[session_id].update(self.session_data[old_session])
        
        # Detect intent
        intent = self._detect_intent(message, session_id)
        
        logger.info(f"Processing message with intent: {intent} for session: {session_id}")
        
        # Route to appropriate handler
        if intent == "youtube_analysis":
            return self._handle_youtube(message, session_id, conversation_history)
        elif intent == "generate_image":
            return self._handle_image_generation(message, session_id)
        elif intent == "generate_notes":
            return self._handle_note_generation(message, session_id, user_stats)
        elif intent == "study_recommendations":
            return self._handle_recommendations(message, user_id, user_stats, conversation_history)
        elif intent == "document_qa":
            return self._handle_document_qa(message, session_id, conversation_history)
        else:
            # General conversation with personalized context
            return self._handle_general(message, session_id, user_id, user_stats, conversation_history)
    
    def _detect_intent(self, message: str, session_id: str) -> str:
        """Detect user intent from message"""
        message_lower = message.lower()
        
        # YouTube detection
        if 'youtube.com' in message_lower or 'youtu.be' in message_lower or 'analyze video' in message_lower or 'youtube video' in message_lower:
            return "youtube_analysis"
        
        # Image generation detection
        if any(keyword in message_lower for keyword in ['generate image', 'create diagram', 'draw', 'illustrate', 'show me a picture', 'visualize']):
            return "generate_image"
        
        # Note generation detection
        if any(keyword in message_lower for keyword in ['generate notes', 'create notes', 'make notes', 'summarize into notes', 'note generation']):
            return "generate_notes"
        
        # Recommendations detection
        if any(keyword in message_lower for keyword in ['recommend', 'suggestion', 'what should i study', 'help me prepare', 'study plan']):
            return "study_recommendations"
        
        # Check if there's document context
        if session_id in self.session_data and 'document_text' in self.session_data[session_id]:
            return "document_qa"
        
        return "general"
    
    def _handle_youtube(self, message: str, session_id: str, history: List[Dict]) -> Dict:
        """Analyze YouTube video and enable Q&A"""
        try:
            # Extract YouTube URL
            youtube_url = self._extract_youtube_url(message)
            if not youtube_url:
                return {
                    "message": "Please provide a valid YouTube URL (e.g., https://youtube.com/watch?v=VIDEO_ID)",
                    "type": "error"
                }
            
            # Extract video ID
            video_id = self._extract_video_id(youtube_url)
            if not video_id:
                return {"message": "Could not extract video ID from URL", "type": "error"}
            
            # Get transcript
            try:
                transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
                transcript = " ".join([entry['text'] for entry in transcript_list])
            except Exception as e:
                logger.error(f"Failed to get transcript: {str(e)}")
                return {
                    "message": f"**Unable to analyze video**\n\nThis video may not have captions/subtitles available. Please try another video or provide the topic, and I can help you with study resources!\n\nError: {str(e)}",
                    "type": "error"
                }
            
            # Store transcript in session
            if session_id not in self.session_data:
                self.session_data[session_id] = {}
            self.session_data[session_id]['youtube_transcript'] = transcript
            self.session_data[session_id]['youtube_url'] = youtube_url
            
            # Analyze content
            prompt = f"""Analyze this YouTube video transcript and provide a comprehensive summary with study insights:

TRANSCRIPT:
{transcript[:8000]}

Provide:
1. **Main Topic & Overview**
2. **Key Concepts Covered** (bullet points)
3. **Important Timestamps** (if mentioned)
4. **Study Tips** based on the content
5. **Related Topics** to explore
6. **Quiz Questions** you can ask me about this video

Format in markdown for readability."""

            response = self.text_model.generate_content(prompt)
            analysis = response.text
            
            return {
                "message": f"📹 **YouTube Video Analyzed!**\n\n{analysis}\n\n💡 *You can now ask me questions about this video!*",
                "type": "youtube_analysis",
                "video_id": video_id,
                "url": youtube_url
            }
            
        except Exception as e:
            logger.error(f"YouTube analysis error: {str(e)}")
            return {
                "message": f"Sorry, I encountered an error analyzing the video: {str(e)}",
                "type": "error"
            }
    
    def _handle_image_generation(self, message: str, session_id: str) -> Dict:
        """Generate educational diagrams and illustrations"""
        # Note: For actual image generation, you would use Vertex AI Imagen
        # This is a placeholder that provides ASCII/text-based diagrams
        
        prompt = f"""The user requested an image/diagram with this description:
"{message}"

Since I cannot generate actual images in this response, I will:
1. Provide a detailed text-based description/ASCII diagram
2. Suggest tools where they can create this (Canva, Draw.io, etc.)
3. Provide a Mermaid diagram code if applicable
4. Suggest relevant image search terms

Format the response in markdown."""

        response = self.text_model.generate_content(prompt)
        
        return {
            "message": f"🎨 **Visual Representation**\n\n{response.text}\n\n💡 *Note: For actual image generation, we can integrate Vertex AI Imagen. For now, you can use the Mermaid diagram code with mermaid.live or other tools.*",
            "type": "image_generation"
        }
    
    def _handle_note_generation(self, message: str, session_id: str, user_stats: Optional[Dict]) -> Dict:
        """Generate comprehensive study notes"""
        # Get context
        context = ""
        if session_id in self.session_data:
            if 'document_text' in self.session_data[session_id]:
                context = self.session_data[session_id]['document_text'][:5000]
            elif 'youtube_transcript' in self.session_data[session_id]:
                context = self.session_data[session_id]['youtube_transcript'][:5000]
        
        if not context:
            return {
                "message": "Please upload a document or analyze a YouTube video first, then I can generate notes from it!",
                "type": "error"
            }
        
        prompt = f"""Generate comprehensive study notes from this content:

CONTENT:
{context}

USER REQUEST: {message}

Create well-structured notes with:
1. **Title & Introduction**
2. **Main Topics** (organized with headings)
3. **Key Definitions** (in bold)
4. **Important Formulas/Concepts** (in code blocks if applicable)
5. **Examples & Explanations**
6. **Summary Points** (bullet list)
7. **Practice Questions** (3-5 questions)

Format in clean markdown for easy reading and studying."""

        response = self.text_model.generate_content(prompt)
        
        return {
            "message": f"📝 **Study Notes Generated**\n\n{response.text}",
            "type": "note_generation"
        }
    
    def _handle_recommendations(self, message: str, user_id: Optional[str], user_stats: Optional[Dict], history: List[Dict]) -> Dict:
        """Provide personalized study recommendations based on user history"""
        
        recommendations_context = ""
        if user_stats:
            recommendations_context = f"""
USER PERFORMANCE DATA:
- Total Quizzes: {user_stats.get('total_quizzes', 0)}
- Average Score: {user_stats.get('average_score', 0):.1f}%
- Current Streak: {user_stats.get('current_streak', 0)} days
- Recent Topics: {', '.join([q.get('topic', 'N/A') for q in user_stats.get('recent_quizzes', [])[:5]])}
- Weak Areas: {', '.join([k for k, v in user_stats.get('performance_by_topic', {}).items() if v < 60])}
- Strong Areas: {', '.join([k for k, v in user_stats.get('performance_by_topic', {}).items() if v >= 80])}
"""
        
        prompt = f"""You are a personalized AI study coach. Based on the user's performance history and their request, provide tailored study recommendations.

{recommendations_context}

USER REQUEST: {message}

Provide:
1. **Personalized Study Plan** (based on their weak areas)
2. **Recommended Topics** to focus on
3. **Study Resources**:
   - 📚 Specific textbook chapters or online resources
   - 🎥 YouTube channels/playlists (with search terms)
   - 🔗 Websites (Khan Academy, Coursera, etc.)
4. **Practice Strategy** (how to improve weak areas)
5. **Motivational Tips** (considering their current streak)

Format in engaging markdown with emojis."""

        response = self.text_model.generate_content(prompt)
        
        return {
            "message": f"🎯 **Personalized Study Recommendations**\n\n{response.text}",
            "type": "recommendations"
        }
    
    def _handle_document_qa(self, message: str, session_id: str, history: List[Dict]) -> Dict:
        """Handle Q&A about uploaded documents"""
        document_text = self.session_data[session_id].get('document_text', '')
        
        conversation_context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-5:]])
        
        prompt = f"""You are an AI Study Assistant. Answer the student's question based on the document content.

DOCUMENT:
{document_text[:5000]}

CONVERSATION HISTORY:
{conversation_context}

QUESTION: {message}

Provide a clear, educational answer with:
- **Direct Answer**
- **Explanation** with examples
- **Related Concepts**
- **Study Resources** if applicable

Use markdown formatting."""

        response = self.text_model.generate_content(prompt)
        
        return {
            "message": response.text,
            "type": "document_qa"
        }
    
    def _handle_general(self, message: str, session_id: str, user_id: Optional[str], user_stats: Optional[Dict], history: List[Dict]) -> Dict:
        """Handle general educational conversations"""
        
        context = ""
        if user_stats:
            context = f"\nUser has completed {user_stats.get('total_quizzes', 0)} quizzes with {user_stats.get('average_score', 0):.1f}% average.\n"
        
        prompt = f"""You are an AI Study Assistant helping students learn better.{context}

QUESTION: {message}

Provide helpful, educational responses with:
- Clear explanations
- Examples when useful
- Study resources (YouTube, websites, books)
- Encouragement and motivation

Use markdown formatting with emojis for engagement."""

        response = self.text_model.generate_content(prompt)
        
        return {
            "message": response.text,
            "type": "general"
        }
    
    def set_document_context(self, session_id: str, document_text: str, document_title: str):
        """Set document context for Q&A"""
        if session_id not in self.session_data:
            self.session_data[session_id] = {}
        self.session_data[session_id]['document_text'] = document_text
        self.session_data[session_id]['document_title'] = document_title
    
    def _extract_youtube_url(self, text: str) -> Optional[str]:
        """Extract YouTube URL from text"""
        # Match various YouTube URL formats
        patterns = [
            r'(https?://)?(www\.)?(youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]+)',
            r'(https?://)?(www\.)?youtube\.com/embed/([a-zA-Z0-9_-]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                video_id = match.group(4) if len(match.groups()) >= 4 else match.group(3)
                return f"https://www.youtube.com/watch?v={video_id}"
        
        return None
    
    def _extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from YouTube URL"""
        patterns = [
            r'(?:v=|\/)([a-zA-Z0-9_-]{11}).*',
            r'(?:embed\/)([a-zA-Z0-9_-]{11})',
            r'(?:youtu\.be\/)([a-zA-Z0-9_-]{11})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None

# Global instance
ai_agent = AIAgent()

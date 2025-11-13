"""
Chat processor for document Q&A using Gemini AI
"""

import google.generativeai as genai
from typing import List, Optional
import logging
from datetime import datetime
from chat_models import ChatMessage, ChatRequest, ChatResponse, ChatHistory

try:
    from .config import settings
except:
    from config import settings

logger = logging.getLogger(__name__)

class ChatProcessor:
    """Process chat messages about uploaded documents"""
    
    def __init__(self):
        if not settings.gemini_api_key:
            logger.error("Gemini API key is not configured!")
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Store document content per session
        self.session_documents: dict = {}  # session_id -> document_text
        self.chat_histories: dict = {}  # session_id -> ChatHistory
        
        logger.info("Chat processor initialized")
    
    def set_document_context(self, session_id: str, document_text: str, document_title: str) -> None:
        """Set the document context for a chat session"""
        self.session_documents[session_id] = document_text
        
        if session_id not in self.chat_histories:
            self.chat_histories[session_id] = ChatHistory(
                session_id=session_id,
                document_title=document_title,
                messages=[],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
    
    def process_message(self, request: ChatRequest) -> ChatResponse:
        """
        Process a user message and generate AI response
        Based on prompt.json question_answering specifications
        """
        session_id = request.session_id
        user_message = request.message
        
        # Get document context
        document_text = self.session_documents.get(session_id)
        if not document_text:
            return ChatResponse(
                message="I don't have access to the document for this session. Please upload a document first.",
                session_id=session_id,
                timestamp=datetime.now(),
                confidence="low"
            )
        
        # Build conversation context
        conversation_context = self._build_conversation_context(request.conversation_history)
        
        # Build prompt following prompt.json structure with study resources
        prompt = f"""You are an AI Study Assistant helping a student understand their study material. You have access to the following document:

DOCUMENT CONTENT:
{document_text[:5000]}  

CONVERSATION HISTORY:
{conversation_context}

STUDENT'S QUESTION:
{user_message}

Please provide a helpful response following these guidelines:
1. Answer based on the uploaded document content
2. Use simple, clear language with **markdown formatting** (bold, italic, lists, code blocks, etc.)
3. Break down complex concepts into digestible parts
4. Provide examples when helpful
5. Suggest relevant study resources:
   - YouTube video recommendations (with topic keywords for search)
   - External learning resources (Khan Academy, Coursera, etc.)
   - Related topics to explore further
6. Use proper markdown formatting for better readability

Provide your response in markdown format with:
- **Bold** for key concepts
- *Italic* for emphasis
- Lists for organized information
- Code blocks for formulas or technical content
- Links to study resources when relevant

Example response format:

**Answer:**
Your clear answer here with **key terms** highlighted.

**Explanation:**
Detailed explanation with:
- Point 1
- Point 2
- Point 3

**Study Resources:**
- 🎥 YouTube: Search for "[topic keyword]" for video tutorials
- 📚 Khan Academy: [Specific topic area]
- 🔗 Additional reading: [Relevant concepts]

**Related Topics:**
- Connected concept 1
- Connected concept 2

Provide ONLY the markdown-formatted response, no JSON.
"""
        
        try:
            logger.info(f"Processing chat message for session {session_id}")
            response = self.model.generate_content(prompt)
            
            if not response or not response.text:
                raise Exception("AI returned empty response")
            
            # Return markdown response directly
            answer_text = response.text.strip()
            
            # Store in history
            self._add_to_history(session_id, user_message, answer_text, request.user_id)
            
            return ChatResponse(
                message=answer_text,
                session_id=session_id,
                timestamp=datetime.now(),
                related_concepts=[],
                confidence="high"
            )
            
        except Exception as e:
            logger.error(f"Chat processing error: {str(e)}")
            return ChatResponse(
                message="I apologize, but I encountered an error processing your question. Please try rephrasing it or ask something else about the document.",
                session_id=session_id,
                timestamp=datetime.now(),
                confidence="low"
            )
    
    def _build_conversation_context(self, history: List[ChatMessage]) -> str:
        """Build conversation context from message history"""
        if not history:
            return "(This is the first message)"
        
        context_lines = []
        for msg in history[-5:]:  # Last 5 messages for context
            role = "Student" if msg.role == "user" else "Assistant"
            context_lines.append(f"{role}: {msg.content}")
        
        return "\n".join(context_lines)
    
    def _parse_response(self, response_text: str) -> dict:
        """Parse AI response into structured format"""
        import json
        
        try:
            # Clean up response
            clean_text = response_text.strip()
            if clean_text.startswith('```'):
                clean_text = clean_text.split('\n', 1)[1]
                clean_text = clean_text.rsplit('```', 1)[0]
            
            clean_text = clean_text.strip()
            
            # Parse JSON
            data = json.loads(clean_text)
            
            # Ensure required fields
            if "answer" not in data:
                data["answer"] = response_text
            
            return data
            
        except json.JSONDecodeError:
            # Fallback if not valid JSON
            return {
                "answer": response_text,
                "explanation": "",
                "related_concepts": [],
                "examples": [],
                "source_reference": "",
                "confidence": "medium"
            }
    
    def _add_to_history(self, session_id: str, user_msg: str, ai_msg: str, user_id: Optional[str]) -> None:
        """Add messages to chat history"""
        if session_id not in self.chat_histories:
            self.chat_histories[session_id] = ChatHistory(
                session_id=session_id,
                user_id=user_id,
                document_title="Unknown",
                messages=[],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        
        history = self.chat_histories[session_id]
        
        history.messages.append(ChatMessage(
            role="user",
            content=user_msg,
            timestamp=datetime.now()
        ))
        
        history.messages.append(ChatMessage(
            role="assistant",
            content=ai_msg,
            timestamp=datetime.now()
        ))
        
        history.updated_at = datetime.now()
        if user_id:
            history.user_id = user_id
    
    def get_chat_history(self, session_id: str) -> Optional[ChatHistory]:
        """Get chat history for a session"""
        return self.chat_histories.get(session_id)
    
    def clear_session(self, session_id: str) -> None:
        """Clear chat session data"""
        if session_id in self.session_documents:
            del self.session_documents[session_id]
        if session_id in self.chat_histories:
            del self.chat_histories[session_id]

# Global instance
chat_processor = ChatProcessor()

import google.generativeai as genai
from typing import Dict, Any
import json
import logging
from .models import DocumentProcessingRequest, ProcessedContent
from .config import settings
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class GeminiProcessor:
    def __init__(self):
        if not settings.gemini_api_key:
            logger.error("Gemini API key is not configured!")
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        genai.configure(api_key=settings.gemini_api_key)
        # Using gemini-2.0-flash as it's more stable and widely available
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        logger.info("Gemini processor initialized with model: gemini-2.0-flash")
    
    def validate_educational_content(self, document_text: str) -> tuple[bool, str]:
        """
        Validate if the document contains educational/academic content
        Returns: (is_valid, reason)
        """
        try:
            validation_prompt = f"""Analyze the following text and determine if it contains educational, academic, or learning material that can be used to generate study questions and flashcards.

TEXT TO ANALYZE:
{document_text[:2000]}

Respond with a JSON object:
{{
    "is_educational": true/false,
    "content_type": "academic|receipt|personal_photo|menu|advertisement|other",
    "reason": "brief explanation",
    "confidence": "high|medium|low"
}}

Educational content includes: textbooks, lecture notes, research papers, study guides, educational articles, course materials, etc.
Non-educational content includes: receipts, personal photos, menus, advertisements, shopping lists, personal messages, etc."""

            logger.info("Validating content type...")
            response = self.model.generate_content(validation_prompt)
            
            if not response or not response.text:
                logger.warning("Content validation returned empty response, proceeding anyway")
                return True, "Could not validate content"
            
            # Parse response
            result_text = response.text.strip()
            # Remove markdown code blocks if present
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result = json.loads(result_text)
            
            is_educational = result.get("is_educational", True)
            content_type = result.get("content_type", "unknown")
            reason = result.get("reason", "Unknown content type")
            confidence = result.get("confidence", "low")
            
            logger.info(f"Content validation: is_educational={is_educational}, type={content_type}, confidence={confidence}")
            
            if not is_educational and confidence in ["high", "medium"]:
                user_message = f"This document appears to be a {content_type.replace('_', ' ')} rather than educational material. QuizMate is designed for academic content like textbooks, lecture notes, or study materials. Please upload educational content to generate meaningful study materials."
                return False, user_message
            
            return True, "Content validated"
            
        except Exception as e:
            logger.warning(f"Content validation failed: {str(e)}, proceeding anyway")
            # On validation error, allow content to proceed
            return True, "Validation skipped due to error"
    
    def generate_study_materials(
        self,
        document_text: str,
        request: DocumentProcessingRequest,
        page_count: int
    ) -> ProcessedContent:
        """Generate comprehensive study materials using Gemini AI"""
        
        if not document_text or len(document_text.strip()) < 50:
            logger.warning(f"Document text is too short: {len(document_text)} characters")
            raise ValueError("Document text is too short or empty. Please upload a document with more content.")
        
        # Validate that content is educational/academic
        is_valid, validation_message = self.validate_educational_content(document_text)
        if not is_valid:
            logger.warning(f"Non-educational content detected: {validation_message}")
            raise ValueError(validation_message)
        
        prompt = self._build_prompt(document_text, request, page_count)
        
        try:
            logger.info(f"Sending request to Gemini API (document length: {len(document_text)} chars)")
            response = self.model.generate_content(prompt)
            
            if not response or not response.text:
                logger.error("Gemini returned empty response")
                raise Exception("AI service returned an empty response. Please try again.")
            
            logger.info(f"Received response from Gemini API (length: {len(response.text)} chars)")
            result = self._parse_response(response.text, request)
            
            return ProcessedContent(
                session_id=request.session_id or str(uuid.uuid4()),
                timestamp=datetime.now(),
                **result
            )
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            if "quota" in str(e).lower():
                raise Exception("API quota exceeded. Please check your Gemini API key and billing status.")
            elif "api key" in str(e).lower():
                raise Exception("Invalid API key. Please check your GEMINI_API_KEY environment variable.")
            elif "permission" in str(e).lower():
                raise Exception("API permission denied. Please verify your API key has access to Gemini 1.5 Flash.")
            else:
                raise Exception(f"Error generating content with Gemini: {str(e)}")
    
    def _build_prompt(
        self,
        document_text: str,
        request: DocumentProcessingRequest,
        page_count: int
    ) -> str:
        """Build comprehensive prompt for Gemini"""
        
        tone = request.customization.tone
        language = request.customization.language
        analysis_depth = request.processing_instructions.analysis_depth
        
        prompt = f"""You are an expert educational content creator. Analyze the following document and create comprehensive study materials in {language} with a {tone} tone.

DOCUMENT TEXT:
{document_text}

ANALYSIS DEPTH: {analysis_depth}
PAGE COUNT: {page_count}

"""
        
        # Add focus areas if specified
        if request.processing_instructions.focus_areas:
            prompt += f"FOCUS ON THESE TOPICS: {', '.join(request.processing_instructions.focus_areas)}\n\n"
        
        # Add learning objectives
        prompt += f"LEARNING OBJECTIVES: {', '.join(request.processing_instructions.learning_objectives)}\n\n"
        
        prompt += "Please generate the following content in valid JSON format:\n\n"
        
        # Multiple Choice Questions
        if request.output_preferences.content_types.questions.enabled:
            mc_config = request.output_preferences.content_types.questions.types.multiple_choice
            if mc_config.enabled:
                prompt += f"""1. MULTIPLE CHOICE QUESTIONS ({mc_config.count} questions, difficulty: {mc_config.difficulty}):
   Format as JSON array with structure:
   [{{"question": "...", "options": ["A", "B", "C", "D"], "correct_answer": 0-3, "explanation": "...", "difficulty": "{mc_config.difficulty}", "page_reference": 1, "topic": "Topic Name"}}]
   Note: Include a 'topic' field indicating the subject area of each question (e.g., "Introduction", "Key Concepts", "Applications")
   
"""
            
            # True/False Questions
            tf_config = request.output_preferences.content_types.questions.types.true_false
            if tf_config.enabled:
                prompt += f"""2. TRUE/FALSE QUESTIONS ({tf_config.count} questions):
   Format as JSON array with structure:
   [{{"question": "...", "correct_answer": true/false, "explanation": "...", "page_reference": 1, "topic": "Topic Name"}}]
   Note: Include a 'topic' field indicating the subject area
   
"""
            
            # Short Answer Questions
            sa_config = request.output_preferences.content_types.questions.types.short_answer
            if sa_config.enabled:
                prompt += f"""3. SHORT ANSWER QUESTIONS ({sa_config.count} questions):
   Format as JSON array with structure:
   [{{"question": "...", "sample_answer": "...", "key_points": ["point1", "point2"], "page_reference": 1}}]
   
"""
        
        # Flashcards
        if request.output_preferences.content_types.flashcards.enabled:
            fc_count = request.output_preferences.content_types.flashcards.count
            prompt += f"""4. FLASHCARDS ({fc_count} cards):
   Format as JSON array with structure:
   [{{"front": "Term or Question", "back": "Definition or Answer", "category": "Topic Category"}}]
   
"""
        
        # Study Notes
        if request.output_preferences.content_types.study_notes.enabled:
            notes_config = request.output_preferences.content_types.study_notes
            prompt += f"""5. STUDY NOTES (format: {notes_config.format}, detail: {notes_config.detail_level}):
   Provide comprehensive study notes {'with examples' if notes_config.include_examples else 'without examples'}.
   
"""
        
        # Summary
        if request.output_preferences.content_types.summary.enabled:
            summary_config = request.output_preferences.content_types.summary
            prompt += f"""6. SUMMARY ({summary_config.length}):
   Provide a {summary_config.length} summary of the main concepts.
   
"""
        
        # Key Terms
        if request.customization.highlight_key_terms:
            prompt += """7. KEY TERMS:
   Format as JSON array: ["term1", "term2", "term3", ...]
   
"""
        
        prompt += """
IMPORTANT: Return ONLY valid JSON in this exact structure:
{
  "multiple_choice_questions": [...],
  "true_false_questions": [...],
  "short_answer_questions": [...],
  "flashcards": [...],
  "study_notes": "...",
  "summary": "...",
  "key_terms": [...]
}

Do not include any markdown formatting, code blocks, or extra text. Return raw JSON only."""
        
        return prompt
    
    def _parse_response(self, response_text: str, request: DocumentProcessingRequest) -> Dict[str, Any]:
        """Parse Gemini response into structured data"""
        try:
            # Clean up response - remove markdown code blocks if present
            clean_text = response_text.strip()
            if clean_text.startswith('```'):
                # Remove opening ```json or ```
                clean_text = clean_text.split('\n', 1)[1]
                # Remove closing ```
                clean_text = clean_text.rsplit('```', 1)[0]
            
            clean_text = clean_text.strip()
            
            # Parse JSON
            data = json.loads(clean_text)
            
            # Ensure all required fields exist
            result = {
                "multiple_choice_questions": data.get("multiple_choice_questions", []),
                "true_false_questions": data.get("true_false_questions", []),
                "short_answer_questions": data.get("short_answer_questions", []),
                "flashcards": data.get("flashcards", []),
                "study_notes": data.get("study_notes", ""),
                "summary": data.get("summary", ""),
                "key_terms": data.get("key_terms", [])
            }
            
            return result
            
        except json.JSONDecodeError as e:
            # If JSON parsing fails, create a basic response
            return {
                "multiple_choice_questions": [],
                "true_false_questions": [],
                "short_answer_questions": [],
                "flashcards": [],
                "study_notes": response_text[:1000],
                "summary": "Error parsing AI response. Please try again.",
                "key_terms": []
            }

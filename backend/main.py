from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
from typing import Optional
import json
import logging
import traceback
from datetime import datetime

try:
    # When running as a package (python -m backend.main)
    from .config import settings
except Exception:
    # When running as a script directly (python main.py)
    from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
try:
    from .models import (
        DocumentProcessingRequest,
        ProcessedContent,
        ErrorResponse,
        AnsweredQuestionPaper,
        QuestionPaperDetection,
        QuizAttemptRecord,
        PerformanceAnalysisResponse,
        QuestionFeedback
    )
    from .auth_models import UserCreate, UserLogin, Token, UserUpdate, DocumentHistory, QuizHistory
    from .chat_models import ChatRequest, ChatResponse
    from .document_processor import DocumentProcessor
    from .gemini_processor import GeminiProcessor
    from .performance_tracker import performance_tracker, QuizAttempt
    from .feedback_generator import feedback_generator
    from .auth_manager import auth_manager
    from .chat_processor import chat_processor
    from .ai_agent import ai_agent
except Exception:
    from models import (
        DocumentProcessingRequest,
        ProcessedContent,
        ErrorResponse,
        AnsweredQuestionPaper,
        QuestionPaperDetection,
        QuizAttemptRecord,
        PerformanceAnalysisResponse,
        QuestionFeedback
    )
    from auth_models import UserCreate, UserLogin, Token, UserUpdate, DocumentHistory, QuizHistory
    from chat_models import ChatRequest, ChatResponse
    from document_processor import DocumentProcessor
    from gemini_processor import GeminiProcessor
    from performance_tracker import performance_tracker, QuizAttempt
    from feedback_generator import feedback_generator
    from auth_manager import auth_manager
    from chat_processor import chat_processor
    from ai_agent import ai_agent

# Create uploads directory if it doesn't exist
os.makedirs(settings.upload_dir, exist_ok=True)

app = FastAPI(
    title="QuizMate API",
    description="AI-Powered Study Materials Generator using Google Gemini",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize processors
document_processor = DocumentProcessor()
gemini_processor = GeminiProcessor()

@app.get("/")
async def root():
    return {
        "message": "QuizMate API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.gemini_api_key)
    }

@app.post("/api/preview-document")
async def preview_document(
    file: UploadFile = File(...)
):
    """
    Preview document content without generating study materials
    Returns: text preview, word count, and estimated topics
    """
    try:
        # Validate file extension
        file_extension = file.filename.split('.')[-1].lower() if file.filename else ''
        if file_extension not in settings.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(settings.allowed_extensions)}"
            )
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Check file size
        max_size_bytes = settings.max_upload_size_mb * 1024 * 1024
        if file_size > max_size_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.max_upload_size_mb}MB"
            )
        
        # Process document to extract text
        try:
            logger.info(f"Previewing document: {file.filename} ({file_extension})")
            document_text, page_count = document_processor.process_document(
                file_content,
                file_extension
            )
            
            # Extract preview (first 1000 characters)
            preview_text = document_text[:1000] + ("..." if len(document_text) > 1000 else "")
            
            # Calculate word count
            word_count = len(document_text.split())
            
            # Estimate topics using simple keyword extraction
            words = document_text.lower().split()
            word_freq = {}
            for word in words:
                if len(word) > 5:  # Only consider longer words
                    word_freq[word] = word_freq.get(word, 0) + 1
            
            # Get top 5 most frequent words as estimated topics
            estimated_topics = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
            estimated_topics = [topic[0].capitalize() for topic in estimated_topics]
            
            # Estimate question count based on content length
            estimated_questions = min(max(5, word_count // 100), 20)
            
            # Detect if this is a question paper
            question_paper_detection = gemini_processor.detect_question_paper(document_text)
            
            logger.info(f"Document preview generated: {word_count} words, {page_count} pages, is_question_paper={question_paper_detection.get('is_question_paper')}")
            
            return {
                "text": preview_text,
                "wordCount": word_count,
                "pageCount": page_count,
                "estimatedTopics": estimated_topics,
                "estimatedQuestionCount": estimated_questions,
                "questionPaperDetection": question_paper_detection
            }
        except Exception as e:
            logger.error(f"Document preview failed: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Document preview failed: {str(e)}")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in preview: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/api/process-document", response_model=ProcessedContent)
async def process_document(
    file: UploadFile = File(...),
    config: str = Form(...),
    user_id: Optional[str] = Form(None)
):
    """
    Process uploaded document and generate study materials
    """
    try:
        # Parse configuration
        try:
            request_data = json.loads(config)
            request = DocumentProcessingRequest(**request_data)
        except Exception as e:
            logger.error(f"Configuration parsing error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid configuration: {str(e)}")
        
        # Validate file extension
        file_extension = file.filename.split('.')[-1].lower() if file.filename else ''
        if file_extension not in settings.allowed_extensions:
            logger.warning(f"Invalid file extension: {file_extension}")
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(settings.allowed_extensions)}"
            )
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Check file size
        max_size_bytes = settings.max_upload_size_mb * 1024 * 1024
        if file_size > max_size_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.max_upload_size_mb}MB"
            )
        
        # Update document metadata
        request.document_metadata.file_size = file_size
        request.document_metadata.title = request.document_metadata.title or file.filename
        
        # Map file extension to document type
        doc_type_map = {
            'pdf': 'pdf',
            'docx': 'docx',
            'txt': 'txt',
            'png': 'image',
            'jpg': 'image',
            'jpeg': 'image'
        }
        request.document_type = doc_type_map.get(file_extension, 'txt')
        
        # Process document to extract text
        try:
            logger.info(f"Processing document: {file.filename} ({file_extension})")
            document_text, page_count = document_processor.process_document(
                file_content,
                file_extension
            )
            request.document_metadata.page_count = page_count
            logger.info(f"Document processed: {page_count} pages, {len(document_text)} characters")
        except Exception as e:
            logger.error(f"Document processing failed: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")
        
        # Generate session ID if not provided
        if not request.session_id:
            request.session_id = str(uuid.uuid4())
        
        # Generate study materials using Gemini
        try:
            logger.info(f"Generating study materials with Gemini for session: {request.session_id}")
            result = gemini_processor.generate_study_materials(
                document_text,
                request,
                page_count
            )
            logger.info(f"Study materials generated successfully: {len(result.multiple_choice_questions)} MC, {len(result.flashcards)} flashcards")
            
            # Track document for authenticated users
            if user_id:
                try:
                    from datetime import datetime
                    from .auth_manager import auth_manager
                    doc_history = DocumentHistory(
                        document_id=request.session_id,
                        title=file.filename or "Untitled",
                        upload_date=datetime.now(),
                        document_type=request.document_type,
                        page_count=page_count
                    )
                    auth_manager.add_document(user_id, doc_history)
                    logger.info(f"Document tracked for user {user_id}")
                except Exception as track_error:
                    logger.warning(f"Failed to track document: {str(track_error)}")
            
            return result
        except Exception as e:
            logger.error(f"AI processing failed: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/api/answer-question-paper", response_model=AnsweredQuestionPaper)
async def answer_question_paper(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None)
):
    """
    Process a question paper and generate AI answers for all questions
    """
    try:
        # Validate file
        file_extension = file.filename.split('.')[-1].lower() if file.filename else ''
        if file_extension not in settings.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(settings.allowed_extensions)}"
            )
        
        # Read and validate file size
        file_content = await file.read()
        file_size = len(file_content)
        max_size_bytes = settings.max_upload_size_mb * 1024 * 1024
        if file_size > max_size_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.max_upload_size_mb}MB"
            )
        
        # Extract text from document
        try:
            logger.info(f"Processing question paper: {file.filename}")
            document_text, page_count = document_processor.process_document(
                file_content,
                file_extension
            )
            logger.info(f"Question paper extracted: {page_count} pages, {len(document_text)} characters")
        except Exception as e:
            logger.error(f"Document processing failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")
        
        # Detect if it's actually a question paper
        detection_result = gemini_processor.detect_question_paper(document_text)
        
        if not detection_result.get("is_question_paper") or detection_result.get("confidence") == "low":
            logger.warning(f"Document may not be a question paper: {detection_result.get('reason')}")
            # Proceed anyway but log the warning
        
        # Generate answers
        try:
            logger.info("Generating AI answers for question paper...")
            result = gemini_processor.answer_question_paper(
                document_text,
                file.filename,
                detection_result
            )
            logger.info(f"Answers generated for {result.get('total_questions', 0)} questions")
            
            # Track for authenticated users
            if user_id:
                try:
                    from datetime import datetime
                    from .auth_manager import auth_manager
                    doc_history = DocumentHistory(
                        document_id=result.get('session_id', str(uuid.uuid4())),
                        title=file.filename or "Question Paper",
                        upload_date=datetime.now(),
                        document_type="question_paper",
                        page_count=page_count
                    )
                    auth_manager.add_document(user_id, doc_history)
                    logger.info(f"Question paper tracked for user {user_id}")
                except Exception as track_error:
                    logger.warning(f"Failed to track question paper: {str(track_error)}")
            
            return result
        except Exception as e:
            # Detect rate-limit / resource exhausted errors (e.g., Vertex AI 429)
            err_text = str(e) or ""
            logger.error(f"Answer generation failed: {err_text}")
            lower_err = err_text.lower()
            if "429" in err_text or "resource exhausted" in lower_err or "exhausted" in lower_err or "quota" in lower_err or "rate limit" in lower_err:
                # Return a generic server-busy message to the client
                raise HTTPException(status_code=503, detail="Server busy")
            # Fallback to internal error for other exceptions
            raise HTTPException(status_code=500, detail=f"Answer generation failed: {err_text}")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/api/supported-formats")
async def get_supported_formats():
    """Get list of supported document formats"""
    return {
        "formats": settings.allowed_extensions,
        "max_size_mb": settings.max_upload_size_mb
    }

@app.post("/api/submit-quiz", response_model=PerformanceAnalysisResponse)
async def submit_quiz(attempt: QuizAttemptRecord):
    """
    Submit quiz attempt and receive performance analysis
    Implements adaptive difficulty system from prompt.json
    """
    try:
        # Convert to QuizAttempt for processing
        quiz_attempt = QuizAttempt(
            session_id=attempt.session_id,
            timestamp=datetime.now(),
            topic=attempt.topic,
            difficulty=attempt.difficulty,
            total_questions=attempt.total_questions,
            correct_answers=attempt.correct_answers,
            score_percentage=attempt.score_percentage,
            questions_by_topic=attempt.questions_by_topic
        )
        
        # Get performance analysis
        analysis = performance_tracker.analyze_performance(
            attempt.session_id,
            quiz_attempt
        )
        
        logger.info(f"Quiz submitted: {attempt.session_id}, score: {attempt.score_percentage}%, next difficulty: {analysis.next_difficulty}")
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error processing quiz submission: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing quiz: {str(e)}")

@app.get("/api/performance-analysis/{session_id}")
async def get_performance_analysis(session_id: str):
    """Get performance analysis and learning gaps for a user"""
    try:
        gap_analysis = performance_tracker.get_gap_analysis(session_id)
        return gap_analysis
    except Exception as e:
        logger.error(f"Error getting performance analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving analysis: {str(e)}")

@app.post("/api/question-feedback")
async def get_question_feedback(
    question: str = Form(...),
    user_answer: str = Form(...),
    correct_answer: str = Form(...),
    explanation: str = Form(...),
    is_correct: bool = Form(...)
):
    """
    Get detailed feedback for a specific question
    Uses culturally appropriate feedback from prompt.json
    """
    try:
        if is_correct:
            feedback = feedback_generator.generate_correct_feedback(
                question=question,
                correct_answer=correct_answer,
                explanation=explanation
            )
        else:
            feedback = feedback_generator.generate_incorrect_feedback(
                question=question,
                user_answer=user_answer,
                correct_answer=correct_answer,
                explanation=explanation
            )
        
        return feedback
        
    except Exception as e:
        logger.error(f"Error generating feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating feedback: {str(e)}")

# Authentication Endpoints
@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        user_profile = auth_manager.register_user(
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name
        )
        
        access_token = auth_manager.create_access_token(
            user_id=user_profile.user_id,
            email=user_profile.email
        )
        
        logger.info(f"New user registered: {user_profile.email}")
        
        return Token(
            access_token=access_token,
            user=user_profile
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login user"""
    try:
        user_profile = auth_manager.authenticate_user(
            email=credentials.email,
            password=credentials.password
        )
        
        if not user_profile:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        access_token = auth_manager.create_access_token(
            user_id=user_profile.user_id,
            email=user_profile.email
        )
        
        logger.info(f"User logged in: {user_profile.email}")
        
        return Token(
            access_token=access_token,
            user=user_profile
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.get("/api/auth/me")
async def get_current_user(authorization: str = Form(...)):
    """Get current user profile from token"""
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        payload = auth_manager.verify_token(token)
        
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        user_profile = auth_manager.get_user_by_id(payload["sub"])
        if not user_profile:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user_profile
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user profile")

@app.get("/api/user/stats/{user_id}")
async def get_user_statistics(user_id: str):
    """Get comprehensive user statistics"""
    try:
        stats = auth_manager.get_user_stats(user_id)
        if not stats:
            raise HTTPException(status_code=404, detail="User not found")
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get stats error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user statistics")

# Chat Endpoints
@app.post("/api/chat/message", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest):
    """
    Send a message to the AI Study Assistant
    Supports: Document Q&A, YouTube analysis, Image generation, Note generation, Recommendations
    """
    try:
        # Get user stats if user_id is provided
        user_stats = None
        if request.user_id:
            try:
                stats = auth_manager.get_user_stats(request.user_id)
                if stats:
                    user_stats = {
                        'total_quizzes': stats.total_quizzes,
                        'average_score': stats.average_score,
                        'current_streak': stats.current_streak,
                        'recent_quizzes': [
                            {'topic': q.topic, 'score': q.score}
                            for q in stats.recent_quizzes
                        ],
                        'performance_by_topic': stats.performance_by_topic
                    }
            except Exception as e:
                logger.warning(f"Could not get user stats: {str(e)}")
        
        # Save user message to database
        if request.user_id:
            try:
                auth_manager.save_chat_message(
                    user_id=request.user_id,
                    role="user",
                    content=request.message,
                    session_id=request.session_id
                )
            except Exception as e:
                logger.warning(f"Failed to save user message: {str(e)}")
        
        # Process with AI agent
        result = ai_agent.process_message(
            session_id=request.session_id,
            user_id=request.user_id,
            message=request.message,
            conversation_history=request.conversation_history,
            user_stats=user_stats
        )
        
        # Save AI response to database
        if request.user_id:
            try:
                auth_manager.save_chat_message(
                    user_id=request.user_id,
                    role="assistant",
                    content=result['message'],
                    session_id=request.session_id
                )
            except Exception as e:
                logger.warning(f"Failed to save AI response: {str(e)}")
        
        return ChatResponse(
            message=result['message'],
            session_id=request.session_id,
            timestamp=datetime.now(),
            related_concepts=[],
            confidence="high"
        )
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.get("/api/chat/history/{session_id}")
async def get_chat_history(session_id: str, user_id: Optional[str] = None):
    """Get chat history for a session from database"""
    try:
        messages = []
        
        # Try to get from database first if user_id provided
        if user_id:
            try:
                messages = auth_manager.get_chat_history(user_id, session_id)
            except Exception as e:
                logger.warning(f"Failed to get chat history from database: {str(e)}")
        
        # Fallback to chat_processor if no messages found
        if not messages:
            try:
                history = chat_processor.get_chat_history(session_id)
                if history and hasattr(history, 'messages'):
                    messages = [
                        {
                            "role": msg.role,
                            "content": msg.content,
                            "timestamp": msg.timestamp
                        }
                        for msg in history.messages
                    ]
            except Exception as e:
                logger.warning(f"Failed to get from chat_processor: {str(e)}")
        
        return {
            "messages": messages,
            "session_id": session_id
        }
        
    except Exception as e:
        logger.error(f"Get chat history error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get chat history")

@app.post("/api/chat/context")
async def set_chat_context(
    session_id: str = Form(...),
    document_text: str = Form(...),
    document_title: str = Form(...)
):
    """Set document context for chat session"""
    try:
        # Set context in both processors for compatibility
        chat_processor.set_document_context(session_id, document_text, document_title)
        ai_agent.set_document_context(session_id, document_text, document_title)
        return {"status": "success", "message": "Chat context set"}
        
    except Exception as e:
        logger.error(f"Set context error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to set chat context")

if __name__ == "__main__":
    import uvicorn
    # When running under different entry modes the import path changes.
    # If __package__ is set (module run: python -m backend.main) use that package
    # otherwise use the local module name so running `python main.py` still works.
    module_target = f"{__package__}.main:app" if __package__ else "main:app"
    uvicorn.run(
        module_target,
        host=settings.backend_host,
        port=settings.backend_port,
        reload=True
    )

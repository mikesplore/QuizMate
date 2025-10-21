from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
from typing import Optional
import json
import logging
import traceback

from .config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
from .models import (
    DocumentProcessingRequest,
    ProcessedContent,
    ErrorResponse
)
from .document_processor import DocumentProcessor
from .gemini_processor import GeminiProcessor

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
            
            logger.info(f"Document preview generated: {word_count} words, {page_count} pages")
            
            return {
                "text": preview_text,
                "wordCount": word_count,
                "pageCount": page_count,
                "estimatedTopics": estimated_topics,
                "estimatedQuestionCount": estimated_questions
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
    config: str = Form(...)
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
            return result
        except Exception as e:
            logger.error(f"AI processing failed: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")
    
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=True
    )

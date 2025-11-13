"""
Chat models for document Q&A assistant
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = datetime.now()

class ChatRequest(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    message: str
    conversation_history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    message: str
    session_id: str
    timestamp: datetime
    related_concepts: Optional[List[str]] = None
    confidence: str = "high"  # high, medium, low
    
class ChatHistory(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    document_title: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime

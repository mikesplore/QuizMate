"""
User authentication and management models for QuizMate
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    user_id: str
    email: EmailStr
    full_name: str
    created_at: datetime
    last_login: Optional[datetime] = None
    avatar_url: Optional[str] = None
    study_streak: int = 0
    last_study_date: Optional[date] = None
    total_documents_uploaded: int = 0
    total_quizzes_taken: int = 0
    average_score: float = 0.0

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class DocumentHistory(BaseModel):
    document_id: str
    user_id: str
    filename: str
    upload_date: datetime
    document_type: str
    session_id: str
    topics: List[str] = []
    
class QuizHistory(BaseModel):
    quiz_id: str
    user_id: str
    document_id: str
    quiz_date: datetime
    score: float
    total_questions: int
    correct_answers: int
    difficulty: str
    topics: List[str] = []

class UserStats(BaseModel):
    user_id: str
    total_documents: int
    total_quizzes: int
    average_score: float
    current_streak: int
    longest_streak: int
    recent_documents: List[DocumentHistory]
    recent_quizzes: List[QuizHistory]
    performance_by_topic: dict
    weekly_activity: List[dict]  # Last 7 days activity

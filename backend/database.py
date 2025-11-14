"""
Database configuration and models using SQLAlchemy
"""

from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Date, Text, JSON, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Database setup
DATABASE_DIR = os.path.join(os.path.dirname(__file__), "storage")
os.makedirs(DATABASE_DIR, exist_ok=True)
DATABASE_URL = f"sqlite:///{os.path.join(DATABASE_DIR, 'quizmate.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    user_id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)
    last_login = Column(DateTime)
    avatar_url = Column(String(500))
    study_streak = Column(Integer, default=0)
    last_study_date = Column(Date)
    total_documents_uploaded = Column(Integer, default=0)
    total_quizzes_taken = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    
    # Relationships
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="user", cascade="all, delete-orphan")
    chats = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    generated_content = relationship("GeneratedContent", back_populates="user", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    title = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.now)
    document_type = Column(String, nullable=False)
    page_count = Column(Integer, default=0)
    file_path = Column(String, nullable=True)  # Store file path for retrieval
    
    # Relationships
    user = relationship("User", back_populates="documents")
    generated_content = relationship("GeneratedContent", back_populates="document", cascade="all, delete-orphan")


class GeneratedContent(Base):
    """Stores all generated quizzes, flashcards, notes, and answers"""
    __tablename__ = "generated_content"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    document_id = Column(String, ForeignKey("documents.document_id"), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.now)
    content_type = Column(String, nullable=False)  # 'quiz', 'flashcards', 'notes', 'answers'
    
    # Generated content stored as JSON
    multiple_choice_questions = Column(JSON, nullable=True)
    true_false_questions = Column(JSON, nullable=True)
    short_answer_questions = Column(JSON, nullable=True)
    flashcards = Column(JSON, nullable=True)
    study_notes = Column(JSON, nullable=True)
    key_concepts = Column(JSON, nullable=True)
    answered_questions = Column(JSON, nullable=True)  # For question paper answers
    
    # Configuration used
    difficulty = Column(String, nullable=True)
    exam_format = Column(String, nullable=True)
    topics_covered = Column(JSON, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="generated_content")
    document = relationship("Document", back_populates="generated_content")


class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    session_id = Column(String, nullable=True)  # Link to generated content
    
    quiz_date = Column(DateTime, default=datetime.now)
    topic = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    topics = Column(JSON, nullable=True)
    
    # Detailed results
    questions_attempted = Column(JSON, nullable=True)  # Store all Q&A
    time_taken = Column(Integer, nullable=True)  # seconds
    difficulty = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="quizzes")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    session_id = Column(String, index=True, nullable=False)
    
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.now)
    
    # Additional metadata
    message_type = Column(String, nullable=True)  # 'document_qa', 'youtube', 'general', etc.
    related_document_id = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="chats")


# Create all tables
def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

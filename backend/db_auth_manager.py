"""
User authentication and session management with SQLAlchemy
"""

from datetime import datetime, timedelta, date
from typing import Optional, Dict, List
import jwt
from passlib.context import CryptContext
import uuid
from sqlalchemy.orm import Session
from database import User, Document, Quiz, ChatMessage, GeneratedContent, get_db
from auth_models import UserProfile, DocumentHistory, QuizHistory, UserStats

# Security configuration
SECRET_KEY = "your-secret-key-change-in-production"  # Should be in environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
MAX_BCRYPT_BYTES = 72


class DatabaseAuthManager:
    """Manage user authentication with SQLAlchemy database"""
    
    def __init__(self):
        pass
    
    def hash_password(self, password: str) -> str:
        """Hash a password (truncate to 72 bytes for bcrypt)"""
        password = password.encode("utf-8")[:MAX_BCRYPT_BYTES].decode("utf-8", "ignore")
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash (truncate to 72 bytes for bcrypt)"""
        plain_password = plain_password.encode("utf-8")[:MAX_BCRYPT_BYTES].decode("utf-8", "ignore")
        return pwd_context.verify(plain_password, hashed_password)
    
    def create_access_token(self, user_id: str, email: str) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {
            "sub": user_id,
            "email": email,
            "exp": expire
        }
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[dict]:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.JWTError:
            return None
    
    def register_user(self, email: str, password: str, full_name: str, db: Session) -> UserProfile:
        """Register a new user"""
        # Check if user exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise ValueError("Email already registered")
        
        user_id = str(uuid.uuid4())
        hashed_password = self.hash_password(password)
        
        # Create new user
        db_user = User(
            user_id=user_id,
            email=email,
            password=hashed_password,
            full_name=full_name,
            created_at=datetime.now(),
            last_login=None,
            avatar_url=None,
            study_streak=0,
            last_study_date=None,
            total_documents_uploaded=0,
            total_quizzes_taken=0,
            average_score=0.0
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return self._user_to_profile(db_user)
    
    def authenticate_user(self, email: str, password: str, db: Session) -> Optional[UserProfile]:
        """Authenticate user with email and password"""
        db_user = db.query(User).filter(User.email == email).first()
        if not db_user:
            return None
        
        if not self.verify_password(password, db_user.password):
            return None
        
        # Update last login and streak
        db_user.last_login = datetime.now()
        self._update_streak(db_user)
        
        db.commit()
        db.refresh(db_user)
        
        return self._user_to_profile(db_user)
    
    def get_user_by_id(self, user_id: str, db: Session) -> Optional[UserProfile]:
        """Get user profile by ID"""
        db_user = db.query(User).filter(User.user_id == user_id).first()
        if not db_user:
            return None
        return self._user_to_profile(db_user)
    
    def _update_streak(self, db_user: User) -> None:
        """Update user's study streak"""
        today = date.today()
        last_study = db_user.last_study_date if db_user.last_study_date else None
        
        if last_study is None:
            db_user.study_streak = 1
        elif last_study == today:
            pass  # Already studied today
        elif last_study == today - timedelta(days=1):
            db_user.study_streak += 1
        else:
            db_user.study_streak = 1
        
        db_user.last_study_date = date.today()
    
    def add_document(self, user_id: str, document: DocumentHistory, db: Session) -> None:
        """Add document to user's history"""
        db_doc = Document(
            document_id=document.document_id,
            user_id=user_id,
            title=document.filename,
            upload_date=document.upload_date,
            document_type=document.document_type,
            page_count=document.page_count
        )
        
        db.add(db_doc)
        
        # Update user stats
        db_user = db.query(User).filter(User.user_id == user_id).first()
        if db_user:
            db_user.total_documents_uploaded += 1
            self._update_streak(db_user)
        
        db.commit()
    
    def save_generated_content(
        self, 
        session_id: str,
        user_id: str,
        document_id: Optional[str],
        content_data: dict,
        db: Session
    ) -> None:
        """Save generated quiz/flashcards/notes/answers"""
        content = GeneratedContent(
            session_id=session_id,
            user_id=user_id,
            document_id=document_id,
            created_at=datetime.now(),
            content_type=content_data.get('content_type', 'quiz'),
            multiple_choice_questions=content_data.get('multiple_choice_questions'),
            true_false_questions=content_data.get('true_false_questions'),
            short_answer_questions=content_data.get('short_answer_questions'),
            flashcards=content_data.get('flashcards'),
            study_notes=content_data.get('study_notes'),
            key_concepts=content_data.get('key_concepts'),
            answered_questions=content_data.get('answered_questions'),
            difficulty=content_data.get('difficulty'),
            exam_format=content_data.get('exam_format'),
            topics_covered=content_data.get('topics_covered')
        )
        
        db.add(content)
        db.commit()
    
    def get_generated_content(self, session_id: str, db: Session) -> Optional[dict]:
        """Retrieve previously generated content"""
        content = db.query(GeneratedContent).filter(
            GeneratedContent.session_id == session_id
        ).first()
        
        if not content:
            return None
        
        return {
            'session_id': content.session_id,
            'content_type': content.content_type,
            'created_at': content.created_at.isoformat(),
            'multiple_choice_questions': content.multiple_choice_questions,
            'true_false_questions': content.true_false_questions,
            'short_answer_questions': content.short_answer_questions,
            'flashcards': content.flashcards,
            'study_notes': content.study_notes,
            'key_concepts': content.key_concepts,
            'answered_questions': content.answered_questions,
            'difficulty': content.difficulty,
            'exam_format': content.exam_format,
            'topics_covered': content.topics_covered
        }
    
    def get_user_generated_content(self, user_id: str, db: Session, limit: int = 20) -> List[dict]:
        """Get all generated content for a user"""
        contents = db.query(GeneratedContent).filter(
            GeneratedContent.user_id == user_id
        ).order_by(GeneratedContent.created_at.desc()).limit(limit).all()
        
        return [
            {
                'session_id': c.session_id,
                'content_type': c.content_type,
                'created_at': c.created_at.isoformat(),
                'document_id': c.document_id,
                'difficulty': c.difficulty,
                'exam_format': c.exam_format
            }
            for c in contents
        ]
    
    def add_quiz_result(self, user_id: str, quiz: QuizHistory, db: Session) -> None:
        """Add quiz result to user's history"""
        db_quiz = Quiz(
            quiz_id=quiz.quiz_id,
            user_id=user_id,
            quiz_date=quiz.quiz_date,
            topic=quiz.topic,
            score=quiz.score,
            total_questions=quiz.total_questions,
            topics=quiz.topics
        )
        
        db.add(db_quiz)
        
        # Update user stats
        db_user = db.query(User).filter(User.user_id == user_id).first()
        if db_user:
            db_user.total_quizzes_taken += 1
            
            # Recalculate average score
            all_quizzes = db.query(Quiz).filter(Quiz.user_id == user_id).all()
            if all_quizzes:
                total_score = sum(q.score for q in all_quizzes)
                db_user.average_score = total_score / len(all_quizzes)
            
            self._update_streak(db_user)
        
        db.commit()
    
    def save_chat_message(
        self, 
        user_id: str, 
        role: str, 
        content: str, 
        session_id: str,
        message_type: Optional[str] = None,
        db: Session = None
    ) -> None:
        """Save a chat message"""
        db_message = ChatMessage(
            user_id=user_id,
            session_id=session_id,
            role=role,
            content=content,
            timestamp=datetime.now(),
            message_type=message_type
        )
        
        db.add(db_message)
        db.commit()
    
    def get_chat_history(
        self, 
        user_id: str, 
        session_id: Optional[str] = None,
        limit: int = 50,
        db: Session = None
    ) -> List[dict]:
        """Get chat history for a user"""
        query = db.query(ChatMessage).filter(ChatMessage.user_id == user_id)
        
        if session_id:
            query = query.filter(ChatMessage.session_id == session_id)
        
        messages = query.order_by(ChatMessage.timestamp.desc()).limit(limit).all()
        messages.reverse()  # Oldest first
        
        return [
            {
                'role': msg.role,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'session_id': msg.session_id,
                'message_type': msg.message_type
            }
            for msg in messages
        ]
    
    def get_user_stats(self, user_id: str, db: Session) -> Optional[UserStats]:
        """Get comprehensive user statistics"""
        db_user = db.query(User).filter(User.user_id == user_id).first()
        if not db_user:
            return None
        
        # Get documents
        documents = db.query(Document).filter(Document.user_id == user_id).order_by(
            Document.upload_date.desc()
        ).limit(10).all()
        
        # Get quizzes
        quizzes = db.query(Quiz).filter(Quiz.user_id == user_id).order_by(
            Quiz.quiz_date.desc()
        ).limit(10).all()
        
        # Convert to response models with topics from generated content
        recent_documents = []
        for doc in documents:
            # Get topics from associated generated content
            gen_content = db.query(GeneratedContent).filter(
                GeneratedContent.document_id == doc.document_id
            ).first()
            topics = gen_content.topics_covered if gen_content and gen_content.topics_covered else []
            
            recent_documents.append(
                DocumentHistory(
                    document_id=doc.document_id,
                    filename=doc.title,
                    upload_date=doc.upload_date,
                    document_type=doc.document_type,
                    page_count=doc.page_count,
                    topics=topics if isinstance(topics, list) else []
                )
            )
        
        recent_quizzes = [
            QuizHistory(
                quiz_id=quiz.quiz_id,
                quiz_date=quiz.quiz_date,
                topic=quiz.topic,
                score=quiz.score,
                total_questions=quiz.total_questions,
                topics=quiz.topics or []
            )
            for quiz in quizzes
        ]
        
        # Calculate performance by topic
        all_quizzes = db.query(Quiz).filter(Quiz.user_id == user_id).all()
        performance_by_topic = {}
        for quiz in all_quizzes:
            if quiz.topics:
                for topic in quiz.topics:
                    if topic not in performance_by_topic:
                        performance_by_topic[topic] = {"total": 0, "score_sum": 0}
                    performance_by_topic[topic]["total"] += 1
                    performance_by_topic[topic]["score_sum"] += quiz.score
        
        for topic in performance_by_topic:
            total = performance_by_topic[topic]["total"]
            if total > 0:
                performance_by_topic[topic] = performance_by_topic[topic]["score_sum"] / total
        
        # Weekly activity
        weekly_activity = []
        today = date.today()
        for i in range(7):
            day = today - timedelta(days=i)
            day_start = datetime.combine(day, datetime.min.time())
            day_end = datetime.combine(day, datetime.max.time())
            
            day_quizzes = db.query(Quiz).filter(
                Quiz.user_id == user_id,
                Quiz.quiz_date >= day_start,
                Quiz.quiz_date <= day_end
            ).all()
            
            weekly_activity.append({
                "date": day.isoformat(),
                "quizzes": len(day_quizzes),
                "avg_score": sum(q.score for q in day_quizzes) / len(day_quizzes) if day_quizzes else 0
            })
        
        return UserStats(
            user_id=user_id,
            total_documents=db_user.total_documents_uploaded,
            total_quizzes=db_user.total_quizzes_taken,
            average_score=db_user.average_score,
            current_streak=db_user.study_streak,
            longest_streak=db_user.study_streak,  # Simplified
            recent_documents=recent_documents,
            recent_quizzes=recent_quizzes,
            performance_by_topic=performance_by_topic,
            weekly_activity=weekly_activity
        )
    
    def _user_to_profile(self, db_user: User) -> UserProfile:
        """Convert database user to UserProfile"""
        return UserProfile(
            user_id=db_user.user_id,
            email=db_user.email,
            password=db_user.password,
            full_name=db_user.full_name,
            created_at=db_user.created_at,
            last_login=db_user.last_login,
            avatar_url=db_user.avatar_url,
            study_streak=db_user.study_streak,
            last_study_date=db_user.last_study_date,
            total_documents_uploaded=db_user.total_documents_uploaded,
            total_quizzes_taken=db_user.total_quizzes_taken,
            average_score=db_user.average_score
        )


# Global instance
db_auth_manager = DatabaseAuthManager()

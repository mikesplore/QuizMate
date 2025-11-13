"""
User authentication and session management for QuizMate
"""

from datetime import datetime, timedelta, date
from typing import Optional, Dict, List
import jwt
from passlib.context import CryptContext
import uuid
import json
import os
from auth_models import UserProfile, DocumentHistory, QuizHistory, UserStats

# Security configuration
SECRET_KEY = "your-secret-key-change-in-production"  # Should be in environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
MAX_BCRYPT_BYTES = 72

# Storage paths
STORAGE_DIR = os.path.join(os.path.dirname(__file__), "storage")
USERS_FILE = os.path.join(STORAGE_DIR, "users.json")
DOCUMENTS_FILE = os.path.join(STORAGE_DIR, "documents.json")
QUIZZES_FILE = os.path.join(STORAGE_DIR, "quizzes.json")
CHATS_FILE = os.path.join(STORAGE_DIR, "chats.json")

class AuthManager:
    """Manage user authentication and session data"""
    
    def __init__(self):
        # Ensure storage directory exists
        os.makedirs(STORAGE_DIR, exist_ok=True)
        
        # In-memory storage (loaded from files)
        self.users: Dict[str, dict] = {}  # email -> user_data
        self.user_ids: Dict[str, dict] = {}  # user_id -> user_data
        self.document_history: Dict[str, List[DocumentHistory]] = {}  # user_id -> documents
        self.quiz_history: Dict[str, List[QuizHistory]] = {}  # user_id -> quizzes
        self.chat_history: Dict[str, List[dict]] = {}  # user_id -> chat messages
        
        # Load existing data from files
        self._load_from_storage()
    
    def _load_from_storage(self):
        """Load user data from JSON files"""
        try:
            # Load users
            if os.path.exists(USERS_FILE):
                with open(USERS_FILE, 'r') as f:
                    users_data = json.load(f)
                    for email, user_data in users_data.items():
                        # Convert string dates back to datetime/date objects
                        if 'created_at' in user_data and user_data['created_at']:
                            user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
                        if 'last_login' in user_data and user_data['last_login']:
                            user_data['last_login'] = datetime.fromisoformat(user_data['last_login'])
                        if 'last_study_date' in user_data and user_data['last_study_date']:
                            user_data['last_study_date'] = date.fromisoformat(user_data['last_study_date'])
                        
                        self.users[email] = user_data
                        self.user_ids[user_data['user_id']] = user_data
            
            # Load documents
            if os.path.exists(DOCUMENTS_FILE):
                with open(DOCUMENTS_FILE, 'r') as f:
                    docs_data = json.load(f)
                    for user_id, docs in docs_data.items():
                        self.document_history[user_id] = [
                            DocumentHistory(**{**doc, 'upload_date': datetime.fromisoformat(doc['upload_date'])})
                            for doc in docs
                        ]
            
            # Load quizzes
            if os.path.exists(QUIZZES_FILE):
                with open(QUIZZES_FILE, 'r') as f:
                    quiz_data = json.load(f)
                    for user_id, quizzes in quiz_data.items():
                        self.quiz_history[user_id] = [
                            QuizHistory(**{**quiz, 'quiz_date': datetime.fromisoformat(quiz['quiz_date'])})
                            for quiz in quizzes
                        ]
            
            # Load chats
            if os.path.exists(CHATS_FILE):
                with open(CHATS_FILE, 'r') as f:
                    self.chat_history = json.load(f)
                    
        except Exception as e:
            print(f"Error loading from storage: {str(e)}")
    
    def _save_to_storage(self):
        """Save all data to JSON files"""
        try:
            # Save users (serialize datetime/date objects)
            users_to_save = {}
            for email, user_data in self.users.items():
                serialized = user_data.copy()
                if 'created_at' in serialized and serialized['created_at']:
                    serialized['created_at'] = serialized['created_at'].isoformat()
                if 'last_login' in serialized and serialized['last_login']:
                    serialized['last_login'] = serialized['last_login'].isoformat()
                if 'last_study_date' in serialized and serialized['last_study_date']:
                    serialized['last_study_date'] = serialized['last_study_date'].isoformat()
                users_to_save[email] = serialized
            
            with open(USERS_FILE, 'w') as f:
                json.dump(users_to_save, f, indent=2)
            
            # Save documents
            docs_to_save = {}
            for user_id, docs in self.document_history.items():
                docs_to_save[user_id] = [
                    {
                        'document_id': doc.document_id,
                        'title': doc.title,
                        'upload_date': doc.upload_date.isoformat(),
                        'document_type': doc.document_type,
                        'page_count': doc.page_count
                    }
                    for doc in docs
                ]
            
            with open(DOCUMENTS_FILE, 'w') as f:
                json.dump(docs_to_save, f, indent=2)
            
            # Save quizzes
            quizzes_to_save = {}
            for user_id, quizzes in self.quiz_history.items():
                quizzes_to_save[user_id] = [
                    {
                        'quiz_id': quiz.quiz_id,
                        'quiz_date': quiz.quiz_date.isoformat(),
                        'topic': quiz.topic,
                        'score': quiz.score,
                        'total_questions': quiz.total_questions,
                        'topics': quiz.topics
                    }
                    for quiz in quizzes
                ]
            
            with open(QUIZZES_FILE, 'w') as f:
                json.dump(quizzes_to_save, f, indent=2)
            
            # Save chats
            with open(CHATS_FILE, 'w') as f:
                json.dump(self.chat_history, f, indent=2)
                
        except Exception as e:
            print(f"Error saving to storage: {str(e)}")
    

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
    
    def register_user(self, email: str, password: str, full_name: str) -> UserProfile:
        """Register a new user"""
        if email in self.users:
            raise ValueError("Email already registered")
        
        user_id = str(uuid.uuid4())
        hashed_password = self.hash_password(password)
        
        user_data = {
            "user_id": user_id,
            "email": email,
            "password": hashed_password,
            "full_name": full_name,
            "created_at": datetime.now(),
            "last_login": None,
            "avatar_url": None,
            "study_streak": 0,
            "last_study_date": None,
            "total_documents_uploaded": 0,
            "total_quizzes_taken": 0,
            "average_score": 0.0
        }
        
        self.users[email] = user_data
        self.user_ids[user_id] = user_data
        self.document_history[user_id] = []
        self.quiz_history[user_id] = []
        
        # Save to storage
        self._save_to_storage()
        
        return UserProfile(**user_data)
    
    def authenticate_user(self, email: str, password: str) -> Optional[UserProfile]:
        """Authenticate user with email and password"""
        user_data = self.users.get(email)
        if not user_data:
            return None
        
        if not self.verify_password(password, user_data["password"]):
            return None
        
        # Update last login and streak
        user_data["last_login"] = datetime.now()
        self._update_streak(user_data)
        
        # Save to storage
        self._save_to_storage()
        
        return UserProfile(**user_data)
    
    def get_user_by_id(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by ID"""
        user_data = self.user_ids.get(user_id)
        if not user_data:
            return None
        return UserProfile(**user_data)
    
    def _update_streak(self, user_data: dict) -> None:
        """Update user's study streak"""
        today = date.today()
        last_study = user_data.get("last_study_date")
        
        if last_study is None:
            # First time studying
            user_data["study_streak"] = 1
        elif last_study == today:
            # Already studied today, no change
            pass
        elif last_study == today - timedelta(days=1):
            # Studied yesterday, increment streak
            user_data["study_streak"] += 1
        else:
            # Streak broken, reset to 1
            user_data["study_streak"] = 1
        
        user_data["last_study_date"] = today
    
    def add_document(self, user_id: str, document: DocumentHistory) -> None:
        """Add document to user's history"""
        if user_id not in self.document_history:
            self.document_history[user_id] = []
        
        self.document_history[user_id].append(document)
        
        # Update user stats
        user_data = self.user_ids.get(user_id)
        if user_data:
            user_data["total_documents_uploaded"] += 1
            self._update_streak(user_data)
        
        # Save to storage
        self._save_to_storage()
    
    def add_quiz_result(self, user_id: str, quiz: QuizHistory) -> None:
        """Add quiz result to user's history"""
        if user_id not in self.quiz_history:
            self.quiz_history[user_id] = []
        
        self.quiz_history[user_id].append(quiz)
        
        # Update user stats
        user_data = self.user_ids.get(user_id)
        if user_data:
            user_data["total_quizzes_taken"] += 1
            
            # Recalculate average score
            all_quizzes = self.quiz_history[user_id]
            if all_quizzes:
                total_score = sum(q.score for q in all_quizzes)
                user_data["average_score"] = total_score / len(all_quizzes)
            
            self._update_streak(user_data)
        
        # Save to storage
        self._save_to_storage()
    
    def get_user_stats(self, user_id: str) -> Optional[UserStats]:
        """Get comprehensive user statistics"""
        user_data = self.user_ids.get(user_id)
        if not user_data:
            return None
        
        documents = self.document_history.get(user_id, [])
        quizzes = self.quiz_history.get(user_id, [])
        
        # Get recent documents (last 10)
        recent_documents = sorted(documents, key=lambda x: x.upload_date, reverse=True)[:10]
        
        # Get recent quizzes (last 10)
        recent_quizzes = sorted(quizzes, key=lambda x: x.quiz_date, reverse=True)[:10]
        
        # Calculate performance by topic
        performance_by_topic = {}
        for quiz in quizzes:
            for topic in quiz.topics:
                if topic not in performance_by_topic:
                    performance_by_topic[topic] = {"total": 0, "score_sum": 0}
                performance_by_topic[topic]["total"] += 1
                performance_by_topic[topic]["score_sum"] += quiz.score
        
        # Calculate average per topic
        for topic in performance_by_topic:
            total = performance_by_topic[topic]["total"]
            if total > 0:
                performance_by_topic[topic] = performance_by_topic[topic]["score_sum"] / total
        
        # Calculate weekly activity (last 7 days)
        weekly_activity = []
        today = date.today()
        for i in range(7):
            day = today - timedelta(days=i)
            day_quizzes = [q for q in quizzes if q.quiz_date.date() == day]
            weekly_activity.append({
                "date": day.isoformat(),
                "quizzes": len(day_quizzes),
                "avg_score": sum(q.score for q in day_quizzes) / len(day_quizzes) if day_quizzes else 0
            })
        
        # Calculate longest streak (simplified - would need to store historical data)
        longest_streak = user_data["study_streak"]
        
        return UserStats(
            user_id=user_id,
            total_documents=len(documents),
            total_quizzes=len(quizzes),
            average_score=user_data["average_score"],
            current_streak=user_data["study_streak"],
            longest_streak=longest_streak,
            recent_documents=recent_documents,
            recent_quizzes=recent_quizzes,
            performance_by_topic=performance_by_topic,
            weekly_activity=weekly_activity
        )
    
    def save_chat_message(self, user_id: str, role: str, content: str, session_id: str) -> None:
        """Save a chat message to user's history"""
        if user_id not in self.chat_history:
            self.chat_history[user_id] = []
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id
        }
        
        self.chat_history[user_id].append(message)
        
        # Keep only last 100 messages per user to manage memory
        if len(self.chat_history[user_id]) > 100:
            self.chat_history[user_id] = self.chat_history[user_id][-100:]
        
        # Save to storage
        self._save_to_storage()
    
    def get_chat_history(self, user_id: str, session_id: Optional[str] = None, limit: int = 50) -> List[dict]:
        """Get chat history for a user, optionally filtered by session"""
        if user_id not in self.chat_history:
            return []
        
        messages = self.chat_history[user_id]
        
        # Filter by session if provided
        if session_id:
            messages = [msg for msg in messages if msg.get("session_id") == session_id]
        
        # Return most recent messages (up to limit)
        return messages[-limit:]

# Global instance
auth_manager = AuthManager()

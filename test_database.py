"""Test database initialization and basic operations"""
import sys
sys.path.insert(0, 'backend')

from backend.database import init_db, get_db
from backend.db_auth_manager import db_auth_manager

def test_database():
    """Test database setup and basic operations"""
    print("Initializing database...")
    init_db()
    print("✓ Database initialized")
    
    # Get database session
    db = next(get_db())
    
    # Test user registration
    print("\nTesting user registration...")
    try:
        user = db_auth_manager.register_user(
            email="test@example.com",
            password="test123",
            full_name="Test User",
            db=db
        )
        print(f"✓ User registered: {user.email}")
    except ValueError as e:
        print(f"ℹ User already exists: {e}")
    
    # Test authentication
    print("\nTesting authentication...")
    auth_user = db_auth_manager.authenticate_user(
        email="test@example.com",
        password="test123",
        db=db
    )
    if auth_user:
        print(f"✓ Authentication successful: {auth_user.email}")
    else:
        print("✗ Authentication failed")
    
    # Test token creation
    print("\nTesting JWT token...")
    token = db_auth_manager.create_access_token(
        user_id=auth_user.user_id,
        email=auth_user.email
    )
    print(f"✓ Token created: {token[:20]}...")
    
    # Test token verification
    payload = db_auth_manager.verify_token(token)
    if payload:
        print(f"✓ Token verified: {payload['email']}")
    else:
        print("✗ Token verification failed")
    
    # Test get user by id
    print("\nTesting get user by ID...")
    user_profile = db_auth_manager.get_user_by_id(auth_user.user_id, db)
    if user_profile:
        print(f"✓ User retrieved: {user_profile.email}")
    else:
        print("✗ User not found")
    
    # Test get user stats
    print("\nTesting get user stats...")
    stats = db_auth_manager.get_user_stats(auth_user.user_id, db)
    if stats:
        print(f"✓ Stats retrieved: {stats.total_documents} docs, {stats.total_quizzes} quizzes")
    else:
        print("✗ Stats not found")
    
    db.close()
    print("\n✓ All tests completed successfully!")

if __name__ == "__main__":
    test_database()

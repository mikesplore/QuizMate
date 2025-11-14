#!/usr/bin/env python3
"""Test document saving functionality"""
import sys
sys.path.insert(0, 'backend')

from backend.database import init_db, get_db
from backend.db_auth_manager import db_auth_manager
from backend.auth_models import DocumentHistory
from datetime import datetime

def test_document_save():
    """Test saving a document"""
    print("Testing document save...")
    
    # Initialize database
    init_db()
    
    # Get database session
    db = next(get_db())
    
    # Use existing test user
    user_id = "test123"  # From test_database.py
    
    try:
        # Create a test document
        doc_history = DocumentHistory(
            document_id="test_doc_123",
            filename="test_document.pdf",
            upload_date=datetime.now(),
            document_type="pdf",
            page_count=5,
            topics=["math", "algebra"]
        )
        
        print(f"Attempting to save document: {doc_history}")
        
        # Try to save it
        db_auth_manager.add_document(user_id, doc_history, db)
        print("✓ Document saved successfully")
        
        # Check if it was saved
        from backend.database import Document
        saved_doc = db.query(Document).filter(Document.document_id == "test_doc_123").first()
        if saved_doc:
            print(f"✓ Document retrieved: {saved_doc.title}")
        else:
            print("✗ Document not found in database")
            
    except Exception as e:
        print(f"✗ Error saving document: {e}")
        import traceback
        traceback.print_exc()
    
    db.close()

if __name__ == "__main__":
    test_document_save()
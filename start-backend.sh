#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Start backend server
echo "🚀 Starting QuizMate Backend..."
cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

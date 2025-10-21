#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Start backend server
echo "🚀 Starting QuizMate Backend..."
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

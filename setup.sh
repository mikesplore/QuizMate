#!/bin/bash

# QuizMate Setup Script
echo "🚀 Setting up QuizMate..."

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node dependencies
echo "📚 Installing Node dependencies..."
npm install

# Check for Tesseract OCR
if ! command -v tesseract &> /dev/null; then
    echo "⚠️  Tesseract OCR is not installed."
    echo "   For Ubuntu/Debian: sudo apt-get install tesseract-ocr"
    echo "   For macOS: brew install tesseract"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your Gemini API key!"
fi

# Create uploads directory
mkdir -p uploads

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your GEMINI_API_KEY"
echo "2. Run backend: source venv/bin/activate && python -m uvicorn backend.main:app --reload"
echo "3. Run frontend (new terminal): npm run dev"
echo "4. Open http://localhost:5173"

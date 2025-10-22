#!/bin/bash

# QuizMate Deployment Verification Script

echo "🚀 QuizMate Deployment Verification"
echo "===================================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file exists (local development)"
else
    echo "⚠️  .env file not found (create from .env.example for local dev)"
fi

# Check if .env is in .gitignore
if grep -q "^.env$" .gitignore 2>/dev/null; then
    echo "✅ .env is in .gitignore (won't be committed)"
else
    echo "❌ WARNING: .env not in .gitignore! Add it to prevent API key exposure"
fi

# Check Python dependencies
if [ -f "requirements.txt" ]; then
    echo "✅ requirements.txt exists"
else
    echo "❌ requirements.txt missing!"
fi

# Check Node dependencies
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
else
    echo "❌ package.json missing!"
fi

# Check backend structure
if [ -d "backend" ]; then
    echo "✅ backend/ directory exists"
    if [ -f "backend/main.py" ]; then
        echo "✅ backend/main.py exists"
    else
        echo "❌ backend/main.py missing!"
    fi
else
    echo "❌ backend/ directory missing!"
fi

# Check frontend structure
if [ -f "vite.config.ts" ]; then
    echo "✅ vite.config.ts exists"
else
    echo "❌ vite.config.ts missing!"
fi

if [ -f "index.html" ]; then
    echo "✅ index.html exists"
else
    echo "❌ index.html missing!"
fi

# Check deployment files
if [ -f "Procfile" ]; then
    echo "✅ Procfile exists (for Render/Railway)"
else
    echo "❌ Procfile missing!"
fi

if [ -f "runtime.txt" ]; then
    echo "✅ runtime.txt exists (Python version specified)"
else
    echo "⚠️  runtime.txt missing (deployment platform will use default Python)"
fi

echo ""
echo "📋 Deployment Checklist:"
echo "========================"
echo ""
echo "Backend Deployment (Render/Railway):"
echo "  1. Push code to GitHub"
echo "  2. Create Web Service on Render/Railway"
echo "  3. Set environment variables:"
echo "     - GEMINI_API_KEY"
echo "     - CORS_ORIGINS"
echo "  4. Deploy and get backend URL"
echo ""
echo "Frontend Deployment (Vercel):"
echo "  1. Import GitHub repo to Vercel"
echo "  2. Set environment variable:"
echo "     - VITE_API_URL=<your-backend-url>"
echo "  3. Deploy and get frontend URL"
echo ""
echo "Final Step:"
echo "  Update backend CORS_ORIGINS with frontend URL"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"

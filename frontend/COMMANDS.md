# 🚀 QuizMate - Quick Commands Reference

## Installation (One-Time Setup)

```bash
# Backend dependencies (✅ DONE)
source .venv/bin/activate
pip install -r requirements.txt

# Frontend dependencies (TODO)
npm install

# Tesseract OCR for images (Optional)
sudo apt-get install tesseract-ocr tesseract-ocr-eng
```

---

## Daily Usage

### Start Both Servers

**Option 1: Using Scripts (Recommended)**
```bash
# Terminal 1 - Backend
./start-backend.sh

# Terminal 2 - Frontend  
./start-frontend.sh
```

**Option 2: Manual Commands**
```bash
# Terminal 1 - Backend
source .venv/bin/activate
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
npm run dev
```

### Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Common Commands

```bash
# Check Python packages
source .venv/bin/activate && pip list

# Check Node packages
npm list --depth=0

# Rebuild frontend
npm run build

# Preview production build
npm run preview

# Check for errors
npm run lint

# Test backend health
curl http://localhost:8000/api/health
```

---

## File Locations

```
.env                    # Your API keys (EDIT THIS!)
backend/main.py         # Backend entry point
src/App.tsx            # Frontend entry point
README.md              # Full documentation
QUICKSTART.md          # 5-minute guide
INSTALLATION_STATUS.md # Current setup status
```

---

## Quick Fixes

**Backend won't start?**
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

**Frontend won't start?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**API key error?**
```bash
# Check .env file
cat .env | grep GEMINI_API_KEY

# Or edit it
nano .env
```

**Port already in use?**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

---

## Environment Variables (.env file)

```env
# REQUIRED - Get from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_api_key_here

# Optional - defaults are fine
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
VITE_API_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:5173
MAX_UPLOAD_SIZE_MB=50
ALLOWED_EXTENSIONS=pdf,docx,txt,png,jpg,jpeg
```

---

## Testing the Setup

```bash
# 1. Check backend health
curl http://localhost:8000/api/health

# 2. Check supported formats
curl http://localhost:8000/api/supported-formats

# 3. Open frontend in browser
xdg-open http://localhost:5173  # Linux
open http://localhost:5173      # macOS
```

---

## Development Workflow

1. **Start servers** (both terminals)
2. **Open browser** to http://localhost:5173
3. **Upload document** (PDF, DOCX, TXT, or image)
4. **Wait for AI** (~30-90 seconds)
5. **Study** with quizzes, flashcards, notes
6. **Stop servers** (Ctrl+C in both terminals)

---

## Git Commands (Optional)

```bash
# Initialize repo
git init
git add .
git commit -m "Initial QuizMate setup"

# Push to GitHub
git remote add origin <your-repo-url>
git push -u origin main
```

---

## Status Checklist

- [x] Python 3.13 installed
- [x] Virtual environment created (.venv)
- [x] Python dependencies installed
- [ ] Node dependencies installed (`npm install`)
- [ ] Gemini API key added to .env
- [ ] Tesseract OCR installed (optional)
- [ ] Backend tested (can start)
- [ ] Frontend tested (can start)
- [ ] Successfully processed a document

---

## Need Help?

1. Check `README.md` - Full documentation
2. Check `QUICKSTART.md` - Setup guide
3. Check `INSTALLATION_STATUS.md` - Current status
4. Check `ARCHITECTURE.md` - System design
5. Check backend logs in terminal
6. Check frontend browser console (F12)

---

**Remember:** 
- Backend needs `.venv` activated: `source .venv/bin/activate`
- Frontend needs dependencies: `npm install`
- Both need `.env` configured with API key!

**Current Status:** Backend ✅ | Frontend: needs `npm install` ⏳

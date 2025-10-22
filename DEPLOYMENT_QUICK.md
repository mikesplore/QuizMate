# QuizMate - Quick Deployment Reference

## 🎯 TL;DR

### Backend → Render
1. Create Web Service
2. Build: `pip install -r requirements.txt`
3. Start: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add env: `GEMINI_API_KEY`, `CORS_ORIGINS`
5. Get URL: `https://quizmate-backend.onrender.com`

### Frontend → Vercel
1. Import from GitHub
2. Framework: Vite
3. Add env: `VITE_API_URL=https://quizmate-backend.onrender.com`
4. Deploy
5. Get URL: `https://quizmate.vercel.app`

### Update Backend CORS
Add your Vercel URL to `CORS_ORIGINS`:
```
CORS_ORIGINS=https://quizmate.vercel.app,http://localhost:5173
```

---

## 📍 Project Structure

```
QuizMate/
├── backend/              ← Deploy to Render/Railway
│   ├── main.py
│   ├── gemini_processor.py
│   ├── document_processor.py
│   ├── models.py
│   └── config.py
├── src/                  ← Deploy to Vercel
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── store/
├── requirements.txt      ← Backend dependencies
├── package.json          ← Frontend dependencies
├── Procfile             ← Backend start command
└── vite.config.ts       ← Frontend build config
```

---

## 🔑 Environment Variables

### Backend (Render/Railway)
```bash
GEMINI_API_KEY=AIza...your-key
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:5173
BACKEND_HOST=0.0.0.0
BACKEND_PORT=10000
MAX_UPLOAD_SIZE_MB=20
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-backend.onrender.com
```

---

## ✅ All Set!
Your project is **already separated** and ready to deploy to two platforms.

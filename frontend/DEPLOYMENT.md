# QuizMate Deployment Guide

## Overview
QuizMate consists of two separate applications that need to be deployed independently:
- **Frontend**: React + Vite application (deploy to Vercel)
- **Backend**: FastAPI Python application (deploy to Render/Railway/Fly.io)

---

## 🚀 Backend Deployment (Render/Railway)

### Option 1: Deploy to Render

1. **Push your code to GitHub** (if not already done)

2. **Go to [Render](https://render.com)** and sign up/login

3. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `quizmate-backend`
     - **Region**: Choose closest to your users
     - **Branch**: `main`
     - **Root Directory**: Leave empty (or `/`)
     - **Runtime**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables**:
   ```
   GEMINI_API_KEY=your-actual-gemini-api-key
   BACKEND_HOST=0.0.0.0
   BACKEND_PORT=10000
   CORS_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:5173
   MAX_UPLOAD_SIZE_MB=20
   ALLOWED_EXTENSIONS=pdf,docx,txt,png,jpg,jpeg
   ```

5. **Deploy** - Render will automatically build and deploy

6. **Copy your backend URL** - It will be something like:
   `https://quizmate-backend.onrender.com`

### Option 2: Deploy to Railway

1. **Go to [Railway](https://railway.app)** and sign up/login

2. **Create New Project**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your QuizMate repository

3. **Configure**:
   - Railway will auto-detect Python
   - Add environment variables in Settings → Variables:
     ```
     GEMINI_API_KEY=your-actual-gemini-api-key
     CORS_ORIGINS=https://your-frontend-url.vercel.app
     ```

4. **Add Start Command** in Settings → Deploy:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```

5. **Generate Domain** - Railway will provide a public URL

---

## 🎨 Frontend Deployment (Vercel)

### Prerequisites
1. **Update API URL** - First, you need your backend URL from above

### Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)** and sign up/login

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `/` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```
   - Example: `VITE_API_URL=https://quizmate-backend.onrender.com`

5. **Deploy** - Click "Deploy"

6. **Get your Frontend URL** - Vercel will provide:
   `https://quizmate.vercel.app`

---

## 🔄 Update Backend CORS

After getting your Vercel URL, update backend environment variables:

### On Render:
1. Go to your service → Environment
2. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://your-app.vercel.app,http://localhost:5173
   ```

### On Railway:
1. Go to your project → Variables
2. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```

---

## 📋 Deployment Checklist

### Backend (Render/Railway)
- [ ] Repository pushed to GitHub
- [ ] Backend service created
- [ ] Environment variables set (especially `GEMINI_API_KEY`)
- [ ] CORS origins configured with frontend URL
- [ ] Backend URL obtained and tested

### Frontend (Vercel)
- [ ] `VITE_API_URL` environment variable set to backend URL
- [ ] Build successful
- [ ] Frontend URL obtained
- [ ] Backend CORS updated with frontend URL

### Testing
- [ ] Upload a document on production
- [ ] Generate quiz works
- [ ] Question paper detection works
- [ ] AI answers generation works
- [ ] All pages load correctly

---

## 🔧 Local Development After Deployment

Update your `.env` file for local development:

```bash
# Backend
GEMINI_API_KEY=your-api-key
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app

# Frontend (.env or .env.local)
VITE_API_URL=http://localhost:8000
```

For production testing locally:
```bash
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🐛 Troubleshooting

### CORS Errors
- Make sure `CORS_ORIGINS` in backend includes your exact frontend URL
- No trailing slashes in URLs
- Redeploy backend after updating CORS

### 500 Errors on Backend
- Check backend logs on Render/Railway
- Verify `GEMINI_API_KEY` is set correctly
- Check Python version matches (3.13)

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is set in Vercel environment variables
- Redeploy frontend after changing env variables
- Check network tab in browser dev tools for actual API calls

### Build Failures
**Backend**: Check `requirements.txt` has all dependencies
**Frontend**: Make sure `package.json` and `package-lock.json` are committed

---

## 📚 Useful Commands

### Test Backend Locally
```bash
cd /home/mike/Development/Build_with_AI/QuizMate
source venv/bin/activate
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Test Frontend Locally
```bash
npm run dev
```

### Build Frontend Locally (to test production build)
```bash
npm run build
npm run preview
```

---

## 🔐 Security Notes

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Rotate `GEMINI_API_KEY`** if accidentally exposed
3. **Set rate limits** on Render/Railway if needed
4. **Monitor API usage** in Google AI Studio

---

## 💰 Cost Estimates

- **Vercel**: Free tier (sufficient for this project)
- **Render**: Free tier available (may sleep after inactivity)
- **Railway**: $5/month starter (always on)
- **Gemini API**: Pay per use (very affordable for moderate usage)

**Recommended Setup for Production**:
- Frontend: Vercel Free
- Backend: Railway $5/month OR Render Paid ($7/month) for always-on

---

## 🎯 Next Steps After Deployment

1. Test all features on production
2. Set up custom domain (optional)
3. Add analytics (optional)
4. Monitor error logs
5. Set up backup strategy for user data (if storing any)

# QuizMate - System Architecture

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                            │
│                     http://localhost:5173                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Pages     │  │  Components  │  │    Store     │         │
│  │              │  │              │  │              │         │
│  │ • Home       │  │ • Layout     │  │ • Zustand    │         │
│  │ • Quiz       │  │ • Header     │  │ • State      │         │
│  │ • Flashcards │  │ • Nav        │  │ • Actions    │         │
│  │ • StudyNotes │  │              │  │              │         │
│  │ • Results    │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
│                  ┌─────────▼─────────┐                          │
│                  │   Axios Client    │                          │
│                  │   (API Service)   │                          │
│                  └─────────┬─────────┘                          │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTP/REST
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND                                │
│                  http://localhost:8000                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes                             │  │
│  │  • POST /api/process-document                            │  │
│  │  • GET /api/health                                       │  │
│  │  • GET /api/supported-formats                            │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│  ┌────────────────────▼──────────────────┐                     │
│  │      Document Processor               │                     │
│  │  ┌──────────┐  ┌──────────┐          │                     │
│  │  │   PDF    │  │  DOCX    │          │                     │
│  │  │ Parser   │  │ Parser   │          │                     │
│  │  └──────────┘  └──────────┘          │                     │
│  │  ┌──────────┐  ┌──────────┐          │                     │
│  │  │   TXT    │  │  Image   │          │                     │
│  │  │ Parser   │  │   OCR    │          │                     │
│  │  └──────────┘  └──────────┘          │                     │
│  └────────────────────┬──────────────────┘                     │
│                       │ Extracted Text                          │
│                       ▼                                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           Gemini AI Processor                            │  │
│  │                                                           │  │
│  │  • Prompt Engineering                                    │  │
│  │  • Content Generation                                    │  │
│  │  • Response Parsing                                      │  │
│  └─────────────────────┬───────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         ▼
           ┌─────────────────────────────┐
           │   Google Gemini 2.5 Flash   │
           │      AI Service (Cloud)     │
           └─────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
USER ACTION                 FRONTEND                BACKEND                 AI
    │                          │                       │                    │
    │  1. Upload Document      │                       │                    │
    ├─────────────────────────>│                       │                    │
    │                          │  2. Parse File        │                    │
    │                          │      + Config         │                    │
    │                          ├──────────────────────>│                    │
    │                          │                       │                    │
    │                          │                       │  3. Extract Text   │
    │                          │                       │    (PDF/DOCX/OCR)  │
    │                          │                       │                    │
    │                          │                       │  4. Build Prompt   │
    │                          │                       ├───────────────────>│
    │                          │                       │                    │
    │                          │                       │  5. Generate       │
    │                          │                       │     Content        │
    │                          │                       │<───────────────────│
    │                          │                       │                    │
    │                          │  6. Return Content    │                    │
    │                          │<──────────────────────│                    │
    │                          │                       │                    │
    │  7. Display Results      │                       │                    │
    │<─────────────────────────│                       │                    │
    │                          │                       │                    │
    │  8. Take Quiz            │                       │                    │
    ├─────────────────────────>│                       │                    │
    │                          │                       │                    │
    │  9. View Flashcards      │                       │                    │
    ├─────────────────────────>│                       │                    │
    │                          │                       │                    │
    │  10. Read Notes          │                       │                    │
    ├─────────────────────────>│                       │                    │
```

---

## 📦 Component Hierarchy

```
App
 │
 ├─ Layout
 │   ├─ Header
 │   │   ├─ Logo
 │   │   └─ Title
 │   │
 │   ├─ Navigation
 │   │   ├─ Upload Link
 │   │   ├─ Quiz Link
 │   │   ├─ Flashcards Link
 │   │   ├─ Study Notes Link
 │   │   └─ Results Link
 │   │
 │   ├─ Main Content (Routes)
 │   │   │
 │   │   ├─ Home Page
 │   │   │   ├─ Upload Area (Dropzone)
 │   │   │   ├─ Config Panel
 │   │   │   └─ Features Grid
 │   │   │
 │   │   ├─ Quiz Page
 │   │   │   ├─ Progress Bar
 │   │   │   ├─ Question Card
 │   │   │   │   ├─ Question Text
 │   │   │   │   ├─ Answer Options
 │   │   │   │   └─ Explanation
 │   │   │   └─ Navigation Buttons
 │   │   │
 │   │   ├─ Flashcards Page
 │   │   │   ├─ Progress Indicator
 │   │   │   ├─ Card (Flip Animation)
 │   │   │   │   ├─ Front (Question)
 │   │   │   │   └─ Back (Answer)
 │   │   │   └─ Navigation
 │   │   │
 │   │   ├─ Study Notes Page
 │   │   │   ├─ Summary Card
 │   │   │   ├─ Key Terms
 │   │   │   ├─ Detailed Notes
 │   │   │   └─ Action Buttons
 │   │   │
 │   │   └─ Results Page
 │   │       ├─ Score Display
 │   │       ├─ Statistics Grid
 │   │       ├─ Question Breakdown
 │   │       └─ Action Buttons
 │   │
 │   └─ Footer
 │       └─ Copyright
```

---

## 🗄️ State Management

```
Zustand Store
 │
 ├─ processedContent: ProcessedContent | null
 │   ├─ session_id
 │   ├─ timestamp
 │   ├─ multiple_choice_questions[]
 │   ├─ true_false_questions[]
 │   ├─ short_answer_questions[]
 │   ├─ flashcards[]
 │   ├─ study_notes
 │   ├─ summary
 │   └─ key_terms[]
 │
 ├─ quizState: QuizState | null
 │   ├─ currentQuestion
 │   ├─ answers[]
 │   ├─ startTime
 │   ├─ endTime
 │   └─ score
 │
 ├─ isLoading: boolean
 ├─ error: string | null
 │
 └─ Actions
     ├─ setProcessedContent()
     ├─ setQuizState()
     ├─ setLoading()
     ├─ setError()
     └─ resetState()
```

---

## 🔐 Security Considerations

```
Frontend Security:
├─ Environment variables via Vite
├─ Input validation before upload
├─ File type checking
├─ File size validation
└─ XSS prevention (React auto-escapes)

Backend Security:
├─ CORS configuration
├─ File size limits (50MB)
├─ File type validation
├─ Pydantic input validation
├─ API key protection (env vars)
└─ Error message sanitization
```

---

## 🎯 API Request/Response Flow

### POST /api/process-document

**Request:**
```
Content-Type: multipart/form-data

┌─────────────────────────────────┐
│  FormData                        │
│  ├─ file: File                  │
│  └─ config: JSON string         │
│      {                           │
│        document_type,            │
│        processing_instructions,  │
│        output_preferences,       │
│        customization             │
│      }                           │
└─────────────────────────────────┘
```

**Processing Steps:**
```
1. Validate file extension
2. Check file size
3. Read file content
4. Extract text based on type:
   ├─ PDF → PyPDF2
   ├─ DOCX → python-docx
   ├─ TXT → decode
   └─ Image → Tesseract OCR
5. Build Gemini prompt
6. Call Gemini API
7. Parse JSON response
8. Return ProcessedContent
```

**Response:**
```json
{
  "session_id": "uuid",
  "timestamp": "ISO8601",
  "multiple_choice_questions": [...],
  "true_false_questions": [...],
  "short_answer_questions": [...],
  "flashcards": [...],
  "study_notes": "markdown text",
  "summary": "text",
  "key_terms": [...]
}
```

---

## 🎨 Styling Architecture

```
Tailwind Configuration
 │
 ├─ Base Colors
 │   ├─ primary-black (#000000)
 │   ├─ secondary-black (#1a1a1a)
 │   ├─ tertiary-black (#2d2d2d)
 │   ├─ primary-white (#ffffff)
 │   ├─ secondary-white (#f8f9fa)
 │   └─ tertiary-white (#e9ecef)
 │
 ├─ Accent Colors
 │   ├─ brand-blue (#0077cc)
 │   ├─ brand-blue-hover (#005fa3)
 │   ├─ brand-green (#00a86b)
 │   ├─ brand-green-dark (#008f5b)
 │   ├─ brand-red (#dc3545)
 │   └─ brand-red-dark (#c82333)
 │
 ├─ Typography
 │   ├─ Font Family: Inter, sans-serif
 │   ├─ Mono Font: JetBrains Mono
 │   └─ Weights: 300, 400, 500, 600, 700
 │
 └─ Custom Utilities
     ├─ shadow-card
     └─ Custom animations
```

---

## 🚀 Deployment Architecture

```
Development:
├─ Frontend: Vite Dev Server (localhost:5173)
├─ Backend: Uvicorn with --reload (localhost:8000)
└─ Hot Module Replacement enabled

Production:
├─ Frontend:
│   ├─ Build: npm run build → dist/
│   ├─ Serve: Static hosting (Vercel, Netlify)
│   └─ Environment: VITE_API_URL points to backend
│
└─ Backend:
    ├─ Server: Uvicorn (production mode)
    ├─ Deployment: Docker, Cloud Run, Railway
    ├─ Environment: .env with secrets
    └─ Scaling: Horizontal with load balancer
```

---

## 📊 Performance Optimization

```
Frontend:
├─ Code splitting (React.lazy)
├─ Tree shaking (Vite)
├─ Asset optimization
├─ Caching strategies
└─ Lazy image loading

Backend:
├─ Async/await patterns
├─ Streaming responses
├─ Connection pooling
├─ Response caching
└─ Efficient parsing libraries
```

---

## 🧪 Testing Strategy

```
Frontend Testing:
├─ Unit tests (Jest/Vitest)
├─ Component tests (React Testing Library)
├─ E2E tests (Playwright/Cypress)
└─ Type checking (TypeScript)

Backend Testing:
├─ Unit tests (pytest)
├─ API tests (FastAPI TestClient)
├─ Integration tests
└─ Type validation (Pydantic)
```

---

This architecture supports:
✅ Scalability
✅ Maintainability
✅ Testability
✅ Security
✅ Performance
✅ Developer Experience

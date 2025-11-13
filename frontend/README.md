# QuizMate - AI-Powered Study Companion

<div align="center">

![QuizMate](https://img.shields.io/badge/QuizMate-AI%20Study%20Companion-0077cc?style=for-the-badge)
![Google Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python)

Transform your study materials into interactive quizzes, flashcards, and comprehensive notes using Google's Gemini 2.0 Flash AI.

</div>

---

## 🌟 Features

### 📄 **Document Processing**
- **Multi-format Support**: Upload PDF, DOCX, TXT, PNG, JPG, and JPEG files
- **OCR Capability**: Extract text from images using Tesseract OCR
- **Smart Analysis**: Configurable depth levels (Quick, Detailed, Comprehensive)

### 🎯 **Quiz Generation**
- **Multiple Question Types**:
  - Multiple Choice (with customizable difficulty)
  - True/False
  - Short Answer
- **Instant Feedback**: Get explanations for each answer
- **Progress Tracking**: Visual progress indicators and score calculation
- **Page References**: Link questions back to source material

### 🎴 **Interactive Flashcards**
- **Flip Animation**: Smooth 3D card flip effects
- **Category Tags**: Organized by topic
- **Progress Navigation**: Easy card-to-card navigation

### 📚 **Study Notes**
- **Comprehensive Summaries**: AI-generated document summaries
- **Detailed Notes**: Structured with bullet points or paragraphs
- **Key Terms Highlighting**: Important concepts at a glance
- **Markdown Support**: Rich text formatting with examples

### 🎨 **Monochrome Design**
- **Clean Interface**: Black and white theme with strategic accent colors
- **Accessibility**: High contrast for better readability
- **Color-Coded Feedback**:
  - 🔵 Blue: Primary actions and active states
  - 🟢 Green: Correct answers and success states
  - 🔴 Red: Incorrect answers and warnings

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+**
- **Node.js 18+** and npm/yarn
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))
- **Tesseract OCR** (for image processing)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd QuizMate
```

#### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Install Tesseract OCR (Ubuntu/Debian)
sudo apt-get install tesseract-ocr

# For macOS
brew install tesseract

# For Windows, download from:
# https://github.com/UB-Mannheim/tesseract/wiki
```

#### 3. Frontend Setup

```bash
# Install Node dependencies
npm install
```

#### 4. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Gemini API key
nano .env
```

**Required Environment Variables:**

```env
# Google Gemini AI API Key (REQUIRED)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Frontend Configuration
VITE_API_URL=http://localhost:8000

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Upload Configuration
MAX_UPLOAD_SIZE_MB=50
ALLOWED_EXTENSIONS=pdf,docx,txt,png,jpg,jpeg
```

---

## 🎮 Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
# Activate virtual environment
source venv/bin/activate  # Windows: venv\Scripts\activate

# Start FastAPI server
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**

```bash
# Start Vite development server
npm run dev
```

Access the application at: **http://localhost:5173**

### Production Build

```bash
# Build frontend
npm run build

# Serve frontend
npm run preview

# Run backend in production
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

---

## 📖 Usage Guide

### 1. Upload a Document

1. Navigate to the home page
2. Drag and drop a file or click to browse
3. **Optional**: Click "Advanced Configuration" to customize:
   - Analysis depth (quick/detailed/comprehensive)
   - Tone (formal/casual/encouraging)
   - Number of questions and flashcards
4. Wait for AI processing (typically 30-90 seconds)

### 2. Take a Quiz

- Answer multiple choice and true/false questions
- Get instant feedback with explanations
- Track your progress with the visual progress bar
- View detailed results at the end

### 3. Review Flashcards

- Click through flashcards one by one
- Click any card to flip and reveal the answer
- Use navigation buttons or progress dots

### 4. Study Notes

- Read the AI-generated summary
- Review key terms and concepts
- Read detailed notes with examples

---

## 🏗️ Project Structure

```
QuizMate/
├── backend/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration and settings
│   ├── models.py               # Pydantic models for API
│   ├── document_processor.py  # Document parsing logic
│   └── gemini_processor.py    # Gemini AI integration
├── src/
│   ├── components/
│   │   └── Layout.tsx          # Main layout with navigation
│   ├── pages/
│   │   ├── Home.tsx            # Document upload page
│   │   ├── Quiz.tsx            # Quiz interface
│   │   ├── Flashcards.tsx     # Flashcard viewer
│   │   ├── StudyNotes.tsx     # Study notes display
│   │   └── Results.tsx         # Quiz results page
│   ├── services/
│   │   └── api.ts              # API client
│   ├── store/
│   │   └── useStore.ts         # Zustand state management
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── config/
│   │   └── defaultConfig.ts    # Default processing config
│   ├── App.tsx                 # Main React component
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── .env.example                # Environment variables template
├── .gitignore
├── package.json                # Node dependencies
├── requirements.txt            # Python dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md
```

---

## 🎨 Theme Configuration

The application uses a **Monochrome_Edu** theme with strategic accent colors:

### Base Colors
- **Primary Black**: `#000000` - Headers, primary text
- **Secondary Black**: `#1a1a1a` - Footer, dark backgrounds
- **Tertiary Black**: `#2d2d2d` - Secondary text, borders
- **Primary White**: `#ffffff` - Main backgrounds
- **Secondary White**: `#f8f9fa` - Sidebar, light backgrounds
- **Tertiary White**: `#e9ecef` - Subtle backgrounds, borders

### Accent Colors
- **Brand Blue** (`#0077cc`): Primary buttons, active states, main actions
- **Brand Green** (`#00a86b`): Success states, correct answers, progress
- **Brand Red** (`#dc3545`): Error states, incorrect answers, warnings

---

## 🔧 Configuration Options

### Document Processing Request Schema

```typescript
{
  processing_instructions: {
    analysis_depth: "quick" | "detailed" | "comprehensive",
    focus_areas: string[],  // Specific topics to emphasize
    ignore_sections: string[],  // Sections to skip
    learning_objectives: string[]
  },
  output_preferences: {
    content_types: {
      questions: {
        enabled: boolean,
        types: {
          multiple_choice: {
            enabled: boolean,
            difficulty: "easy" | "medium" | "hard",
            count: number,
            options_per_question: number
          },
          true_false: {
            enabled: boolean,
            count: number
          },
          short_answer: {
            enabled: boolean,
            count: number
          }
        }
      },
      study_notes: {
        enabled: boolean,
        format: "bullet_points" | "outline" | "paragraph",
        detail_level: "concise" | "detailed",
        include_examples: boolean
      },
      flashcards: {
        enabled: boolean,
        count: number
      },
      summary: {
        enabled: boolean,
        length: "brief" | "detailed"
      }
    },
    quiz_mode: {
      type: "quickfire" | "timed_test" | "learning_mode",
      time_limit_minutes: number,
      shuffle_questions: boolean,
      instant_feedback: boolean
    }
  },
  customization: {
    language: string,
    tone: "formal" | "casual" | "encouraging",
    include_page_references: boolean,
    highlight_key_terms: boolean
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Tesseract OCR not found**
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-eng

# macOS
brew install tesseract

# Verify installation
tesseract --version
```

**2. Gemini API errors**
- Verify your API key is correct in `.env`
- Check your API quota at [Google AI Studio](https://makersuite.google.com/)
- Ensure you're using a valid model name (`gemini-2.0-flash-exp`)

**3. CORS errors**
- Verify `CORS_ORIGINS` in `.env` includes your frontend URL
- Check that the backend is running on port 8000

**4. File upload fails**
- Check file size (max 50MB by default)
- Verify file extension is supported
- Check backend logs for detailed error messages

**5. Port already in use**
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn backend.main:app --port 8001
```

---

## 📊 API Endpoints

### Health Check
```
GET /api/health
Response: { status: "healthy", gemini_configured: boolean }
```

### Supported Formats
```
GET /api/supported-formats
Response: { formats: string[], max_size_mb: number }
```

### Process Document
```
POST /api/process-document
Content-Type: multipart/form-data
Body:
  - file: File
  - config: JSON string (DocumentProcessingRequest)
Response: ProcessedContent
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful document understanding
- **FastAPI** for the robust backend framework
- **Vite + React** for the blazing-fast frontend
- **Tailwind CSS** for the beautiful styling
- **Lucide Icons** for the clean iconography

---

## 📧 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review existing GitHub issues
3. Create a new issue with detailed information

---

<div align="center">

**Built with ❤️ using Google Gemini 2.5 Flash**

Made by [Your Name] | 2025

</div>

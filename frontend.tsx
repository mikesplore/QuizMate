import React, { useState } from 'react';
import { Upload, BookOpen, Clock, BarChart3, FileText, Layers, CheckCircle2, Circle } from 'lucide-react';

const QuizMateRedesign = () => {
  const [currentView, setCurrentView] = useState('home'); // home, config, quiz, flashcards
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const studyModes = [
    {
      name: 'Quick Review',
      icon: Clock,
      description: 'Perfect for a fast study session',
      questions: '5 Multiple Choice',
      flashcards: '10 Flashcards',
      duration: '~5-10 minutes',
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
    },
    {
      name: 'Standard Test',
      icon: FileText,
      description: 'Comprehensive assessment',
      questions: '10 Multiple Choice',
      flashcards: '15 Flashcards',
      duration: '~15-20 minutes',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
      recommended: true
    },
    {
      name: 'Deep Dive',
      icon: Layers,
      description: 'Full mastery preparation',
      questions: '15 Multiple Choice + 10 True/False',
      flashcards: '20 Flashcards',
      duration: '~30-45 minutes',
      color: 'bg-amber-50 border-amber-200 hover:border-amber-400'
    }
  ];

  const questions = [
    {
      question: "Which of the following best describes a data structure?",
      options: [
        "A way to store and organize data efficiently.",
        "A programming language construct.",
        "A hardware component.",
        "A type of algorithm."
      ],
      correct: 0
    }
  ];

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">QuizMate</h1>
              <p className="text-sm text-slate-600">AI-Powered Learning</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
            <button className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Results
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Transform Your Documents into Study Materials
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload any document and let AI generate quizzes, flashcards, and study notes
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors p-12 mb-12 cursor-pointer">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Upload className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Drag & drop a file or click to browse
            </h3>
            <p className="text-slate-600 mb-4">
              Supported: PDF, DOCX, TXT, PNG, JPG • Max 50MB
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Textbooks, lecture notes, research papers</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <Circle className="w-4 h-4" />
                <span>Receipts, personal photos, ads</span>
              </div>
            </div>
          </div>
        </div>

        {/* Study Modes */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Study Mode</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {studyModes.map((mode, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentView('config')}
                className={`${mode.color} border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden`}
              >
                {mode.recommended && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Recommended
                  </div>
                )}
                <mode.icon className="w-10 h-10 text-slate-700 mb-4" />
                <h4 className="text-xl font-bold text-slate-900 mb-2">{mode.name}</h4>
                <p className="text-slate-700 mb-4">{mode.description}</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>📝 {mode.questions}</p>
                  <p>🎴 {mode.flashcards}</p>
                  <p>⏱️ {mode.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Smart Quiz Generation</h4>
            <p className="text-slate-600 text-sm">
              AI-powered questions with multiple choice, true/false, and short answer formats
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Study Notes</h4>
            <p className="text-slate-600 text-sm">
              Comprehensive notes with key concepts, examples, and summaries
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Interactive Flashcards</h4>
            <p className="text-slate-600 text-sm">
              Digital flashcards for quick review and memorization
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-6 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-400">
            Powered by Google Gemini 2.0 Flash | Developed by Mike | © 2025 QuizMate - All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );

  const renderConfig = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentView('home')} className="text-slate-600 hover:text-slate-900">
              ← Back
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">QuizMate</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Configure Your Study Session</h2>
          
          {/* Study Mode Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Selected Mode: Standard Test</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                <div className="text-sm text-slate-600 mb-1">Multiple Choice</div>
                <div className="text-2xl font-bold text-slate-900">10</div>
              </div>
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-4">
                <div className="text-sm text-slate-600 mb-1">Flashcards</div>
                <div className="text-2xl font-bold text-slate-900">15</div>
              </div>
              <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
                <div className="text-sm text-slate-600 mb-1">Duration</div>
                <div className="text-2xl font-bold text-slate-900">~15-20 min</div>
              </div>
            </div>
          </div>

          {/* Advanced Configuration */}
          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Advanced Configuration</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Analysis Depth</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Detailed</option>
                  <option>Standard</option>
                  <option>Brief</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tone</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Encouraging</option>
                  <option>Professional</option>
                  <option>Casual</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Multiple Choice</label>
                  <input type="number" value="10" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">True/False</label>
                  <input type="number" value="5" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Flashcards</label>
                  <input type="number" value="15" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button 
              onClick={() => setCurrentView('quiz')}
              className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              Start Quiz
            </button>
            <button 
              onClick={() => setCurrentView('flashcards')}
              className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              View Flashcards
            </button>
          </div>
        </div>
      </main>
    </div>
  );

  const renderQuiz = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">QuizMate</h1>
          </div>
          <button onClick={() => setCurrentView('home')} className="text-slate-600 hover:text-slate-900">
            Exit Quiz
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">Time Elapsed</div>
              <div className="text-3xl font-bold text-slate-900">5:24</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 mb-1">Questions</div>
              <div className="text-3xl font-bold text-slate-900">1/17</div>
            </div>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{width: '6%'}}></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              Multiple Choice
            </span>
            <span className="text-slate-500 text-sm">Question 1 of 17</span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-8">
            {questions[0].question}
          </h3>

          <div className="space-y-3">
            {questions[0].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedAnswer(idx);
                  setShowAnswer(true);
                }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  showAnswer && idx === questions[0].correct
                    ? 'bg-emerald-50 border-emerald-500'
                    : selectedAnswer === idx
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-900">{option}</span>
                  {showAnswer && idx === questions[0].correct && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {showAnswer && (
            <div className="mt-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span className="font-bold text-emerald-900">Correct! 🎉</span>
              </div>
              <p className="text-slate-700 mb-2 font-medium">Why this answer?</p>
              <p className="text-slate-600">
                A data structure is a specific way of organizing and storing data in a computer so that it can be used efficiently.
              </p>
            </div>
          )}

          <button className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
            Next Question →
          </button>
        </div>
      </main>
    </div>
  );

  const renderFlashcards = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">QuizMate - Flashcards</h1>
          </div>
          <button onClick={() => setCurrentView('home')} className="text-slate-600 hover:text-slate-900">
            Exit
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Flashcards</h2>
          <p className="text-slate-600">Card 1 of 15</p>
        </div>

        <div className="mb-6">
          <div className="w-full bg-slate-200 h-2 rounded-full">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{width: '6.67%'}}></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="relative perspective-1000 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-12 min-h-[400px] flex items-center justify-center cursor-pointer hover:shadow-3xl transition-shadow">
            <p className="text-2xl font-semibold text-white text-center">
              A way to store and organize data efficiently.
            </p>
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-slate-400 text-sm">
              Click to flip back
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center gap-4">
          <button className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:border-slate-400 transition-colors">
            ← Previous
          </button>
          <div className="flex gap-2">
            {[...Array(15)].map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx === 0 ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              ></div>
            ))}
          </div>
          <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
            Next →
          </button>
        </div>
      </main>
    </div>
  );

  return (
    <>
      {currentView === 'home' && renderHome()}
      {currentView === 'config' && renderConfig()}
      {currentView === 'quiz' && renderQuiz()}
      {currentView === 'flashcards' && renderFlashcards()}
    </>
  );
};

export default QuizMateRedesign;
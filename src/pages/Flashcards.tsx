import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ChevronLeft, ChevronRight, RotateCw, Sparkles } from 'lucide-react'

const Flashcards = () => {
  const navigate = useNavigate()
  const { processedContent } = useStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const flashcards = processedContent?.flashcards || []

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 max-w-md mx-auto">
          <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-slate-600 mb-6">
            No flashcards available yet
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            Upload Document
          </button>
        </div>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
          Flashcards
        </h2>
        <p className="text-slate-600 text-lg">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard Container */}
      <div className="mb-12" style={{ perspective: '1500px' }}>
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-full cursor-pointer group"
          style={{ 
            height: '420px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)'
          }}
        >
          {/* Card Wrapper */}
          <div
            className="w-full h-full relative"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)'
            }}
          >
            {/* Front of Card */}
            <div
              className="absolute inset-0 bg-white rounded-2xl shadow-lg p-8 sm:p-12 flex flex-col items-center justify-center border-2 border-slate-200 group-hover:border-blue-500 transition-colors"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)'
              }}
            >
              <div className="text-center w-full">
                {currentCard.category && (
                  <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-semibold mb-6 shadow-sm">
                    {currentCard.category}
                  </span>
                )}
                <div className="space-y-6">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 leading-relaxed">
                    {currentCard.front}
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-blue-600 opacity-60 group-hover:opacity-100 transition-opacity">
                    <RotateCw className="w-5 h-5 animate-pulse" />
                    <span className="text-sm font-medium">Click to reveal answer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back of Card */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 flex items-center justify-center border-2 border-slate-700"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="text-center w-full">
                <div className="space-y-6">
                  <p className="text-2xl sm:text-3xl font-semibold text-white leading-relaxed">
                    {currentCard.back}
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-slate-300 opacity-75">
                    <RotateCw className="w-5 h-5" />
                    <span className="text-sm font-medium">Click to flip back</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:shadow-none font-semibold text-slate-900"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        {/* Dot Indicators */}
        <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 max-w-full px-4">
          {flashcards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsFlipped(false)
              }}
              className={`flex-shrink-0 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-600 w-10 h-3 shadow-lg'
                  : 'bg-slate-300 w-3 h-3 hover:bg-blue-400'
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:shadow-none font-semibold text-slate-900"
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default Flashcards

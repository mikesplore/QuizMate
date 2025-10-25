import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { CheckCircle, XCircle, ChevronRight, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import { MultipleChoiceQuestion, MultiSelectQuestion, TrueFalseQuestion, QuizAnswer } from '../types'

const Quiz = () => {
  const navigate = useNavigate()
  const { processedContent, setQuizState } = useStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]) // For multi-select
  const [showFeedback, setShowFeedback] = useState(false)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [startTime] = useState<Date>(new Date())
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date())
  const [correctStreak, setCorrectStreak] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Combine all questions
  const allQuestions = [
    ...(processedContent?.multiple_choice_questions || []).map((q, i) => ({
      type: 'multiple_choice' as const,
      data: q,
      index: i,
    })),
    ...(processedContent?.multi_select_questions || []).map((q, i) => ({
      type: 'multi_select' as const,
      data: q,
      index: i,
    })),
    ...(processedContent?.true_false_questions || []).map((q, i) => ({
      type: 'true_false' as const,
      data: q,
      index: i,
    })),
  ]

  useEffect(() => {
    if (!processedContent) {
      navigate('/')
    }
  }, [processedContent, navigate])

  if (!processedContent || allQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-tertiary-black">No questions available. Please upload a document first.</p>
      </div>
    )
  }

  const currentQuestion = allQuestions[currentIndex]

  const handleMultiSelectToggle = (index: number) => {
    if (showFeedback) return
    setSelectedAnswers(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const handleAnswer = () => {
    const answerToCheck = currentQuestion.type === 'multi_select' ? selectedAnswers : selectedAnswer
    if (currentQuestion.type === 'multi_select' && selectedAnswers.length === 0) return
    if (currentQuestion.type !== 'multi_select' && selectedAnswer === null) return

    const timeTaken = Math.round((new Date().getTime() - questionStartTime.getTime()) / 1000)

    let isCorrect = false
    if (currentQuestion.type === 'multiple_choice') {
      isCorrect = selectedAnswer === (currentQuestion.data as MultipleChoiceQuestion).correct_answer
    } else if (currentQuestion.type === 'multi_select') {
      const correctAnswers = (currentQuestion.data as MultiSelectQuestion).correct_answers.sort()
      const userAnswers = selectedAnswers.sort()
      isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswers)
    } else {
      isCorrect = selectedAnswer === (currentQuestion.data as TrueFalseQuestion).correct_answer
    }

    // Update streak
    if (isCorrect) {
      setCorrectStreak(correctStreak + 1)
    } else {
      setCorrectStreak(0)
    }

    const newAnswer: QuizAnswer = {
      questionIndex: currentIndex,
      questionType: currentQuestion.type,
      userAnswer: answerToCheck,
      isCorrect,
      timeTaken,
    }

    setAnswers([...answers, newAnswer])
    setShowFeedback(true)
  }

  const handleNext = () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setSelectedAnswers([])
      setShowFeedback(false)
      setQuestionStartTime(new Date())
    } else {
      // Quiz complete
      const correctCount = answers.filter((a) => a.isCorrect).length + (answers[answers.length - 1]?.isCorrect ? 1 : 0)
      const score = Math.round((correctCount / allQuestions.length) * 100)
      const endTime = new Date()
      
      setQuizState({
        currentQuestion: currentIndex,
        answers,
        startTime,
        endTime,
        score,
        showFeedback: true,
      })
      navigate('/results')
    }
  }

  const getStreakMessage = () => {
    if (correctStreak >= 5) return { icon: TrendingUp, message: "🔥 On fire! 5+ correct in a row!", color: "text-emerald-600" }
    if (correctStreak >= 3) return { icon: TrendingUp, message: "🎯 Great streak! Keep it up!", color: "text-blue-600" }
    return null
  }

  const streakInfo = getStreakMessage()

  const renderQuestion = () => {
    if (currentQuestion.type === 'multiple_choice') {
      const q = currentQuestion.data as MultipleChoiceQuestion
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-semibold text-slate-900">{q.question}</h2>
            {q.page_reference && (
              <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                Page {q.page_reference}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {q.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showFeedback && setSelectedAnswer(index)}
                disabled={showFeedback}
                className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                  showFeedback
                    ? index === q.correct_answer
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : index === selectedAnswer
                      ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-slate-200 bg-white text-slate-700'
                    : selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {showFeedback && index === q.correct_answer && (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {showFeedback && index === selectedAnswer && index !== q.correct_answer && (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
              </button>
            ))}
          </div>
          {showFeedback && (
            <div className={`rounded-xl p-6 border-2 ${
              selectedAnswer === q.correct_answer 
                ? 'bg-emerald-50 border-emerald-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-start space-x-3 mb-3">
                {selectedAnswer === q.correct_answer ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-lg mb-1">Correct! 🎉</h3>
                      <p className="text-sm text-slate-700">Excellent! That's the right answer.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-red-900 text-lg mb-1">Not quite right</h3>
                      <p className="text-sm text-slate-700">
                        The correct answer was: <strong>{q.options[q.correct_answer]}</strong>
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Why this answer?
                </h4>
                <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (currentQuestion.type === 'multi_select') {
      const q = currentQuestion.data as MultiSelectQuestion
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">{q.question}</h2>
              <p className="text-sm text-blue-600 font-medium">Select all that apply{q.marks ? ` (${q.marks} marks)` : ''}</p>
            </div>
            {q.page_reference && (
              <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                Page {q.page_reference}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {q.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleMultiSelectToggle(index)}
                disabled={showFeedback}
                className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                  showFeedback
                    ? q.correct_answers.includes(index)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : selectedAnswers.includes(index)
                      ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-slate-200 bg-white text-slate-700'
                    : selectedAnswers.includes(index)
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedAnswers.includes(index)}
                      onChange={() => {}}
                      className="w-5 h-5 rounded border-2"
                      disabled={showFeedback}
                    />
                    <span className="font-medium">{option}</span>
                  </div>
                  {showFeedback && q.correct_answers.includes(index) && (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  )}
                  {showFeedback && selectedAnswers.includes(index) && !q.correct_answers.includes(index) && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
          {showFeedback && (
            <div className={`rounded-xl p-6 border-2 ${
              JSON.stringify(selectedAnswers.sort()) === JSON.stringify(q.correct_answers.sort())
                ? 'bg-emerald-50 border-emerald-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-start space-x-3 mb-3">
                {JSON.stringify(selectedAnswers.sort()) === JSON.stringify(q.correct_answers.sort()) ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-lg mb-1">Correct! 🎉</h3>
                      <p className="text-sm text-slate-700">Excellent! You selected all the correct answers.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-red-900 text-lg mb-1">Not quite right</h3>
                      <p className="text-sm text-slate-700 mb-2">
                        The correct answers were:
                      </p>
                      <ul className="list-disc list-inside text-sm text-slate-700">
                        {q.correct_answers.map(idx => (
                          <li key={idx}><strong>{q.options[idx]}</strong></li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-primary-black mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Why these answers?
                </h4>
                <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )
    }

    // True/False questions
    if (currentQuestion.type === 'true_false') {
      const q = currentQuestion.data as TrueFalseQuestion
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-semibold text-slate-900">{q.question}</h2>
            {q.page_reference && (
              <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                Page {q.page_reference}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[true, false].map((value) => (
              <button
                key={String(value)}
                onClick={() => !showFeedback && setSelectedAnswer(value)}
                disabled={showFeedback}
                className={`px-6 py-8 rounded-xl border-2 text-xl font-semibold transition-all ${
                  showFeedback
                    ? value === q.correct_answer
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : value === selectedAnswer
                      ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-slate-200 bg-white text-slate-700'
                    : selectedAnswer === value
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                {value ? 'True' : 'False'}
                {showFeedback && value === q.correct_answer && (
                  <CheckCircle className="w-6 h-6 mx-auto mt-2 text-emerald-600" />
                )}
                {showFeedback && value === selectedAnswer && value !== q.correct_answer && (
                  <XCircle className="w-6 h-6 mx-auto mt-2 text-red-600" />
                )}
              </button>
            ))}
          </div>
          {showFeedback && (
            <div className={`rounded-xl p-6 border-2 ${
              selectedAnswer === q.correct_answer 
                ? 'bg-emerald-50 border-emerald-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-start space-x-3 mb-3">
                {selectedAnswer === q.correct_answer ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-lg mb-1">Correct! 🎉</h3>
                      <p className="text-sm text-slate-700">Excellent! That's the right answer.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-red-900 text-lg mb-1">Not quite right</h3>
                      <p className="text-sm text-slate-700">
                        The correct answer was: <strong>{q.correct_answer ? 'True' : 'False'}</strong>
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Why this answer?
                </h4>
                <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header Card */}
      <div className="mb-6 bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Time Elapsed</p>
              <p className="text-2xl font-bold text-slate-900">{formatTime(elapsedTime)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-600">Progress</p>
            <p className="text-2xl font-bold text-slate-900">{currentIndex + 1}/{allQuestions.length}</p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / allQuestions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Streak Banner */}
      {streakInfo && (
        <div className="mb-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <streakInfo.icon className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-lg font-semibold text-emerald-900">{streakInfo.message}</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-tertiary-black">
            Question {currentIndex + 1} of {allQuestions.length}
          </span>
          <span className="text-sm font-medium text-brand-blue">
            {Math.round(((currentIndex + 1) / allQuestions.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-tertiary-white rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-blue transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / allQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
        <div className="mb-4 flex items-center justify-between">
          <span
            className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${
              currentQuestion.type === 'multiple_choice'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : currentQuestion.type === 'multi_select'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {currentQuestion.type === 'multiple_choice' ? 'Multiple Choice' : currentQuestion.type === 'multi_select' ? 'Multi-Select' : 'True/False'}
          </span>
        </div>
        {renderQuestion()}
      </div>

      {/* Navigation */}
      <div className="flex justify-end items-center">
        {!showFeedback ? (
          <button
            onClick={handleAnswer}
            disabled={currentQuestion.type === 'multi_select' ? selectedAnswers.length === 0 : selectedAnswer === null}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            <span>{currentIndex < allQuestions.length - 1 ? 'Next Question' : 'View Results'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Quiz

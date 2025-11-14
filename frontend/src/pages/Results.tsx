import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Trophy, Target, CheckCircle, XCircle, RotateCcw, Clock, TrendingUp, BookOpen, AlertCircle, RefreshCw } from 'lucide-react'
import { useMemo, useEffect, useState } from 'react'
import { QuizStatistics, PerformanceAnalysis, QuizAttemptRecord } from '../types'
import { submitQuiz } from '../services/api'
import PerformanceAnalytics from '../components/PerformanceAnalytics'
import ReactMarkdown from 'react-markdown'

const Results = () => {
  const navigate = useNavigate()
  const { quizState, processedContent, resetState } = useStore()
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate statistics
  const statistics = useMemo((): QuizStatistics | null => {
    if (!quizState || !processedContent) return null

    const totalQuestions = quizState.answers.length
    const correctAnswers = quizState.answers.filter((a) => a.isCorrect).length
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

    // Calculate total time taken
    const totalTimeTaken = quizState.answers.reduce((sum, answer) => sum + (answer.timeTaken || 0), 0)

    // Calculate topic performance
    const topicPerformance: { [topic: string]: { correct: number; total: number } } = {}
    
    const allQuestions = [
      ...(processedContent.multiple_choice_questions || []),
      ...(processedContent.multi_select_questions || []),
      ...(processedContent.true_false_questions || []),
    ]

    quizState.answers.forEach((answer, idx) => {
      const question = allQuestions[idx]
      const topic = question?.topic || 'General'
      
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { correct: 0, total: 0 }
      }
      
      topicPerformance[topic].total++
      if (answer.isCorrect) {
        topicPerformance[topic].correct++
      }
    })

    // Find weak topics (< 60% accuracy)
    const weakTopics = Object.entries(topicPerformance)
      .filter(([_, perf]) => (perf.correct / perf.total) < 0.6)
      .map(([topic]) => topic)

    return {
      accuracy,
      totalTimeTaken,
      topicPerformance,
      weakTopics,
    }
  }, [quizState, processedContent])

  // Submit quiz for performance analysis
  useEffect(() => {
    const submitQuizResults = async () => {
      if (!quizState || !processedContent || !statistics || performanceAnalysis) return

      setIsSubmitting(true)
      try {
        const sessionId = processedContent.session_id || 'guest'
        const difficulty = 'medium' // Could be from config
        
        const attempt: QuizAttemptRecord = {
          session_id: sessionId,
          topic: 'General Study',
          difficulty: difficulty,
          total_questions: quizState.answers.length,
          correct_answers: quizState.answers.filter(a => a.isCorrect).length,
          score_percentage: statistics.accuracy,
          questions_by_topic: Object.fromEntries(
            Object.entries(statistics.topicPerformance).map(([topic, perf]) => [
              topic,
              { correct: perf.correct, total: perf.total }
            ])
          )
        }

        const analysis = await submitQuiz(attempt)
        setPerformanceAnalysis(analysis)
      } catch (error) {
        console.error('Failed to submit quiz for analysis:', error)
      } finally {
        setIsSubmitting(false)
      }
    }

    submitQuizResults()
  }, [quizState, processedContent, statistics, performanceAnalysis])

  if (!quizState || !processedContent || !statistics) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-tertiary-black mb-4">No quiz results available.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-hover transition-colors"
        >
          Start New Quiz
        </button>
      </div>
    )
  }

  const totalQuestions = quizState.answers.length
  const correctAnswers = quizState.answers.filter((a) => a.isCorrect).length
  const incorrectAnswers = quizState.answers.filter((a) => !a.isCorrect)
  const score = Math.round(statistics.accuracy)

  const getScoreColor = () => {
    if (score >= 80) return 'text-brand-green'
    if (score >= 60) return 'text-brand-blue'
    return 'text-brand-red'
  }

  const getScoreMessage = () => {
    if (score >= 90) return 'Outstanding! 🎉'
    if (score >= 80) return 'Excellent work! 🌟'
    if (score >= 70) return 'Good job! 👍'
    if (score >= 60) return 'Not bad, keep practicing! 📚'
    return 'Keep studying, you can do better! 💪'
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Score Card */}
      <div className="bg-white rounded-lg shadow-card p-8 mb-8 text-center">
        <Trophy className={`w-20 h-20 mx-auto mb-4 ${getScoreColor()}`} />
        <h2 className="text-4xl font-bold text-primary-black mb-2">Quiz Complete!</h2>
        <p className="text-xl text-tertiary-black mb-6">{getScoreMessage()}</p>
        
        <div className="inline-block">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>{score}%</div>
          <p className="text-tertiary-black">
            {correctAnswers} out of {totalQuestions} correct
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="w-6 h-6 text-brand-blue" />
            <h3 className="font-semibold text-primary-black text-sm">Accuracy</h3>
          </div>
          <p className="text-3xl font-bold text-primary-black">{score}%</p>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-6 h-6 text-brand-blue" />
            <h3 className="font-semibold text-primary-black text-sm">Time</h3>
          </div>
          <p className="text-3xl font-bold text-primary-black">
            {Math.floor(statistics.totalTimeTaken / 60)}:{(statistics.totalTimeTaken % 60).toString().padStart(2, '0')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="w-6 h-6 text-brand-green" />
            <h3 className="font-semibold text-primary-black text-sm">Correct</h3>
          </div>
          <p className="text-3xl font-bold text-brand-green">{correctAnswers}/{totalQuestions}</p>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-6 h-6 text-brand-blue" />
            <h3 className="font-semibold text-primary-black text-sm">Avg Time</h3>
          </div>
          <p className="text-3xl font-bold text-primary-black">{Math.round(statistics.totalTimeTaken / totalQuestions)}s</p>
        </div>
      </div>

      {/* Topic Performance */}
      {Object.keys(statistics.topicPerformance).length > 0 && (
        <div className="bg-white rounded-lg shadow-card p-8 mb-8">
          <h3 className="text-2xl font-semibold text-primary-black mb-6 flex items-center">
            <BookOpen className="w-6 h-6 mr-3" />
            Topic Performance
          </h3>
          <div className="space-y-4">
            {Object.entries(statistics.topicPerformance).map(([topic, perf]) => {
              const topicAccuracy = Math.round((perf.correct / perf.total) * 100)
              const isWeak = topicAccuracy < 60
              return (
                <div key={topic} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-primary-black flex items-center">
                      {topic}
                      {isWeak && <AlertCircle className="w-4 h-4 ml-2 text-brand-red" />}
                    </span>
                    <span className={`font-semibold ${
                      topicAccuracy >= 80 ? 'text-brand-green' :
                      topicAccuracy >= 60 ? 'text-brand-blue' :
                      'text-brand-red'
                    }`}>
                      {perf.correct}/{perf.total} ({topicAccuracy}%)
                    </span>
                  </div>
                  <div className="h-2 bg-tertiary-white rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        topicAccuracy >= 80 ? 'bg-brand-green' :
                        topicAccuracy >= 60 ? 'bg-brand-blue' :
                        'bg-brand-red'
                      }`}
                      style={{ width: `${topicAccuracy}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Study Tip Sheet for Wrong Answers */}
      {incorrectAnswers.length > 0 && (
        <div className="bg-red-50 border-2 border-brand-red rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-semibold text-brand-red mb-4 flex items-center">
            <AlertCircle className="w-6 h-6 mr-3" />
            Study Tip Sheet - Review These Topics
          </h3>
          <p className="text-tertiary-black mb-6">
            Focus on these {incorrectAnswers.length} questions you got wrong to improve your understanding:
          </p>
          <div className="space-y-6">
            {incorrectAnswers.map((answer, idx) => {
              const allQuestions = [
                ...(processedContent.multiple_choice_questions || []),
                ...(processedContent.multi_select_questions || []),
                ...(processedContent.true_false_questions || []),
              ]
              const question = allQuestions[answer.questionIndex]
              
              if (!question) return null
              
              return (
                <div key={idx} className="bg-white rounded-lg p-6 border-2 border-gray-200">
                  <div className="flex items-start space-x-3 mb-3">
                    <XCircle className="w-5 h-5 text-brand-red flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-primary-black mb-2">
                        Question {answer.questionIndex + 1}: {question?.question}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Topic:</strong> {question?.topic || 'General'}
                      </p>
                      <div className="bg-green-50 border border-brand-green rounded p-3 mb-3">
                        <div className="text-sm text-gray-700">
                          <strong className="text-brand-green">Correct Answer:</strong>{' '}
                          <ReactMarkdown>
                            {answer.questionType === 'multiple_choice' 
                              ? (question as any).options[(question as any).correct_answer]
                              : answer.questionType === 'multi_select'
                              ? (question as any).correct_answers?.map((idx: number) => (question as any).options[idx]).join(', ')
                              : (question as any).correct_answer ? 'True' : 'False'}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-brand-blue rounded p-3">
                        <div className="text-sm text-gray-700">
                          <strong className="text-brand-blue">Study Tip:</strong>{' '}
                          <ReactMarkdown>
                            {question?.explanation || ''}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Performance Analytics Section */}
      {performanceAnalysis && (
        <PerformanceAnalytics analysis={performanceAnalysis} />
      )}

      {isSubmitting && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 mt-2">Analyzing your performance...</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        {statistics.weakTopics.length > 0 && (
          <button
            onClick={() => {
              // TODO: Implement regenerate quiz with weak topics focus
              alert(`Regenerating quiz focusing on: ${statistics.weakTopics.join(', ')}`)
              navigate('/')
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-brand-red text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Practice Weak Topics</span>
          </button>
        )}
        <button
          onClick={() => navigate('/flashcards')}
          className="flex-1 px-6 py-4 bg-brand-green text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Study Flashcards
        </button>
        <button
          onClick={() => navigate('/study-notes')}
          className="flex-1 px-6 py-4 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-hover transition-colors font-medium"
        >
          View Study Notes
        </button>
        <button
          onClick={() => {
            resetState()
            navigate('/')
          }}
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-white border-2 border-brand-blue text-brand-blue rounded-lg hover:bg-blue-50 transition-colors font-medium"
        >
          <RotateCcw className="w-5 h-5" />
          <span>New Document</span>
        </button>
      </div>
    </div>
  )
}

export default Results

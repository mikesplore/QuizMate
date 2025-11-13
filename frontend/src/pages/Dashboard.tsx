import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Award,
  BookOpen,
  Target,
  Flame,
  ChevronRight,
  FileText,
  Clock,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { getUserStats } from '../services/api'
import { UserStats } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useStore()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    loadUserStats()
  }, [isAuthenticated, navigate, user])

  const loadUserStats = async () => {
    if (!user) return

    try {
      const userStats = await getUserStats(user.user_id)
      setStats(userStats)
    } catch (error) {
      console.error('Failed to load user stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!user || !stats) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user.full_name}! 👋
        </h1>
        <p className="text-gray-600">Here's your learning progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Study Streak */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Flame className="h-8 w-8" />
            <span className="text-3xl font-bold">{stats.current_streak}</span>
          </div>
          <h3 className="text-lg font-semibold">Day Streak</h3>
          <p className="text-sm opacity-90">Keep it going!</p>
        </div>

        {/* Total Documents */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8" />
            <span className="text-3xl font-bold">{stats.total_documents}</span>
          </div>
          <h3 className="text-lg font-semibold">Documents</h3>
          <p className="text-sm opacity-90">Uploaded</p>
        </div>

        {/* Total Quizzes */}
        <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Target className="h-8 w-8" />
            <span className="text-3xl font-bold">{stats.total_quizzes}</span>
          </div>
          <h3 className="text-lg font-semibold">Quizzes Taken</h3>
          <p className="text-sm opacity-90">Total attempts</p>
        </div>

        {/* Average Score */}
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Award className="h-8 w-8" />
            <span className="text-3xl font-bold">{stats.average_score.toFixed(0)}%</span>
          </div>
          <h3 className="text-lg font-semibold">Avg Score</h3>
          <p className="text-sm opacity-90">Keep improving!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
              Recent Documents
            </h2>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
            >
              Upload New
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {stats.recent_documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No documents uploaded yet</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Your First Document
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recent_documents.map((doc) => (
                <div
                  key={doc.document_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.filename}</h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {doc.topics.slice(0, 2).map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
            Performance
          </h2>

          {/* Longest Streak */}
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Longest Streak</p>
                <p className="text-2xl font-bold text-orange-700">
                  {stats.longest_streak} days
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          {/* Topic Performance */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Top Topics</h3>
            <div className="space-y-3">
              {Object.entries(stats.performance_by_topic)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([topic, score]) => (
                  <div key={topic} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{topic}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {score.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          score >= 80
                            ? 'bg-green-500'
                            : score >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
            <div className="grid grid-cols-7 gap-1">
              {stats.weekly_activity.reverse().map((day, idx) => (
                <div key={idx} className="text-center">
                  <div
                    className={`w-full h-12 rounded ${
                      day.quizzes > 0
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                    title={`${day.quizzes} quizzes`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quizzes */}
      {stats.recent_quizzes.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Target className="h-6 w-6 mr-2 text-purple-600" />
            Recent Quiz Attempts
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Questions</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_quizzes.slice(0, 5).map((quiz) => (
                  <tr key={quiz.quiz_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(quiz.quiz_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          quiz.score >= 80
                            ? 'text-green-600'
                            : quiz.score >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {quiz.score.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {quiz.correct_answers}/{quiz.total_questions}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          quiz.difficulty === 'easy'
                            ? 'bg-green-100 text-green-700'
                            : quiz.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {quiz.difficulty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

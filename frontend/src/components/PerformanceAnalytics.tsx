import { PerformanceAnalysis } from '../types'
import { 
  BarChart3, 
  GraduationCap, 
  Lightbulb,
  Trophy,
  AlertTriangle 
} from 'lucide-react'

interface PerformanceAnalyticsProps {
  analysis: PerformanceAnalysis
}

export default function PerformanceAnalytics({ analysis }: PerformanceAnalyticsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-100'
    if (score >= 70) return 'bg-blue-100'
    if (score >= 50) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    }
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Encouragement Message */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start space-x-3">
          <Trophy className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Performance
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {analysis.encouragement_message}
            </p>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${getScoreBgColor(analysis.overall_score)} rounded-lg p-6 border-2 border-opacity-50`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Score</p>
              <p className={`text-4xl font-bold mt-2 ${getScoreColor(analysis.overall_score)}`}>
                {analysis.overall_score.toFixed(0)}%
              </p>
            </div>
            <BarChart3 className={`h-12 w-12 ${getScoreColor(analysis.overall_score)}`} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progression</p>
              <p className="text-lg font-semibold mt-2 text-gray-900 capitalize">
                {analysis.difficulty_progression.replace(/_/g, ' ')}
              </p>
            </div>
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Level</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyBadge(analysis.next_difficulty)}`}>
                {analysis.next_difficulty.toUpperCase()}
              </span>
            </div>
            <Lightbulb className="h-12 w-12 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Your Strengths
          </h3>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-green-800">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {analysis.areas_for_improvement && analysis.areas_for_improvement.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Areas to Focus On
          </h3>
          <ul className="space-y-2">
            {analysis.areas_for_improvement.map((area, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span className="text-yellow-800">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Topic Performance */}
      {analysis.accuracy_by_topic && Object.keys(analysis.accuracy_by_topic).length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance by Topic
          </h3>
          <div className="space-y-3">
            {Object.entries(analysis.accuracy_by_topic).map(([topic, accuracy]) => (
              <div key={topic} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{topic}</span>
                  <span className={`text-sm font-semibold ${getScoreColor(accuracy)}`}>
                    {accuracy.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      accuracy >= 70 ? 'bg-green-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {analysis.recommended_actions && analysis.recommended_actions.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Recommended Next Steps
          </h3>
          <ol className="space-y-2 list-decimal list-inside">
            {analysis.recommended_actions.map((action, index) => (
              <li key={index} className="text-blue-800">
                {action}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

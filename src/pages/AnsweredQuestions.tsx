import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { FileText, CheckCircle, RotateCcw, BookOpen, Award, Clock } from 'lucide-react'

const AnsweredQuestions = () => {
  const navigate = useNavigate()
  const { answeredQuestionPaper, resetState } = useStore()

  if (!answeredQuestionPaper) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-tertiary-black mb-4">No answered questions available.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-hover transition-colors"
        >
          Upload Question Paper
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-brand-blue to-brand-purple rounded-2xl shadow-card-hover p-8 mb-8 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">AI-Generated Answers</h2>
              <p className="text-white/90 text-lg">{answeredQuestionPaper.document_title}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-xl px-4 py-2 backdrop-blur-sm">
              <p className="text-sm text-white/80">Total Questions</p>
              <p className="text-3xl font-bold">{answeredQuestionPaper.total_questions}</p>
            </div>
          </div>
        </div>

        {/* Exam Info */}
        <div className="flex flex-wrap gap-4 mt-6">
          {answeredQuestionPaper.exam_type && (
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
              <Award className="w-5 h-5" />
              <span className="font-medium capitalize">{answeredQuestionPaper.exam_type}</span>
            </div>
          )}
          {answeredQuestionPaper.subject && (
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">{answeredQuestionPaper.subject}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
            <Clock className="w-5 h-5" />
            <span className="font-medium">{new Date(answeredQuestionPaper.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* General Instructions */}
      {answeredQuestionPaper.general_instructions && (
        <div className="bg-brand-blue-light border-2 border-brand-blue rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-primary-black mb-3 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-brand-blue" />
            Instructions
          </h3>
          <p className="text-secondary-black whitespace-pre-wrap">{answeredQuestionPaper.general_instructions}</p>
        </div>
      )}

      {/* Summary */}
      {answeredQuestionPaper.summary && (
        <div className="bg-gradient-to-br from-brand-green-light to-white rounded-2xl border-2 border-brand-green shadow-card p-6 mb-8">
          <h3 className="text-xl font-semibold text-primary-black mb-3 flex items-center">
            <BookOpen className="w-6 h-6 mr-3 text-brand-green" />
            Exam Overview
          </h3>
          <p className="text-secondary-black">{answeredQuestionPaper.summary}</p>
        </div>
      )}

      {/* Questions with Answers */}
      <div className="space-y-6 mb-8">
        <h3 className="text-2xl font-bold text-primary-black flex items-center">
          <FileText className="w-7 h-7 mr-3 text-brand-blue" />
          Questions & Answers
        </h3>

        {answeredQuestionPaper.questions_with_answers.map((qa, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-brand-blue"
          >
            {/* Question Header */}
            <div className="bg-gradient-to-r from-brand-blue-light to-brand-purple-light p-6 border-b-2 border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    {qa.question_number}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-primary-black leading-relaxed">
                      {qa.question_text}
                    </h4>
                  </div>
                </div>
                {qa.marks && (
                  <div className="bg-brand-green text-white rounded-lg px-3 py-1 text-sm font-bold flex-shrink-0 ml-4">
                    {qa.marks} {qa.marks === 1 ? 'mark' : 'marks'}
                  </div>
                )}
              </div>
              {qa.page_reference && (
                <p className="text-xs text-gray-500 ml-13">
                  📄 Page {qa.page_reference}
                </p>
              )}
            </div>

            {/* AI-Generated Answer */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
                  <h5 className="text-sm font-semibold text-brand-blue uppercase tracking-wide">
                    AI-Generated Answer
                  </h5>
                </div>
                <div className="prose prose-sm max-w-none text-secondary-black leading-relaxed whitespace-pre-wrap">
                  {qa.ai_generated_answer}
                </div>
              </div>

              {/* Key Points */}
              {qa.key_points && qa.key_points.length > 0 && (
                <div className="bg-brand-green-light rounded-xl p-4 mt-4">
                  <h5 className="text-sm font-semibold text-brand-green mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Key Points to Remember
                  </h5>
                  <ul className="space-y-2">
                    {qa.key_points.map((point, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-secondary-black">
                        <span className="text-brand-green font-bold mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-4 bg-brand-green text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          📄 Print / Save as PDF
        </button>
        <button
          onClick={() => {
            resetState()
            navigate('/')
          }}
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-white border-2 border-brand-blue text-brand-blue rounded-lg hover:bg-blue-50 transition-colors font-medium"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Answer Another Paper</span>
        </button>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}

export default AnsweredQuestions

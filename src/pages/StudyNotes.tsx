import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { BookOpen, FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const StudyNotes = () => {
  const navigate = useNavigate()
  const { processedContent } = useStore()

  if (!processedContent) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 max-w-md mx-auto">
          <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-slate-600 mb-6">
            No study notes available. Please upload a document first.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
          >
            Upload Document
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Study Materials</h2>
        <p className="text-slate-600">Comprehensive notes and summary</p>
      </div>

      {/* Summary Section */}
      {processedContent.summary && (
        <div className="bg-blue-600 text-white rounded-2xl shadow-lg border-2 border-blue-700 p-8 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-6 h-6" />
            <h3 className="text-2xl font-semibold">Summary</h3>
          </div>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{processedContent.summary}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Key Terms */}
      {processedContent.key_terms && processedContent.key_terms.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
          <h3 className="text-2xl font-semibold text-slate-900 mb-4">Key Terms</h3>
          <div className="flex flex-wrap gap-2">
            {processedContent.key_terms.map((term, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-slate-50 text-slate-900 rounded-lg border border-slate-200 font-medium hover:bg-slate-100 transition-colors"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Study Notes */}
      {processedContent.study_notes && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center space-x-2 mb-6">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl font-semibold text-slate-900">Detailed Notes</h3>
          </div>
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-bold text-slate-900 mt-6 mb-4" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-bold text-slate-900 mt-5 mb-3" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-slate-700 mb-4 leading-relaxed" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-slate-700" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-700" {...props} />
                ),
                li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-slate-900" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code
                    className="bg-slate-100 px-2 py-1 rounded text-sm font-mono text-blue-600 border border-slate-200"
                    {...props}
                  />
                ),
              }}
            >
              {processedContent.study_notes}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={() => navigate('/quiz')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
        >
          Take Quiz
        </button>
        <button
          onClick={() => navigate('/flashcards')}
          className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all font-semibold"
        >
          Review Flashcards
        </button>
      </div>
    </div>
  )
}

export default StudyNotes

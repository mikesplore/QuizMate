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
        <p className="text-xl text-tertiary-black mb-4">
          No study notes available. Please upload a document first.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-hover transition-colors"
        >
          Upload Document
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary-black mb-2">Study Materials</h2>
        <p className="text-tertiary-black">Comprehensive notes and summary</p>
      </div>

      {/* Summary Section */}
      {processedContent.summary && (
        <div className="bg-brand-blue text-white rounded-lg shadow-card p-8 mb-6">
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
        <div className="bg-white rounded-lg shadow-card p-8 mb-6">
          <h3 className="text-2xl font-semibold text-primary-black mb-4">Key Terms</h3>
          <div className="flex flex-wrap gap-2">
            {processedContent.key_terms.map((term, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-secondary-white text-primary-black rounded-lg border border-tertiary-white font-medium"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Study Notes */}
      {processedContent.study_notes && (
        <div className="bg-white rounded-lg shadow-card p-8">
          <div className="flex items-center space-x-2 mb-6">
            <BookOpen className="w-6 h-6 text-brand-blue" />
            <h3 className="text-2xl font-semibold text-primary-black">Detailed Notes</h3>
          </div>
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-bold text-primary-black mt-6 mb-4" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-bold text-primary-black mt-5 mb-3" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-semibold text-primary-black mt-4 mb-2" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-tertiary-black mb-4 leading-relaxed" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-tertiary-black" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4 text-tertiary-black" {...props} />
                ),
                li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-primary-black" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code
                    className="bg-secondary-white px-2 py-1 rounded text-sm font-mono text-brand-blue"
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
          className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-hover transition-colors"
        >
          Take Quiz
        </button>
        <button
          onClick={() => navigate('/flashcards')}
          className="px-6 py-3 bg-white border border-tertiary-white text-primary-black rounded-lg hover:bg-secondary-white transition-colors"
        >
          Review Flashcards
        </button>
      </div>
    </div>
  )
}

export default StudyNotes

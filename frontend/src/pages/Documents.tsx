import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getUserDocuments, getDocumentContent } from '../services/api'
import { FileText, Calendar, Hash, Tag, Loader2, BookOpen, Download, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Document {
  document_id: string
  title: string
  upload_date: string
  document_type: string
  page_count: number
  topics: string[]
  has_content: boolean
}

interface DocumentContent {
  session_id: string
  multiple_choice_questions: any[]
  flashcards: any[]
  study_notes: string
  key_concepts: string[]
  topics_covered: string[]
  difficulty: string
  exam_format: string
}

const Documents = () => {
  const navigate = useNavigate()
  const { user, setProcessedContent } = useStore()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [selectedContent, setSelectedContent] = useState<DocumentContent | null>(null)
  const [viewingNotes, setViewingNotes] = useState(false)

  useEffect(() => {
    if (user?.user_id) {
      loadDocuments()
    } else {
      navigate('/auth')
    }
  }, [user])

  const loadDocuments = async () => {
    if (!user?.user_id) return
    
    try {
      setLoading(true)
      const response = await getUserDocuments(user.user_id)
      setDocuments(response.documents || [])
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocument = async (doc: Document) => {
    if (!doc.has_content) {
      alert('No generated content available for this document')
      return
    }

    try {
      const content = await getDocumentContent(doc.document_id)
      setSelectedDoc(doc)
      setSelectedContent(content)
      setViewingNotes(false)
    } catch (error) {
      console.error('Failed to load document content:', error)
      alert('Failed to load document content')
    }
  }

  const handleLoadToSession = (content: DocumentContent) => {
    // Load the content into the current session
    setProcessedContent({
      session_id: content.session_id,
      timestamp: new Date().toISOString(),
      topics: content.topics_covered || [],
      summary: '',
      key_terms: content.key_concepts || [],
      multiple_choice_questions: content.multiple_choice_questions || [],
      multi_select_questions: [],
      true_false_questions: [],
      short_answer_questions: [],
      flashcards: content.flashcards || [],
      study_notes: content.study_notes || '',
      difficulty: content.difficulty || 'medium',
      exam_format: content.exam_format || 'general'
    })
    
    navigate('/dashboard')
  }

  const handleDownloadNotes = (notes: string, title: string) => {
    const blob = new Blob([notes], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_notes.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">My Documents</h2>
        <p className="text-slate-600">View and manage your uploaded documents and generated study materials</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-600 mb-6">No documents uploaded yet</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Upload Your First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              All Documents ({documents.length})
            </h3>
            {documents.map((doc) => (
              <div
                key={doc.document_id}
                className={`bg-white rounded-lg shadow-md border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedDoc?.document_id === doc.document_id ? 'border-blue-600' : 'border-slate-200'
                }`}
                onClick={() => handleViewDocument(doc)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{doc.title}</h4>
                      <p className="text-sm text-slate-500 flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                  <span className="flex items-center space-x-1">
                    <Hash className="h-4 w-4" />
                    <span>{doc.page_count} pages</span>
                  </span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs uppercase">
                    {doc.document_type}
                  </span>
                  {doc.has_content && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      ✓ Content Generated
                    </span>
                  )}
                </div>

                {doc.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {doc.topics.slice(0, 3).map((topic, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        <Tag className="h-3 w-3" />
                        <span>{topic}</span>
                      </span>
                    ))}
                    {doc.topics.length > 3 && (
                      <span className="text-xs text-slate-500">+{doc.topics.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Document Preview */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            {selectedDoc && selectedContent ? (
              <div className="bg-white rounded-lg shadow-md border-2 border-slate-200 p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedDoc.title}</h3>
                  <p className="text-sm text-slate-500">
                    Uploaded on {new Date(selectedDoc.upload_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Questions</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedContent.multiple_choice_questions?.length || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Flashcards</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedContent.flashcards?.length || 0}
                    </p>
                  </div>
                </div>

                {selectedContent.topics_covered && selectedContent.topics_covered.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-900 mb-3">Topics Covered</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedContent.topics_covered.map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={() => handleLoadToSession(selectedContent)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Load to Dashboard</span>
                  </button>

                  {selectedContent.study_notes && (
                    <>
                      <button
                        onClick={() => setViewingNotes(!viewingNotes)}
                        className="w-full px-4 py-3 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors font-semibold flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-5 w-5" />
                        <span>{viewingNotes ? 'Hide' : 'View'} Study Notes</span>
                      </button>

                      <button
                        onClick={() => handleDownloadNotes(selectedContent.study_notes, selectedDoc.title)}
                        className="w-full px-4 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-semibold flex items-center justify-center space-x-2"
                      >
                        <Download className="h-5 w-5" />
                        <span>Download Notes</span>
                      </button>
                    </>
                  )}
                </div>

                {viewingNotes && selectedContent.study_notes && (
                  <div className="mt-6 border-t-2 border-slate-200 pt-6">
                    <h4 className="font-semibold text-slate-900 mb-4">Study Notes</h4>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{selectedContent.study_notes}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">Select a document to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents

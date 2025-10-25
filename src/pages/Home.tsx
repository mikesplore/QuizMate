import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Settings, Loader2, XCircle, AlertCircle, Zap, Clock, BookOpen, CheckCircle, Trash2, Edit3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { uploadDocument, previewDocument } from '../services/api'
import { useStore } from '../store/useStore'
import { defaultConfig } from '../config/defaultConfig'
import { DocumentProcessingRequest } from '../types'

const Home = () => {
  const navigate = useNavigate()
  const { setProcessedContent, setAnsweredQuestionPaper, setLoading, setError, error, quizType, setQuizType, documentPreview, setDocumentPreview } = useStore()
  const [config, setConfig] = useState<DocumentProcessingRequest>(defaultConfig)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [isAnsweringQuestions, setIsAnsweringQuestions] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setSelectedFile(file)
    setError(null)
    setIsAnalyzing(true)

    try {
      // Get document preview
      const preview = await previewDocument(file)
      setDocumentPreview(preview)
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to preview document.'
      console.error('Preview error:', error)
      setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }, [setError, setDocumentPreview])

  const handleGenerateQuiz = async () => {
    if (!selectedFile) return

    setIsGeneratingQuiz(true)
    setLoading(true)
    setError(null)

    try {
      // Determine document type from extension
      const extension = selectedFile.name.split('.').pop()?.toLowerCase() || 'txt'
      const typeMap: Record<string, 'pdf' | 'docx' | 'txt' | 'image'> = {
        pdf: 'pdf',
        docx: 'docx',
        txt: 'txt',
        png: 'image',
        jpg: 'image',
        jpeg: 'image',
      }
      
      const updatedConfig = {
        ...config,
        document_type: typeMap[extension] || 'txt',
        document_metadata: {
          ...config.document_metadata,
          title: selectedFile.name,
        },
      }

      const result = await uploadDocument(selectedFile, updatedConfig)
      setProcessedContent(result)
      setLoading(false)
      setIsGeneratingQuiz(false)
      navigate('/quiz')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to process document. Please try again.'
      console.error('Upload error:', error)
      setError(errorMessage)
      setLoading(false)
      setIsGeneratingQuiz(false)
    }
  }

  const handleAnswerQuestions = async () => {
    if (!selectedFile) return

    setIsAnsweringQuestions(true)
    setLoading(true)
    setError(null)

    try {
      const { answerQuestionPaper } = await import('../services/api')
      const result = await answerQuestionPaper(selectedFile)
      setAnsweredQuestionPaper(result)
      setLoading(false)
      setIsAnsweringQuestions(false)
      navigate('/answered-questions')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to generate answers. Please try again.'
      console.error('Answer generation error:', error)
      setError(errorMessage)
      setLoading(false)
      setIsAnsweringQuestions(false)
    }
  }

  const handleRemoveDocument = () => {
    setSelectedFile(null)
    setDocumentPreview(null)
    setError(null)
    setIsAnalyzing(false)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
    disabled: isGeneratingQuiz || isAnsweringQuestions,
  })

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
          Transform Your Documents into Study Materials
        </h2>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
          Upload any document and let AI generate quizzes, flashcards, and study notes
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-1">Processing Failed</h3>
              <p className="text-slate-700 mb-3">{error}</p>
              <button
                onClick={() => setError(null)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium"
              >
                <XCircle className="w-4 h-4" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      {!documentPreview && !isAnalyzing && (
        <div
          {...getRootProps()}
          className={`bg-white rounded-2xl shadow-lg border-2 border-dashed transition-all duration-300 p-12 sm:p-16 text-center cursor-pointer mb-12 ${
            isDragActive
              ? 'border-slate-400 bg-slate-50'
              : 'border-slate-300 hover:border-slate-400'
          } ${isGeneratingQuiz || isAnsweringQuestions ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-5">
            {isGeneratingQuiz || isAnsweringQuestions ? (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
                  <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Processing your document...</h3>
                <p className="text-sm text-slate-600">This may take a minute ☕</p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
                  <Upload className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop a file or click to browse'}
                </h3>
                <p className="text-slate-600 mb-4">
                  Supported: PDF, DOCX, TXT, PNG, JPG • Max 50MB
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Textbooks, lecture notes, research papers</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span>Receipts, personal photos, ads</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Analyzing Placeholder */}
      {isAnalyzing && selectedFile && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-12 animate-pulse">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 bg-slate-100 rounded-xl">
              <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-slate-900 mb-2">
                Analyzing Document...
              </h3>
              <p className="text-slate-600 font-medium mb-4">{selectedFile.name}</p>
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <div className="space-y-3">
              <div className="h-3 bg-slate-200 rounded w-full"></div>
              <div className="h-3 bg-slate-200 rounded w-5/6"></div>
              <div className="h-3 bg-slate-200 rounded w-4/5"></div>
              <div className="h-3 bg-slate-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview */}
      {documentPreview && selectedFile && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-12">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4 flex-1">
              <div className="p-3 bg-slate-900 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-slate-900 mb-1">
                  Document Loaded
                </h3>
                <p className="text-slate-600 font-medium">{selectedFile.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRemoveDocument}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm flex items-center gap-2"
                title="Upload another document"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Another</span>
              </button>
              <button
                onClick={handleRemoveDocument}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                title="Remove document"
              >
                <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
              </button>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3 text-slate-700">
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <FileText className="w-4 h-4 text-slate-700" />
              </div>
              <span className="font-semibold">Type:</span>
              <span className="text-slate-600">{selectedFile.type || 'Unknown'}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-700">
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <FileText className="w-4 h-4 text-slate-700" />
              </div>
              <span className="font-semibold">Size:</span>
              <span className="text-slate-600">{(selectedFile.size / 1024).toFixed(2)} KB</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-700">
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <FileText className="w-4 h-4 text-slate-700" />
              </div>
              <span className="font-semibold">Words:</span>
              <span className="text-slate-600">{documentPreview.wordCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-700">
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <FileText className="w-4 h-4 text-slate-700" />
              </div>
              <span className="font-semibold">Est. Questions:</span>
              <span className="text-slate-600">{documentPreview.estimatedQuestionCount}</span>
            </div>
            {documentPreview.questionPaperDetection?.is_question_paper && (
              <div className="flex items-center space-x-3 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-blue-900 text-sm">Question Paper Detected</span>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Confidence: {documentPreview.questionPaperDetection.confidence}
                  </p>
                </div>
              </div>
            )}
          </div>

          {documentPreview.text && (
            <div className="mt-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                <div className="p-1 bg-white rounded border border-slate-200">
                  <FileText className="w-4 h-4 text-slate-700" />
                </div>
                <span>Preview</span>
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                {documentPreview.text.slice(0, 500)}...
              </p>
            </div>
          )}

          {/* Generate Button */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerateQuiz}
              disabled={isGeneratingQuiz || isAnsweringQuestions}
              className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              {isGeneratingQuiz ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Generate Study Materials</span>
                </>
              )}
            </button>

            {documentPreview.questionPaperDetection?.is_question_paper && (
              <button
                onClick={handleAnswerQuestions}
                disabled={isGeneratingQuiz || isAnsweringQuestions}
                className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                {isAnsweringQuestions ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Answering Questions...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Answer Questions</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quiz Type Selection */}
      {!documentPreview && (
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Choose Your Study Mode</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Review */}
          <button
            onClick={() => {
              setQuizType('quick')
              setConfig({
                ...config,
                output_preferences: {
                  ...config.output_preferences,
                  content_types: {
                    ...config.output_preferences.content_types,
                    questions: {
                      ...config.output_preferences.content_types.questions,
                      types: {
                        ...config.output_preferences.content_types.questions.types,
                        multiple_choice: { ...config.output_preferences.content_types.questions.types.multiple_choice, count: 5 },
                        true_false: { ...config.output_preferences.content_types.questions.types.true_false, count: 0 },
                      },
                    },
                    flashcards: { ...config.output_preferences.content_types.flashcards, count: 10 },
                  },
                },
              })
            }}
            className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-lg ${
              quizType === 'quick'
                ? 'border-emerald-500 bg-emerald-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-emerald-300'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                quizType === 'quick' ? 'bg-emerald-600' : 'bg-slate-100 group-hover:bg-emerald-100'
              }`}>
                <Zap className={`w-7 h-7 ${quizType === 'quick' ? 'text-white' : 'text-slate-700 group-hover:text-emerald-600'}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
                  Quick Review
                  {quizType === 'quick' && <CheckCircle className="ml-2 w-5 h-5 text-emerald-600" />}
                </h4>
                <p className="text-sm text-slate-600 mb-3">Perfect for a fast study session</p>
                <ul className="text-sm text-slate-700 space-y-1.5">
                  <li className="flex items-center"><Clock className="mr-2 w-4 h-4 text-slate-500" /> 5 Multiple Choice</li>
                  <li className="flex items-center"><FileText className="mr-2 w-4 h-4 text-slate-500" /> 10 Flashcards</li>
                  <li className="flex items-center"><span className="mr-2 text-slate-500">⏱️</span> ~5-10 minutes</li>
                </ul>
              </div>
            </div>
          </button>

          {/* Standard Test */}
          <button
            onClick={() => {
              setQuizType('standard')
              setConfig({
                ...config,
                output_preferences: {
                  ...config.output_preferences,
                  content_types: {
                    ...config.output_preferences.content_types,
                    questions: {
                      ...config.output_preferences.content_types.questions,
                      types: {
                        ...config.output_preferences.content_types.questions.types,
                        multiple_choice: { ...config.output_preferences.content_types.questions.types.multiple_choice, count: 10 },
                        true_false: { ...config.output_preferences.content_types.questions.types.true_false, count: 5 },
                      },
                    },
                    flashcards: { ...config.output_preferences.content_types.flashcards, count: 15 },
                  },
                },
              })
            }}
            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-lg ${
              quizType === 'standard'
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-blue-300'
            }`}
          >
            {quizType !== 'standard' && (
              <span className="absolute top-3 right-3 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                Recommended
              </span>
            )}
            <div className="flex items-start space-x-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                quizType === 'standard' ? 'bg-blue-600' : 'bg-slate-100 group-hover:bg-blue-100'
              }`}>
                <Clock className={`w-7 h-7 ${quizType === 'standard' ? 'text-white' : 'text-slate-700 group-hover:text-blue-600'}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
                  Standard Test
                  {quizType === 'standard' && <CheckCircle className="ml-2 w-5 h-5 text-blue-600" />}
                </h4>
                <p className="text-sm text-slate-600 mb-3">Comprehensive assessment</p>
                <ul className="text-sm text-slate-700 space-y-1.5">
                  <li className="flex items-center"><FileText className="mr-2 w-4 h-4 text-slate-500" /> 10 Multiple Choice</li>
                  <li className="flex items-center"><CheckCircle className="mr-2 w-4 h-4 text-slate-500" /> 5 True/False</li>
                  <li className="flex items-center"><FileText className="mr-2 w-4 h-4 text-slate-500" /> 15 Flashcards</li>
                  <li className="flex items-center"><span className="mr-2 text-slate-500">⏱️</span> ~15-20 minutes</li>
                </ul>
              </div>
            </div>
          </button>

          {/* Comprehensive Study */}
          <button
            onClick={() => {
              setQuizType('comprehensive')
              setConfig({
                ...config,
                output_preferences: {
                  ...config.output_preferences,
                  content_types: {
                    ...config.output_preferences.content_types,
                    questions: {
                      ...config.output_preferences.content_types.questions,
                      types: {
                        ...config.output_preferences.content_types.questions.types,
                        multiple_choice: { ...config.output_preferences.content_types.questions.types.multiple_choice, count: 15 },
                        true_false: { ...config.output_preferences.content_types.questions.types.true_false, count: 10 },
                        short_answer: { ...config.output_preferences.content_types.questions.types.short_answer, count: 8 },
                      },
                    },
                    flashcards: { ...config.output_preferences.content_types.flashcards, count: 20 },
                  },
                },
              })
            }}
            className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-lg ${
              quizType === 'comprehensive'
                ? 'border-amber-500 bg-amber-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-amber-300'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                quizType === 'comprehensive' ? 'bg-amber-600' : 'bg-slate-100 group-hover:bg-amber-100'
              }`}>
                <BookOpen className={`w-7 h-7 ${quizType === 'comprehensive' ? 'text-white' : 'text-slate-700 group-hover:text-amber-600'}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
                  Deep Dive
                  {quizType === 'comprehensive' && <CheckCircle className="ml-2 w-5 h-5 text-amber-600" />}
                </h4>
                <p className="text-sm text-slate-600 mb-3">Full mastery preparation</p>
                <ul className="text-sm text-slate-700 space-y-1.5">
                  <li className="flex items-center"><FileText className="mr-2 w-4 h-4 text-slate-500" /> 15 Multiple Choice</li>
                  <li className="flex items-center"><CheckCircle className="mr-2 w-4 h-4 text-slate-500" /> 10 True/False</li>
                  <li className="flex items-center"><Edit3 className="mr-2 w-4 h-4 text-slate-500" /> 8 Short Answer</li>
                  <li className="flex items-center"><FileText className="mr-2 w-4 h-4 text-slate-500" /> 20 Flashcards</li>
                  <li className="flex items-center"><span className="mr-2 text-slate-500">⏱️</span> ~30-45 minutes</li>
                </ul>
              </div>
            </div>
          </button>
        </div>
        </div>
      )}

      {/* Configuration Section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-slate-900 hover:text-blue-600 transition-colors font-medium"
        >
          <Settings className="w-5 h-5" />
          <span>Advanced Configuration</span>
        </button>

        {showAdvanced && (
          <div className="mt-6 space-y-6">
            {/* Analysis Depth */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Analysis Depth
              </label>
              <select
                value={config.processing_instructions.analysis_depth}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    processing_instructions: {
                      ...config.processing_instructions,
                      analysis_depth: e.target.value as any,
                    },
                  })
                }
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
              >
                <option value="quick">Quick</option>
                <option value="detailed">Detailed</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Tone</label>
              <select
                value={config.customization.tone}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    customization: {
                      ...config.customization,
                      tone: e.target.value as any,
                    },
                  })
                }
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="encouraging">Encouraging</option>
              </select>
            </div>

            {/* Question Counts */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Multiple Choice
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={config.output_preferences.content_types.questions.types.multiple_choice.count}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      output_preferences: {
                        ...config.output_preferences,
                        content_types: {
                          ...config.output_preferences.content_types,
                          questions: {
                            ...config.output_preferences.content_types.questions,
                            types: {
                              ...config.output_preferences.content_types.questions.types,
                              multiple_choice: {
                                ...config.output_preferences.content_types.questions.types.multiple_choice,
                                count: parseInt(e.target.value),
                              },
                            },
                          },
                        },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  True/False
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={config.output_preferences.content_types.questions.types.true_false.count}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      output_preferences: {
                        ...config.output_preferences,
                        content_types: {
                          ...config.output_preferences.content_types,
                          questions: {
                            ...config.output_preferences.content_types.questions,
                            types: {
                              ...config.output_preferences.content_types.questions.types,
                              true_false: {
                                ...config.output_preferences.content_types.questions.types.true_false,
                                count: parseInt(e.target.value),
                              },
                            },
                          },
                        },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Flashcards
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.output_preferences.content_types.flashcards.count}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      output_preferences: {
                        ...config.output_preferences,
                        content_types: {
                          ...config.output_preferences.content_types,
                          flashcards: {
                            ...config.output_preferences.content_types.flashcards,
                            count: parseInt(e.target.value),
                          },
                        },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="w-12 h-12 bg-brand-blue rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-primary-black mb-2">Smart Quiz Generation</h3>
          <p className="text-tertiary-black">
            AI-powered questions with multiple choice, true/false, and short answer formats
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="w-12 h-12 bg-brand-green rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-primary-black mb-2">Study Notes</h3>
          <p className="text-tertiary-black">
            Comprehensive notes with key concepts, examples, and summaries
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="w-12 h-12 bg-brand-blue rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-primary-black mb-2">Interactive Flashcards</h3>
          <p className="text-tertiary-black">
            Digital flashcards for quick review and memorization
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home

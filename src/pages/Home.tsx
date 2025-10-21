import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Settings, Loader2, XCircle, AlertCircle, Zap, Clock, BookOpen, Eye, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { uploadDocument, previewDocument } from '../services/api'
import { useStore } from '../store/useStore'
import { defaultConfig } from '../config/defaultConfig'
import { DocumentProcessingRequest } from '../types'

const Home = () => {
  const navigate = useNavigate()
  const { setProcessedContent, setLoading, setError, isLoading, error, quizType, setQuizType, documentPreview, setDocumentPreview } = useStore()
  const [config, setConfig] = useState<DocumentProcessingRequest>(defaultConfig)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setSelectedFile(file)
    setError(null)

    try {
      // Get document preview
      const preview = await previewDocument(file)
      setDocumentPreview(preview)
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to preview document.'
      console.error('Preview error:', error)
      setError(errorMessage)
    }
  }, [setError, setDocumentPreview])

  const handleGenerateQuiz = async () => {
    if (!selectedFile) return

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
      navigate('/quiz')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to process document. Please try again.'
      console.error('Upload error:', error)
      setError(errorMessage)
      setLoading(false)
    }
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
    disabled: isLoading,
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl sm:text-5xl font-bold text-primary-black mb-4">
          Transform Your Documents into Study Materials
        </h2>
        <p className="text-lg sm:text-xl text-secondary-black max-w-2xl mx-auto mb-4">
          Upload any document and let AI generate quizzes, flashcards, and study notes
        </p>
  <div className="max-w-2xl mx-auto bg-brand-blue-light rounded-xl p-4 text-left">
          <p className="text-sm text-secondary-black mb-2">
            <span className="font-semibold text-brand-blue">📚 Accepted Content:</span> Textbooks, lecture notes, research papers, study guides, educational articles, course materials
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-brand-red">❌ Not Suitable:</span> Receipts, personal photos, menus, advertisements, shopping lists
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-gradient-to-r from-brand-red-light to-red-100 border-2 border-brand-red rounded-2xl p-5 shadow-card animate-shake">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-brand-red flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-brand-red mb-1">Processing Failed</h3>
              <p className="text-gray-700 mb-3">{error}</p>
              <button
                onClick={() => setError(null)}
                className="flex items-center space-x-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
              >
                <XCircle className="w-4 h-4" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`relative border-3 border-dashed rounded-2xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-4 border-dashed border-brand-blue bg-brand-blue-light shadow-glow-blue scale-[1.02]'
            : 'border-4 border-dashed border-primary-black hover:border-brand-blue bg-white hover:bg-brand-blue-light/30 hover:shadow-card-hover'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-5">
          {isLoading ? (
            <>
              <div className="relative">
                <Loader2 className="w-20 h-20 text-brand-blue animate-spin" />
                <div className="absolute inset-0 w-20 h-20 bg-brand-blue rounded-full opacity-20 animate-pulse" />
              </div>
              <p className="text-xl font-semibold text-primary-black">Processing your document...</p>
              <p className="text-sm text-tertiary-black">This may take a minute ☕</p>
            </>
          ) : (
            <>
              <div className="relative">
                <Upload className="w-20 h-20 text-brand-blue" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-green rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">+</span>
                </div>
              </div>
              <div>
                <p className="text-xl font-semibold text-primary-black mb-2">
                  {isDragActive ? '📁 Drop your file here' : '📤 Drag & drop a file or click to browse'}
                </p>
                <p className="text-sm text-tertiary-black">
                  Supported: PDF, DOCX, TXT, PNG, JPG • Max 50MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Document Preview */}
      {documentPreview && (
        <div className="mt-8 bg-gradient-to-br from-white to-brand-green-light rounded-2xl shadow-card-hover p-6 sm:p-8 border-2 border-brand-green animate-slideIn">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-brand-blue rounded-xl flex items-center justify-center shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-black">Document Preview</h3>
                <p className="text-sm text-tertiary-black truncate max-w-xs sm:max-w-md">
                  📄 {selectedFile?.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setDocumentPreview(null)
                setSelectedFile(null)
              }}
              className="text-gray-400 hover:text-brand-red transition-all hover:scale-110 p-2 hover:bg-red-50 rounded-lg"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:border-brand-blue transition-colors">
              <p className="text-xs text-gray-500 mb-1 font-medium">Word Count</p>
              <p className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">{documentPreview.wordCount.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:border-brand-blue transition-colors">
              <p className="text-xs text-gray-500 mb-1 font-medium">Pages</p>
              <p className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">{documentPreview.pageCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:border-brand-blue transition-colors">
              <p className="text-xs text-gray-500 mb-1 font-medium">Est. Questions</p>
              <p className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">{documentPreview.estimatedQuestionCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:border-brand-blue transition-colors">
              <p className="text-xs text-gray-500 mb-1 font-medium">Est. Time</p>
              <p className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                {quizType === 'quick' ? '5-10' : quizType === 'standard' ? '15-20' : '30-45'}min
              </p>
            </div>
          </div>

          {documentPreview.estimatedTopics.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-primary-black mb-3 flex items-center">
                <span className="mr-2">🏷️</span> Detected Topics:
              </p>
              <div className="flex flex-wrap gap-2">
                {documentPreview.estimatedTopics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-semibold text-primary-black mb-3 flex items-center">
              <span className="mr-2">📝</span> Content Preview:
            </p>
            <div className="bg-white rounded-xl p-5 max-h-48 overflow-y-auto shadow-inner border border-gray-200 scrollbar-thin scrollbar-thumb-brand-blue scrollbar-track-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{documentPreview.text}</p>
            </div>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={isLoading}
            className="w-full bg-gradient-brand text-white py-4 rounded-xl font-bold text-lg hover:shadow-glow-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Generating Study Materials...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Generate {quizType === 'quick' ? 'Quick' : quizType === 'standard' ? 'Standard' : 'Comprehensive'} Quiz</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Quiz Type Selection */}
      {!documentPreview && (
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-primary-black mb-6 text-center">Choose Your Study Mode</h3>
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
            className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-105 hover:shadow-card-hover ${
              quizType === 'quick'
                ? 'border-brand-blue bg-gradient-to-br from-brand-blue-light to-white shadow-glow-blue'
                : 'border-gray-200 bg-white hover:border-brand-blue'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                quizType === 'quick' ? 'bg-gradient-brand' : 'bg-gray-100 group-hover:bg-brand-blue'
              }`}>
                <Zap className={`w-7 h-7 ${quizType === 'quick' ? 'text-white' : 'text-brand-blue group-hover:text-white'}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-primary-black mb-2 flex items-center">
                  Quick Review
                  {quizType === 'quick' && <span className="ml-2 text-brand-blue">✓</span>}
                </h4>
                <p className="text-sm text-gray-600 mb-3">Perfect for a fast study session</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center"><span className="mr-2">⚡</span> 5 Multiple Choice</li>
                  <li className="flex items-center"><span className="mr-2">🎴</span> 10 Flashcards</li>
                  <li className="flex items-center"><span className="mr-2">⏱️</span> ~5-10 minutes</li>
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
            className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-105 hover:shadow-card-hover ${
              quizType === 'standard'
                ? 'border-brand-green bg-gradient-to-br from-brand-green-light to-white shadow-glow-green'
                : 'border-gray-200 bg-white hover:border-brand-green'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                quizType === 'standard' ? 'bg-gradient-to-br from-brand-green to-brand-blue' : 'bg-gray-100 group-hover:bg-brand-green'
              }`}>
                <Clock className={`w-7 h-7 ${quizType === 'standard' ? 'text-white' : 'text-brand-green group-hover:text-white'}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-primary-black mb-2 flex items-center">
                  Standard Test
                  {quizType === 'standard' && <span className="ml-2 text-brand-green">✓</span>}
                </h4>
                <p className="text-sm text-gray-600 mb-3">Comprehensive assessment</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center"><span className="mr-2">📝</span> 10 Multiple Choice</li>
                  <li className="flex items-center"><span className="mr-2">✓</span> 5 True/False</li>
                  <li className="flex items-center"><span className="mr-2">🎴</span> 15 Flashcards</li>
                  <li className="flex items-center"><span className="mr-2">⏱️</span> ~15-20 minutes</li>
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
            className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-105 hover:shadow-card-hover ${
              quizType === 'comprehensive'
                ? 'border-brand-purple bg-gradient-to-br from-brand-purple-light to-white shadow-lg'
                : 'border-gray-200 bg-white hover:border-brand-purple'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                quizType === 'comprehensive' ? 'bg-gradient-to-br from-brand-purple to-brand-blue' : 'bg-gray-100 group-hover:bg-brand-purple'
              }`}>
                <BookOpen className={`w-7 h-7 ${quizType === 'comprehensive' ? 'text-white' : 'text-brand-purple group-hover:text-white'}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-primary-black mb-2 flex items-center">
                  Deep Dive
                  {quizType === 'comprehensive' && <span className="ml-2 text-brand-purple">✓</span>}
                </h4>
                <p className="text-sm text-gray-600 mb-3">Full mastery preparation</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center"><span className="mr-2">📝</span> 15 Multiple Choice</li>
                  <li className="flex items-center"><span className="mr-2">✓</span> 10 True/False</li>
                  <li className="flex items-center"><span className="mr-2">✍️</span> 8 Short Answer</li>
                  <li className="flex items-center"><span className="mr-2">🎴</span> 20 Flashcards</li>
                  <li className="flex items-center"><span className="mr-2">⏱️</span> ~30-45 minutes</li>
                </ul>
              </div>
            </div>
          </button>
        </div>
        </div>
      )}

      {/* Configuration Section */}
      <div className="mt-8 bg-white rounded-lg shadow-card p-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-primary-black hover:text-brand-blue transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Advanced Configuration</span>
        </button>

        {showAdvanced && (
          <div className="mt-6 space-y-6">
            {/* Analysis Depth */}
            <div>
              <label className="block text-sm font-medium text-primary-black mb-2">
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
                className="w-full px-4 py-2 border border-tertiary-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="quick">Quick</option>
                <option value="detailed">Detailed</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-primary-black mb-2">Tone</label>
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
                className="w-full px-4 py-2 border border-tertiary-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="encouraging">Encouraging</option>
              </select>
            </div>

            {/* Question Counts */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-black mb-2">
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
                  className="w-full px-4 py-2 border border-tertiary-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black mb-2">
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
                  className="w-full px-4 py-2 border border-tertiary-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black mb-2">
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
                  className="w-full px-4 py-2 border border-tertiary-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
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

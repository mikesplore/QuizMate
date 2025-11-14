import axios from 'axios'
import { 
  DocumentProcessingRequest, 
  ProcessedContent, 
  DocumentPreview,
  QuizAttemptRecord,
  PerformanceAnalysis,
  QuestionFeedback,
  GapAnalysis,
  UserCreate,
  UserLogin,
  AuthToken,
  UserStats,
  ChatRequest,
  ChatResponse
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const previewDocument = async (file: File): Promise<DocumentPreview> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<DocumentPreview>('/api/preview-document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const uploadDocument = async (
  file: File,
  config: DocumentProcessingRequest,
  userId?: string
): Promise<ProcessedContent> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('config', JSON.stringify(config))
  if (userId) {
    formData.append('user_id', userId)
  }

  const response = await api.post<ProcessedContent>('/api/process-document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const healthCheck = async (): Promise<{ status: string; gemini_configured: boolean }> => {
  const response = await api.get('/api/health')
  return response.data
}

export const getSupportedFormats = async (): Promise<{ formats: string[]; max_size_mb: number }> => {
  const response = await api.get('/api/supported-formats')
  return response.data
}

export const answerQuestionPaper = async (file: File, userId?: string) => {
  const formData = new FormData()
  formData.append('file', file)
  if (userId) {
    formData.append('user_id', userId)
  }

  const response = await api.post('/api/answer-question-paper', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const submitQuiz = async (attempt: QuizAttemptRecord): Promise<PerformanceAnalysis> => {
  const response = await api.post<PerformanceAnalysis>('/api/submit-quiz', attempt)
  return response.data
}

export const getPerformanceAnalysis = async (sessionId: string): Promise<GapAnalysis> => {
  const response = await api.get<GapAnalysis>(`/api/performance-analysis/${sessionId}`)
  return response.data
}

export const getQuestionFeedback = async (
  question: string,
  userAnswer: string,
  correctAnswer: string,
  explanation: string,
  isCorrect: boolean
): Promise<QuestionFeedback> => {
  const formData = new FormData()
  formData.append('question', question)
  formData.append('user_answer', userAnswer)
  formData.append('correct_answer', correctAnswer)
  formData.append('explanation', explanation)
  formData.append('is_correct', isCorrect.toString())

  const response = await api.post<QuestionFeedback>('/api/question-feedback', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

// Authentication API
export const register = async (userData: UserCreate): Promise<AuthToken> => {
  const response = await api.post<AuthToken>('/api/auth/register', userData)
  return response.data
}

export const login = async (credentials: UserLogin): Promise<AuthToken> => {
  const response = await api.post<AuthToken>('/api/auth/login', credentials)
  return response.data
}

export const getCurrentUser = async (token: string) => {
  const response = await api.get('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const getUserStats = async (userId: string): Promise<UserStats> => {
  const response = await api.get<UserStats>(`/api/user/stats/${userId}`)
  return response.data
}

// Chat API
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>('/api/chat/message', request)
  return response.data
}

export const getChatHistory = async (sessionId: string, userId?: string) => {
  const params = userId ? { user_id: userId } : {}
  const response = await api.get(`/api/chat/history/${sessionId}`, { params })
  return response.data
}

export const setChatContext = async (
  sessionId: string,
  documentText: string,
  documentTitle: string
) => {
  const formData = new FormData()
  formData.append('session_id', sessionId)
  formData.append('document_text', documentText)
  formData.append('document_title', documentTitle)

  const response = await api.post('/api/chat/context', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

// Documents API
export const getUserDocuments = async (userId: string, limit: number = 50) => {
  const response = await api.get(`/api/user/${userId}/documents`, {
    params: { limit }
  })
  return response.data
}

export const getDocumentContent = async (documentId: string) => {
  const response = await api.get(`/api/document/${documentId}/content`)
  return response.data
}

export const getGeneratedContent = async (sessionId: string) => {
  const response = await api.get(`/api/content/${sessionId}`)
  return response.data
}

export default api

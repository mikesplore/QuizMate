import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProcessedContent, QuizState, QuizStatistics, DocumentPreview, AnsweredQuestionPaper, UserProfile, AuthToken } from '../types'

interface AppState {
  processedContent: ProcessedContent | null
  answeredQuestionPaper: AnsweredQuestionPaper | null
  quizState: QuizState | null
  quizStatistics: QuizStatistics | null
  documentPreview: DocumentPreview | null
  isLoading: boolean
  error: string | null
  quizType: 'quick' | 'standard' | 'comprehensive'
  processingMode: 'study_materials' | 'answer_questions' | null
  
  // Auth state
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  
  setProcessedContent: (content: ProcessedContent) => void
  setAnsweredQuestionPaper: (paper: AnsweredQuestionPaper | null) => void
  setQuizState: (state: QuizState) => void
  setQuizStatistics: (stats: QuizStatistics) => void
  setDocumentPreview: (preview: DocumentPreview | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setQuizType: (type: 'quick' | 'standard' | 'comprehensive') => void
  setProcessingMode: (mode: 'study_materials' | 'answer_questions' | null) => void
  
  // Auth actions
  setAuth: (authData: AuthToken) => void
  logout: () => void
  
  resetState: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      processedContent: null,
      answeredQuestionPaper: null,
      quizState: null,
      quizStatistics: null,
      documentPreview: null,
      isLoading: false,
      error: null,
      quizType: 'standard',
      processingMode: null,
      
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      
      setProcessedContent: (content) => set({ processedContent: content, error: null }),
      setAnsweredQuestionPaper: (paper) => set({ answeredQuestionPaper: paper, error: null }),
      setQuizState: (state) => set({ quizState: state }),
      setQuizStatistics: (stats) => set({ quizStatistics: stats }),
      setDocumentPreview: (preview) => set({ documentPreview: preview }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setQuizType: (type) => set({ quizType: type }),
      setProcessingMode: (mode) => set({ processingMode: mode }),
      
      // Auth actions
      setAuth: (authData) => set({ 
        user: authData.user,
        token: authData.access_token,
        isAuthenticated: true,
        error: null
      }),
      logout: () => set({ 
        user: null,
        token: null,
        isAuthenticated: false
      }),
      
      resetState: () => set({ 
        processedContent: null,
        answeredQuestionPaper: null,
        quizState: null,
        quizStatistics: null,
        documentPreview: null,
        error: null,
        processingMode: null
      }),
    }),
    {
      name: 'quizmate-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

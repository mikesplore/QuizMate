import { create } from 'zustand'
import { ProcessedContent, QuizState, QuizStatistics, DocumentPreview } from '../types'

interface AppState {
  processedContent: ProcessedContent | null
  quizState: QuizState | null
  quizStatistics: QuizStatistics | null
  documentPreview: DocumentPreview | null
  isLoading: boolean
  error: string | null
  quizType: 'quick' | 'standard' | 'comprehensive'
  
  setProcessedContent: (content: ProcessedContent) => void
  setQuizState: (state: QuizState) => void
  setQuizStatistics: (stats: QuizStatistics) => void
  setDocumentPreview: (preview: DocumentPreview | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setQuizType: (type: 'quick' | 'standard' | 'comprehensive') => void
  resetState: () => void
}

export const useStore = create<AppState>((set) => ({
  processedContent: null,
  quizState: null,
  quizStatistics: null,
  documentPreview: null,
  isLoading: false,
  error: null,
  quizType: 'standard',
  
  setProcessedContent: (content) => set({ processedContent: content, error: null }),
  setQuizState: (state) => set({ quizState: state }),
  setQuizStatistics: (stats) => set({ quizStatistics: stats }),
  setDocumentPreview: (preview) => set({ documentPreview: preview }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setQuizType: (type) => set({ quizType: type }),
  resetState: () => set({ 
    processedContent: null, 
    quizState: null,
    quizStatistics: null,
    documentPreview: null,
    error: null 
  }),
}))

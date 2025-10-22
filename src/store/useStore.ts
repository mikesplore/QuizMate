import { create } from 'zustand'
import { ProcessedContent, QuizState, QuizStatistics, DocumentPreview, AnsweredQuestionPaper } from '../types'

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
  
  setProcessedContent: (content: ProcessedContent) => void
  setAnsweredQuestionPaper: (paper: AnsweredQuestionPaper | null) => void
  setQuizState: (state: QuizState) => void
  setQuizStatistics: (stats: QuizStatistics) => void
  setDocumentPreview: (preview: DocumentPreview | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setQuizType: (type: 'quick' | 'standard' | 'comprehensive') => void
  setProcessingMode: (mode: 'study_materials' | 'answer_questions' | null) => void
  resetState: () => void
}

export const useStore = create<AppState>((set) => ({
  processedContent: null,
  answeredQuestionPaper: null,
  quizState: null,
  quizStatistics: null,
  documentPreview: null,
  isLoading: false,
  error: null,
  quizType: 'standard',
  processingMode: null,
  
  setProcessedContent: (content) => set({ processedContent: content, error: null }),
  setAnsweredQuestionPaper: (paper) => set({ answeredQuestionPaper: paper, error: null }),
  setQuizState: (state) => set({ quizState: state }),
  setQuizStatistics: (stats) => set({ quizStatistics: stats }),
  setDocumentPreview: (preview) => set({ documentPreview: preview }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setQuizType: (type) => set({ quizType: type }),
  setProcessingMode: (mode) => set({ processingMode: mode }),
  resetState: () => set({ 
    processedContent: null,
    answeredQuestionPaper: null,
    quizState: null,
    quizStatistics: null,
    documentPreview: null,
    error: null,
    processingMode: null
  }),
}))

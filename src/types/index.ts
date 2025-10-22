export interface DocumentMetadata {
  title?: string
  page_count?: number
  file_size?: number
  language?: string
}

export interface MultipleChoiceConfig {
  enabled: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  count: number
  options_per_question: number
}

export interface TrueFalseConfig {
  enabled: boolean
  count: number
}

export interface ShortAnswerConfig {
  enabled: boolean
  count: number
}

export interface QuestionTypes {
  multiple_choice: MultipleChoiceConfig
  true_false: TrueFalseConfig
  short_answer: ShortAnswerConfig
}

export interface QuestionsConfig {
  enabled: boolean
  types: QuestionTypes
}

export interface StudyNotesConfig {
  enabled: boolean
  format: 'bullet_points' | 'outline' | 'paragraph'
  detail_level: 'concise' | 'detailed'
  include_examples: boolean
}

export interface FlashcardsConfig {
  enabled: boolean
  count: number
}

export interface SummaryConfig {
  enabled: boolean
  length: 'brief' | 'detailed'
}

export interface ContentTypes {
  questions: QuestionsConfig
  study_notes: StudyNotesConfig
  flashcards: FlashcardsConfig
  summary: SummaryConfig
}

export interface QuizMode {
  type: 'quickfire' | 'timed_test' | 'learning_mode'
  time_limit_minutes: number
  shuffle_questions: boolean
  instant_feedback: boolean
}

export interface OutputPreferences {
  content_types: ContentTypes
  quiz_mode: QuizMode
}

export interface ProcessingInstructions {
  analysis_depth: 'quick' | 'detailed' | 'comprehensive'
  focus_areas: string[]
  ignore_sections: string[]
  learning_objectives: string[]
}

export interface Customization {
  language: string
  tone: 'formal' | 'casual' | 'encouraging'
  include_page_references: boolean
  highlight_key_terms: boolean
}

export interface DocumentProcessingRequest {
  session_id?: string
  user_id?: string
  document_type: 'pdf' | 'docx' | 'image' | 'txt'
  document_metadata: DocumentMetadata
  processing_instructions: ProcessingInstructions
  output_preferences: OutputPreferences
  customization: Customization
}

export interface MultipleChoiceQuestion {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  difficulty: string
  page_reference?: number
  topic?: string
}

export interface MultiSelectQuestion {
  question: string
  options: string[]
  correct_answers: number[] // Multiple correct answer indices
  explanation: string
  difficulty: string
  marks?: number // Optional marks field for questions
  page_reference?: number
  topic?: string
}

export interface TrueFalseQuestion {
  question: string
  correct_answer: boolean
  explanation: string
  page_reference?: number
  topic?: string
}

export interface ShortAnswerQuestion {
  question: string
  sample_answer: string
  key_points: string[]
  page_reference?: number
  topic?: string
}

export interface Flashcard {
  front: string
  back: string
  category?: string
}

export interface ProcessedContent {
  session_id: string
  timestamp: string
  multiple_choice_questions: MultipleChoiceQuestion[]
  multi_select_questions: MultiSelectQuestion[]
  true_false_questions: TrueFalseQuestion[]
  short_answer_questions: ShortAnswerQuestion[]
  flashcards: Flashcard[]
  study_notes: string
  summary: string
  key_terms: string[]
}

export interface QuizAnswer {
  questionIndex: number
  questionType: 'multiple_choice' | 'multi_select' | 'true_false' | 'short_answer'
  userAnswer: any
  isCorrect?: boolean
  timeTaken?: number // in seconds
  topic?: string
}

export interface QuizState {
  currentQuestion: number
  answers: QuizAnswer[]
  startTime: Date
  endTime?: Date
  score?: number
  quizType?: 'quick' | 'standard' | 'comprehensive'
  showFeedback?: boolean
}

export interface QuizStatistics {
  accuracy: number // percentage
  totalTimeTaken: number // in seconds
  topicPerformance: { [topic: string]: { correct: number; total: number } }
  weakTopics: string[]
}

export interface DocumentPreview {
  text: string
  wordCount: number
  pageCount: number
  estimatedTopics: string[]
  estimatedQuestionCount: number
  questionPaperDetection?: QuestionPaperDetection
}

// Question Paper Detection Types
export interface QuestionPaperDetection {
  is_question_paper: boolean
  confidence: 'high' | 'medium' | 'low'
  question_count: number
  exam_type?: string // e.g., "midterm", "final", "assignment", "practice"
  subject?: string
  reason: string
}

export interface QuestionWithAnswer {
  question_number: string // e.g., "1", "1a", "Q1"
  question_text: string
  marks?: number
  ai_generated_answer: string
  key_points: string[]
  page_reference?: number
}

export interface AnsweredQuestionPaper {
  session_id: string
  timestamp: string
  document_title: string
  exam_type?: string
  subject?: string
  total_questions: number
  questions_with_answers: QuestionWithAnswer[]
  general_instructions: string
  summary: string
}

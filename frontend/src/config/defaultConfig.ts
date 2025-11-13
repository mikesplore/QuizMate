import { DocumentProcessingRequest } from '../types'

export const defaultConfig: DocumentProcessingRequest = {
  document_type: 'pdf',
  document_metadata: {
    language: 'english',
  },
  processing_instructions: {
    analysis_depth: 'detailed',
    focus_areas: [],
    ignore_sections: ['header', 'footer', 'bibliography', 'page_numbers'],
    learning_objectives: ['memorization', 'conceptual_understanding', 'application'],
  },
  output_preferences: {
    content_types: {
      questions: {
        enabled: true,
        types: {
          multiple_choice: {
            enabled: true,
            difficulty: 'medium',
            count: 10,
            options_per_question: 4,
          },
          true_false: {
            enabled: true,
            count: 5,
          },
          short_answer: {
            enabled: true,
            count: 8,
          },
        },
      },
      study_notes: {
        enabled: true,
        format: 'bullet_points',
        detail_level: 'detailed',
        include_examples: true,
      },
      flashcards: {
        enabled: true,
        count: 15,
      },
      summary: {
        enabled: true,
        length: 'detailed',
      },
    },
    quiz_mode: {
      type: 'learning_mode',
      time_limit_minutes: 0,
      shuffle_questions: true,
      instant_feedback: true,
    },
  },
  customization: {
    language: 'english',
    tone: 'encouraging',
    include_page_references: true,
    highlight_key_terms: true,
    exam_format: 'GENERAL',
  },
}

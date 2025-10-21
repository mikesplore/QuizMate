from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class DocumentMetadata(BaseModel):
    title: Optional[str] = None
    page_count: Optional[int] = None
    file_size: Optional[int] = None
    language: str = "english"

class MultipleChoiceConfig(BaseModel):
    enabled: bool = True
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    count: int = 10
    options_per_question: int = 4

class TrueFalseConfig(BaseModel):
    enabled: bool = True
    count: int = 5

class ShortAnswerConfig(BaseModel):
    enabled: bool = True
    count: int = 8

class FillInBlankConfig(BaseModel):
    enabled: bool = False
    count: int = 0

class QuestionTypes(BaseModel):
    multiple_choice: MultipleChoiceConfig = MultipleChoiceConfig()
    true_false: TrueFalseConfig = TrueFalseConfig()
    short_answer: ShortAnswerConfig = ShortAnswerConfig()
    fill_in_blank: FillInBlankConfig = FillInBlankConfig()

class QuestionsConfig(BaseModel):
    enabled: bool = True
    types: QuestionTypes = QuestionTypes()

class StudyNotesConfig(BaseModel):
    enabled: bool = True
    format: Literal["bullet_points", "outline", "paragraph"] = "bullet_points"
    detail_level: Literal["concise", "detailed"] = "detailed"
    include_examples: bool = True

class FlashcardsConfig(BaseModel):
    enabled: bool = True
    count: int = 15

class SummaryConfig(BaseModel):
    enabled: bool = True
    length: Literal["brief", "detailed"] = "detailed"

class ContentTypes(BaseModel):
    questions: QuestionsConfig = QuestionsConfig()
    study_notes: StudyNotesConfig = StudyNotesConfig()
    flashcards: FlashcardsConfig = FlashcardsConfig()
    summary: SummaryConfig = SummaryConfig()

class QuizMode(BaseModel):
    type: Literal["quickfire", "timed_test", "learning_mode"] = "learning_mode"
    time_limit_minutes: int = 0
    shuffle_questions: bool = True
    instant_feedback: bool = True

class OutputPreferences(BaseModel):
    content_types: ContentTypes = ContentTypes()
    quiz_mode: QuizMode = QuizMode()

class ProcessingInstructions(BaseModel):
    analysis_depth: Literal["quick", "detailed", "comprehensive"] = "detailed"
    focus_areas: List[str] = []
    ignore_sections: List[str] = ["header", "footer", "bibliography", "page_numbers"]
    learning_objectives: List[str] = ["memorization", "conceptual_understanding", "application"]

class Customization(BaseModel):
    language: str = "english"
    tone: Literal["formal", "casual", "encouraging"] = "encouraging"
    include_page_references: bool = True
    highlight_key_terms: bool = True

class DocumentProcessingRequest(BaseModel):
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    document_type: Literal["pdf", "docx", "image", "txt"]
    document_metadata: DocumentMetadata = DocumentMetadata()
    processing_instructions: ProcessingInstructions = ProcessingInstructions()
    output_preferences: OutputPreferences = OutputPreferences()
    customization: Customization = Customization()

class MultipleChoiceQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    difficulty: str
    page_reference: Optional[int] = None
    topic: Optional[str] = None

class TrueFalseQuestion(BaseModel):
    question: str
    correct_answer: bool
    explanation: str
    page_reference: Optional[int] = None
    topic: Optional[str] = None

class ShortAnswerQuestion(BaseModel):
    question: str
    sample_answer: str
    key_points: List[str]
    page_reference: Optional[int] = None
    topic: Optional[str] = None

class Flashcard(BaseModel):
    front: str
    back: str
    category: Optional[str] = None

class ProcessedContent(BaseModel):
    session_id: str
    timestamp: datetime
    multiple_choice_questions: List[MultipleChoiceQuestion] = []
    true_false_questions: List[TrueFalseQuestion] = []
    short_answer_questions: List[ShortAnswerQuestion] = []
    flashcards: List[Flashcard] = []
    study_notes: str = ""
    summary: str = ""
    key_terms: List[str] = []
    
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

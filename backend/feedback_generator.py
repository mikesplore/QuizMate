"""
Feedback generation system for QuizMate
Based on prompt.json feedback and explanation specifications
"""

from typing import List, Optional
import random

class FeedbackGenerator:
    """Generate culturally appropriate, educational feedback for student answers"""
    
    def __init__(self):
        pass
    
    def generate_correct_feedback(
        self, 
        question: str, 
        correct_answer: str, 
        explanation: str,
        related_concepts: Optional[List[str]] = None
    ) -> dict:
        """
        Generate encouraging feedback for correct answers
        Template: ✅ Correct! [Reinforcing explanation]. [Related insight or extension].
        """
        # Encouraging phrases
        praise_phrases = [
            "✅ Correct! Well done!",
            "✅ Excellent! That's right!",
            "✅ Perfect! Great job!",
            "✅ Spot on! Nicely done!",
            "✅ Absolutely correct!",
            "✅ Outstanding! You've got it!",
        ]
        
        praise = random.choice(praise_phrases)
        
        # Build feedback message
        feedback_parts = [praise]
        
        # Add reinforcing explanation
        if explanation:
            feedback_parts.append(explanation)
        
        # Add related insight if available
        if related_concepts:
            insight = self._generate_extension_insight(related_concepts)
            if insight:
                feedback_parts.append(insight)
        
        feedback_message = " ".join(feedback_parts)
        
        return {
            "is_correct": True,
            "feedback_message": feedback_message,
            "explanation": explanation,
            "tone": "encouraging",
            "related_concepts": related_concepts or []
        }
    
    def generate_incorrect_feedback(
        self,
        question: str,
        user_answer: str,
        correct_answer: str,
        explanation: str,
        common_misconception: Optional[str] = None
    ) -> dict:
        """
        Generate supportive feedback for incorrect answers
        Template: Not quite. [Gentle correction]. The correct answer is [X] because [explanation]. 
                 [Common misconception clarification].
        """
        # Gentle correction phrases
        correction_phrases = [
            "Not quite.",
            "Not exactly.",
            "That's not quite right.",
            "Close, but not quite.",
            "Let's review this together.",
        ]
        
        correction = random.choice(correction_phrases)
        
        # Build feedback message
        feedback_parts = [correction]
        
        # Add correct answer with explanation
        feedback_parts.append(
            f"The correct answer is **{correct_answer}** because {explanation}"
        )
        
        # Add misconception clarification if available
        if common_misconception:
            feedback_parts.append(
                f"Common mistake: {common_misconception}"
            )
        else:
            # Generic encouragement
            feedback_parts.append(
                "Don't worry - mistakes are part of learning! Review this concept and try again."
            )
        
        feedback_message = " ".join(feedback_parts)
        
        return {
            "is_correct": False,
            "feedback_message": feedback_message,
            "explanation": explanation,
            "tone": "supportive",
            "learning_opportunity": True
        }
    
    def generate_partial_feedback(
        self,
        question: str,
        user_answer: str,
        correct_answer: str,
        what_was_correct: str,
        what_was_missing: str,
        full_explanation: str
    ) -> dict:
        """
        Generate feedback for partially correct answers
        Template: You're on the right track! [What was correct]. However, [what was missing]. 
                 [Complete explanation].
        """
        encouragement_phrases = [
            "You're on the right track!",
            "You're getting there!",
            "Good start!",
            "You've got part of it!",
            "Almost there!",
        ]
        
        encouragement = random.choice(encouragement_phrases)
        
        feedback_parts = [
            encouragement,
            what_was_correct,
            f"However, {what_was_missing}",
            full_explanation
        ]
        
        feedback_message = " ".join(feedback_parts)
        
        return {
            "is_correct": False,
            "partial_credit": True,
            "feedback_message": feedback_message,
            "explanation": full_explanation,
            "tone": "encouraging"
        }
    
    def _generate_extension_insight(self, related_concepts: List[str]) -> str:
        """Generate an extension insight from related concepts"""
        if not related_concepts:
            return ""
        
        insight_templates = [
            f"This concept is closely related to {related_concepts[0]}.",
            f"Understanding this helps with {related_concepts[0]}.",
            f"Next, you might want to explore {related_concepts[0]}.",
        ]
        
        return random.choice(insight_templates)
    
    def generate_quiz_completion_message(
        self,
        score_percentage: float,
        total_questions: int,
        correct_answers: int
    ) -> str:
        """Generate an encouraging message upon quiz completion"""
        if score_percentage < 50:
            messages = [
                f"You got {correct_answers} out of {total_questions} correct. "
                "Don't be discouraged! Every question you attempt helps you learn. "
                "Review the explanations and try again - you'll improve! 💪",
                
                f"Score: {score_percentage:.0f}% ({correct_answers}/{total_questions}). "
                "Learning takes time and practice. Focus on understanding the concepts, "
                "and your scores will improve. Keep going! 🌟",
            ]
        elif score_percentage < 70:
            messages = [
                f"Good effort! You scored {score_percentage:.0f}% ({correct_answers}/{total_questions}). "
                "You're making progress! Review the questions you missed and keep practicing. 📚",
                
                f"You got {correct_answers} out of {total_questions} questions right! "
                "You're building your understanding. Focus on the areas where you struggled. 💫",
            ]
        elif score_percentage < 85:
            messages = [
                f"Great job! You scored {score_percentage:.0f}% ({correct_answers}/{total_questions})! "
                "Your hard work is showing results. Keep it up! ⭐",
                
                f"Well done! {correct_answers} out of {total_questions} correct! "
                "You're demonstrating strong understanding. Continue with this momentum! 🎓",
            ]
        else:
            messages = [
                f"Excellent work! You scored {score_percentage:.0f}% ({correct_answers}/{total_questions})! "
                "You've mastered this material. Ready for the next challenge? 🌟👏",
                
                f"Outstanding performance! {correct_answers} out of {total_questions} correct! "
                "Your dedication is truly paying off. Keep soaring! 🚀⭐",
            ]
        
        return random.choice(messages)
    
    def generate_topic_feedback(self, topic: str, accuracy: float) -> str:
        """Generate specific feedback for a topic based on accuracy"""
        if accuracy >= 80:
            return f"✅ {topic}: Excellent mastery ({accuracy:.0f}%)"
        elif accuracy >= 60:
            return f"⚠️ {topic}: Good progress, room for improvement ({accuracy:.0f}%)"
        else:
            return f"📚 {topic}: Needs more review ({accuracy:.0f}%)"
    
    def generate_study_tip(self, weak_areas: List[str]) -> str:
        """Generate a study tip based on weak areas"""
        if not weak_areas:
            return "Keep up the excellent work! Continue reviewing all topics regularly."
        
        tips = [
            f"💡 Study Tip: Create flashcards for {weak_areas[0]} to improve retention.",
            f"💡 Study Tip: Spend extra time reviewing {weak_areas[0]} before your next quiz.",
            f"💡 Study Tip: Try teaching {weak_areas[0]} to someone else to deepen understanding.",
            f"💡 Study Tip: Break down {weak_areas[0]} into smaller topics and master each one.",
        ]
        
        return random.choice(tips)

# Global instance
feedback_generator = FeedbackGenerator()

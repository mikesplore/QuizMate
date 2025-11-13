"""
Performance tracking and adaptive difficulty adjustment for QuizMate
Based on prompt.json specifications for African student learning support
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
from pydantic import BaseModel
import json

class QuizAttempt(BaseModel):
    """Individual quiz attempt record"""
    session_id: str
    timestamp: datetime
    topic: str
    difficulty: str
    total_questions: int
    correct_answers: int
    score_percentage: float
    time_spent_seconds: Optional[int] = None
    questions_by_topic: Dict[str, Dict[str, int]] = {}  # {topic: {correct: x, total: y}}

class PerformanceAnalysis(BaseModel):
    """Comprehensive performance analysis"""
    overall_score: float
    accuracy_by_topic: Dict[str, float]
    difficulty_progression: str
    strengths: List[str]
    areas_for_improvement: List[str]
    recommended_actions: List[str]
    next_difficulty: str
    encouragement_message: str

class PerformanceTracker:
    """Track student performance and provide adaptive recommendations"""
    
    def __init__(self):
        # In-memory storage (can be replaced with database)
        self.user_attempts: Dict[str, List[QuizAttempt]] = {}
    
    def record_attempt(self, attempt: QuizAttempt) -> None:
        """Record a quiz attempt"""
        user_key = attempt.session_id  # Could be user_id in production
        if user_key not in self.user_attempts:
            self.user_attempts[user_key] = []
        self.user_attempts[user_key].append(attempt)
    
    def analyze_performance(self, session_id: str, current_attempt: QuizAttempt) -> PerformanceAnalysis:
        """
        Analyze performance and provide recommendations
        Based on prompt.json adaptive_learning rules
        """
        # Record current attempt
        self.record_attempt(current_attempt)
        
        # Get all attempts for this user
        attempts = self.user_attempts.get(session_id, [current_attempt])
        
        # Calculate metrics
        overall_score = current_attempt.score_percentage
        accuracy_by_topic = self._calculate_topic_accuracy(attempts)
        difficulty_progression = self._get_difficulty_progression(attempts)
        
        # Identify strengths and weaknesses
        strengths = self._identify_strengths(accuracy_by_topic)
        areas_for_improvement = self._identify_weaknesses(accuracy_by_topic)
        
        # Determine next difficulty level (prompt.json rules)
        next_difficulty = self._determine_next_difficulty(overall_score, current_attempt.difficulty)
        
        # Generate recommendations
        recommended_actions = self._generate_recommendations(
            overall_score, 
            areas_for_improvement, 
            next_difficulty
        )
        
        # Generate culturally appropriate encouragement
        encouragement_message = self._generate_encouragement(overall_score)
        
        return PerformanceAnalysis(
            overall_score=overall_score,
            accuracy_by_topic=accuracy_by_topic,
            difficulty_progression=difficulty_progression,
            strengths=strengths,
            areas_for_improvement=areas_for_improvement,
            recommended_actions=recommended_actions,
            next_difficulty=next_difficulty,
            encouragement_message=encouragement_message
        )
    
    def _calculate_topic_accuracy(self, attempts: List[QuizAttempt]) -> Dict[str, float]:
        """Calculate accuracy percentage by topic"""
        topic_stats: Dict[str, Dict[str, int]] = {}
        
        for attempt in attempts:
            for topic, stats in attempt.questions_by_topic.items():
                if topic not in topic_stats:
                    topic_stats[topic] = {"correct": 0, "total": 0}
                topic_stats[topic]["correct"] += stats.get("correct", 0)
                topic_stats[topic]["total"] += stats.get("total", 0)
        
        # Calculate percentages
        accuracy_by_topic = {}
        for topic, stats in topic_stats.items():
            if stats["total"] > 0:
                accuracy_by_topic[topic] = (stats["correct"] / stats["total"]) * 100
        
        return accuracy_by_topic
    
    def _get_difficulty_progression(self, attempts: List[QuizAttempt]) -> str:
        """Describe difficulty progression over attempts"""
        if len(attempts) <= 1:
            return "first_attempt"
        
        recent_attempts = attempts[-3:]  # Last 3 attempts
        difficulties = [a.difficulty for a in recent_attempts]
        
        if all(d == "hard" for d in difficulties):
            return "consistently_challenging"
        elif all(d == "easy" for d in difficulties):
            return "building_foundation"
        elif difficulties[-1] == "hard" and difficulties[0] in ["easy", "medium"]:
            return "progressing_well"
        else:
            return "mixed_performance"
    
    def _identify_strengths(self, accuracy_by_topic: Dict[str, float]) -> List[str]:
        """Identify topics where student performs well (>= 70%)"""
        strengths = []
        for topic, accuracy in accuracy_by_topic.items():
            if accuracy >= 70:
                strengths.append(f"{topic} ({accuracy:.0f}% accuracy)")
        
        if not strengths:
            strengths.append("Keep practicing - improvement is coming!")
        
        return strengths
    
    def _identify_weaknesses(self, accuracy_by_topic: Dict[str, float]) -> List[str]:
        """Identify topics needing improvement (< 70%)"""
        weaknesses = []
        for topic, accuracy in accuracy_by_topic.items():
            if accuracy < 70:
                weaknesses.append(f"{topic} ({accuracy:.0f}% accuracy)")
        
        if not weaknesses:
            weaknesses.append("No significant weak areas - excellent work!")
        
        return weaknesses
    
    def _determine_next_difficulty(self, score: float, current_difficulty: str) -> str:
        """
        Determine next difficulty level based on prompt.json rules:
        - If score < 50%: Reduce difficulty by 1 level
        - If score 50-70%: Maintain current difficulty
        - If score 70-85%: Maintain or slightly increase
        - If score > 85%: Increase difficulty
        """
        difficulty_levels = ["easy", "medium", "hard"]
        current_index = difficulty_levels.index(current_difficulty) if current_difficulty in difficulty_levels else 1
        
        if score < 50:
            # Reduce difficulty
            next_index = max(0, current_index - 1)
            return difficulty_levels[next_index]
        elif score < 70:
            # Maintain current difficulty
            return current_difficulty
        elif score < 85:
            # Maintain or slightly increase
            return current_difficulty
        else:
            # Increase difficulty
            next_index = min(len(difficulty_levels) - 1, current_index + 1)
            return difficulty_levels[next_index]
    
    def _generate_recommendations(
        self, 
        score: float, 
        weak_areas: List[str], 
        next_difficulty: str
    ) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        if score < 50:
            recommendations.extend([
                "Focus on foundational concepts before moving forward",
                "Review study notes and key terms for weak topics",
                "Practice with easier questions to build confidence",
                "Consider creating flashcards for key concepts"
            ])
        elif score < 70:
            recommendations.extend([
                "Review incorrect answers and their explanations carefully",
                "Focus extra study time on weak areas",
                "Try answering similar questions to reinforce understanding",
                "Use flashcards for active recall practice"
            ])
        elif score < 85:
            recommendations.extend([
                "Excellent progress! Continue with current study approach",
                "Challenge yourself with harder questions on strong topics",
                "Help solidify understanding by teaching concepts to others",
                "Explore advanced applications of the material"
            ])
        else:
            recommendations.extend([
                "Outstanding performance! You've mastered this material",
                f"Ready for {next_difficulty} level challenges",
                "Consider exploring advanced topics and real-world applications",
                "Practice teaching these concepts to reinforce mastery"
            ])
        
        # Add topic-specific recommendations if there are weak areas
        if weak_areas and "No significant weak areas" not in weak_areas[0]:
            recommendations.append(f"Prioritize reviewing: {', '.join([w.split('(')[0].strip() for w in weak_areas[:3]])}")
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def _generate_encouragement(self, score: float) -> str:
        """
        Generate culturally appropriate encouragement messages
        Based on prompt.json feedback templates
        """
        if score < 50:
            messages = [
                "Don't give up! Every expert was once a beginner. Keep practicing and you'll improve! 💪",
                "Learning takes time. Your effort today builds tomorrow's success. Stay determined! 🌟",
                "This is just the beginning of your journey. Keep pushing forward! You've got this! 🎯",
            ]
        elif score < 70:
            messages = [
                "You're making good progress! Keep working hard and success will follow! 📚",
                "Good effort! With more practice, you'll master this material. Stay focused! 💫",
                "You're on the right track! Continue studying and you'll see improvement! 🚀",
            ]
        elif score < 85:
            messages = [
                "Great job! Your hard work is paying off. Keep up the excellent effort! ⭐",
                "Well done! You're showing strong understanding of the material! 🎓",
                "Impressive performance! You're well on your way to mastery! 🏆",
            ]
        else:
            messages = [
                "Exceptional work! You've demonstrated excellent mastery of this material! 🌟👏",
                "Outstanding! Your dedication and understanding are truly impressive! 🏆✨",
                "Brilliant performance! You're excelling at this level. Keep soaring! 🚀⭐",
            ]
        
        # Rotate through messages for variety
        import random
        return random.choice(messages)
    
    def get_gap_analysis(self, session_id: str) -> Dict[str, Any]:
        """
        Identify learning gaps and prerequisite knowledge issues
        Based on prompt.json gap_identification
        """
        attempts = self.user_attempts.get(session_id, [])
        if not attempts:
            return {
                "gaps_identified": False,
                "message": "No quiz attempts yet to analyze"
            }
        
        # Calculate overall topic performance
        topic_accuracy = self._calculate_topic_accuracy(attempts)
        
        # Identify consistent struggles (< 50% accuracy)
        struggling_topics = [
            topic for topic, accuracy in topic_accuracy.items() 
            if accuracy < 50
        ]
        
        # Identify topics that might need prerequisites
        prerequisite_gaps = []
        if struggling_topics:
            prerequisite_gaps = [
                f"Consider reviewing foundational concepts for {topic}"
                for topic in struggling_topics
            ]
        
        # Generate remedial focus areas
        remedial_focus = []
        for topic in struggling_topics:
            remedial_focus.append({
                "topic": topic,
                "current_accuracy": topic_accuracy[topic],
                "target_accuracy": 70,
                "recommendation": f"Generate additional easy-level questions for {topic}"
            })
        
        return {
            "gaps_identified": len(struggling_topics) > 0,
            "struggling_topics": struggling_topics,
            "prerequisite_gaps": prerequisite_gaps,
            "remedial_focus": remedial_focus,
            "overall_recommendation": self._get_gap_recommendation(len(struggling_topics))
        }
    
    def _get_gap_recommendation(self, gap_count: int) -> str:
        """Provide overall recommendation based on number of gaps"""
        if gap_count == 0:
            return "No significant learning gaps detected. Continue with current study approach."
        elif gap_count <= 2:
            return "Focus on strengthening understanding in identified weak areas before proceeding."
        else:
            return "Consider reviewing foundational material. Multiple gaps suggest need for comprehensive review."

# Global instance
performance_tracker = PerformanceTracker()

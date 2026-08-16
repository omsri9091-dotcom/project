import os
import json
import joblib
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field
from typing import List, Optional

class StudentData(BaseModel):
    attendance: float = Field(..., ge=0, le=100, description="Attendance percentage (0-100)")
    study_hours: float = Field(..., ge=0, le=24, description="Daily study hours")
    previous_marks: float = Field(..., ge=0, le=100, description="Previous semester average marks (0-100)")
    assignment_score: float = Field(..., ge=0, le=100, description="Assignment submission score (0-100)")
    internal_marks: float = Field(..., ge=0, le=100, description="Internal test marks (0-100)")
    previous_gpa: float = Field(..., ge=0, le=10, description="Previous GPA (0-10)")
    participation: float = Field(..., ge=1, le=10, description="Class participation rating (1-10)")
    backlogs: int = Field(..., ge=0, le=20, description="Active backlog count")

class FactorContribution(BaseModel):
    name: str
    importance: float
    status: str # "Strong", "Moderate", "Needs Improvement"
    impact: str # Positive / Negative

class PredictionResponse(BaseModel):
    performance: str # "Poor", "Average", "Good", "Excellent"
    score: float # 0 - 100
    confidence: float # 0.0 - 1.0
    riskLevel: str # "Low", "Medium", "High"
    riskScore: float # 0 - 100
    factors: List[FactorContribution]
    recommendations: List[dict]
    explanation: str

class PerformancePredictor:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(base_dir, "model", "student_performance_model.pkl")
        self.metrics_path = os.path.join(base_dir, "model", "model_metrics.json")
        self.model = None
        self.metrics = {}
        self.load_model()

    def load_model(self):
        if not os.path.exists(self.model_path):
            print("[WARN] Model file not found. Running training now...")
            from train_model import train
            self.metrics = train()
        
        self.model = joblib.load(self.model_path)
        if os.path.exists(self.metrics_path):
            with open(self.metrics_path, "r") as f:
                self.metrics = json.load(f)
        print("[OK] Random Forest model loaded successfully in AI service.")

    def calculate_risk(self, data: StudentData, performance: str, score: float) -> tuple[str, float]:
        """Calculates risk level and risk index (0-100)"""
        # Risk factors weighted penalty
        risk_points = 0.0
        
        # Attendance penalty
        if data.attendance < 60:
            risk_points += 30
        elif data.attendance < 75:
            risk_points += 18
        elif data.attendance < 85:
            risk_points += 5
            
        # Backlogs penalty
        if data.backlogs >= 3:
            risk_points += 35
        elif data.backlogs >= 1:
            risk_points += 20
            
        # Marks & GPA penalty
        if data.previous_marks < 45:
            risk_points += 25
        elif data.previous_marks < 60:
            risk_points += 14
            
        if data.previous_gpa < 5.0:
            risk_points += 20
        elif data.previous_gpa < 6.5:
            risk_points += 10
            
        # Study hours penalty
        if data.study_hours < 1.5:
            risk_points += 15
        elif data.study_hours < 3.0:
            risk_points += 8
            
        # Assignment penalty
        if data.assignment_score < 50:
            risk_points += 15
        elif data.assignment_score < 70:
            risk_points += 8
            
        risk_score = min(100.0, max(0.0, risk_points))
        
        if performance == "Poor" or risk_score >= 50 or data.backlogs >= 2 or data.attendance < 65:
            risk_level = "High"
        elif performance == "Average" or risk_score >= 25 or data.attendance < 75 or data.backlogs == 1 or data.previous_marks < 60:
            risk_level = "Medium"
        else:
            risk_level = "Low"
            
        return risk_level, round(risk_score, 1)

    def compute_factors(self, data: StudentData) -> List[FactorContribution]:
        # Global feature importance baseline from model
        base_weights = {
            "Previous Marks": 0.26,
            "Attendance": 0.22,
            "Internal Marks": 0.17,
            "Study Hours": 0.14,
            "Previous GPA": 0.10,
            "Assignment Score": 0.06,
            "Backlogs": 0.03,
            "Participation": 0.02
        }
        
        if self.metrics and "feature_importances" in self.metrics:
            mapping = {
                "previous_marks": "Previous Marks",
                "attendance": "Attendance",
                "internal_marks": "Internal Marks",
                "study_hours": "Study Hours",
                "previous_gpa": "Previous GPA",
                "assignment_score": "Assignment Score",
                "backlogs": "Backlogs",
                "participation": "Participation"
            }
            for item in self.metrics["feature_importances"]:
                pretty = mapping.get(item["name"])
                if pretty:
                    base_weights[pretty] = item["importance"]

        results = []
        
        # Assess status for each factor
        assessments = [
            ("Previous Marks", data.previous_marks, 70, 50, "%"),
            ("Attendance", data.attendance, 80, 75, "%"),
            ("Internal Marks", data.internal_marks, 70, 50, "%"),
            ("Study Hours", data.study_hours, 4.0, 2.5, " hrs"),
            ("Previous GPA", data.previous_gpa, 7.5, 6.0, " GPA"),
            ("Assignment Score", data.assignment_score, 75, 60, "%"),
            ("Participation", data.participation, 7, 5, "/10"),
            ("Backlogs", -float(data.backlogs), 0, -1, " backlogs")
        ]
        
        for name, val, high_thresh, med_thresh, unit in assessments:
            weight = base_weights.get(name, 0.1)
            
            if name == "Backlogs":
                if data.backlogs == 0:
                    status = "Strong"
                    impact = "Positive"
                elif data.backlogs == 1:
                    status = "Moderate"
                    impact = "Negative"
                else:
                    status = "Needs Improvement"
                    impact = "Negative"
            else:
                if val >= high_thresh:
                    status = "Strong"
                    impact = "Positive"
                elif val >= med_thresh:
                    status = "Moderate"
                    impact = "Neutral"
                else:
                    status = "Needs Improvement"
                    impact = "Negative"
                    
            results.append(FactorContribution(
                name=name,
                importance=round(weight, 3),
                status=status,
                impact=impact
            ))
            
        results.sort(key=lambda x: x.importance, reverse=True)
        return results

    def generate_recommendations(self, data: StudentData, risk_level: str, performance: str) -> List[dict]:
        recs = []
        
        if data.attendance < 75:
            recs.append({
                "category": "Attendance",
                "title": "Mandatory Attendance Recovery",
                "description": f"Current attendance is {data.attendance}%. Aim for at least 80% to maintain institutional eligibility and avoid exam restrictions.",
                "priority": "HIGH",
                "expectedImpact": "+0.6 GPA & Risk Reduction",
                "action": "Attend all remaining lectures and lab sessions without unexcused absences."
            })
            
        if data.study_hours < 3.5:
            target_hours = 4.0 if risk_level == "High" else 3.5
            recs.append({
                "category": "Study Habits",
                "title": "Structured Daily Study Timetable",
                "description": f"Increase daily self-study from {data.study_hours} hrs to at least {target_hours} hrs focusing on core subjects with spaced repetition.",
                "priority": "HIGH" if risk_level == "High" else "MEDIUM",
                "expectedImpact": "+10-15% Internal Assessment Marks",
                "action": "Dedicate 2 focused 90-minute study blocks daily with Pomodoro technique."
            })
            
        if data.backlogs > 0:
            recs.append({
                "category": "Backlogs",
                "title": f"Clear Active Backlogs ({data.backlogs} Pending)",
                "description": "Unresolved backlogs significantly increase academic risk and prerequisite blockers.",
                "priority": "CRITICAL",
                "expectedImpact": "Removes High Risk Flag",
                "action": "Enroll in remedial tutorial sessions and practice previous 5-year exam papers."
            })
            
        if data.internal_marks < 60 or data.previous_marks < 60:
            recs.append({
                "category": "Academic Performance",
                "title": "Targeted Revision & Weak Subject Remediation",
                "description": "Internal test scores indicate gaps in conceptual foundations before final exams.",
                "priority": "HIGH",
                "expectedImpact": "+12% Final Exam Performance",
                "action": "Review lecture slides, chapter summaries, and request faculty mentoring."
            })
            
        if data.assignment_score < 70:
            recs.append({
                "category": "Continuous Assessment",
                "title": "Timely Assignment Submission & Review",
                "description": f"Assignment score is currently {data.assignment_score}%. Submitting early allows feedback iteration.",
                "priority": "MEDIUM",
                "expectedImpact": "+5% Internal Grade Boost",
                "action": "Complete and submit all lab reports and homework 24 hours ahead of deadline."
            })
            
        if len(recs) == 0 or performance in ["Good", "Excellent"]:
            recs.append({
                "category": "Excellence & Growth",
                "title": "Advanced Project & Research Pathway",
                "description": "Academic indicators are strong. Focus on competitive programming, industry internships, and research papers.",
                "priority": "LOW",
                "expectedImpact": "Honors Graduation & Career Placement",
                "action": "Participate in hackathons and collaborate on faculty research projects."
            })
            
        return recs

    def predict(self, data: StudentData) -> PredictionResponse:
        feature_cols = [
            "attendance",
            "study_hours",
            "previous_marks",
            "assignment_score",
            "internal_marks",
            "previous_gpa",
            "participation",
            "backlogs"
        ]
        input_df = pd.DataFrame([{
            "attendance": data.attendance,
            "study_hours": data.study_hours,
            "previous_marks": data.previous_marks,
            "assignment_score": data.assignment_score,
            "internal_marks": data.internal_marks,
            "previous_gpa": data.previous_gpa,
            "participation": data.participation,
            "backlogs": data.backlogs
        }], columns=feature_cols)
        
        # Predict class
        pred_class = self.model.predict(input_df)[0]
        
        # Predict probabilities
        probabilities = self.model.predict_proba(input_df)[0]
        class_idx = list(self.model.classes_).index(pred_class)
        confidence = float(probabilities[class_idx])
        
        # Calculate continuous composite performance score (0-100)
        continuous_score = (
            0.20 * data.attendance +
            0.16 * (min(data.study_hours, 8.5) / 8.5 * 100) +
            0.22 * data.previous_marks +
            0.14 * data.assignment_score +
            0.16 * data.internal_marks +
            0.08 * (data.previous_gpa * 10) +
            0.04 * (data.participation * 10) -
            4.0 * data.backlogs
        )
        continuous_score = round(float(np.clip(continuous_score, 0, 100)), 1)
        
        risk_level, risk_score = self.calculate_risk(data, pred_class, continuous_score)
        factors = self.compute_factors(data)
        recommendations = self.generate_recommendations(data, risk_level, pred_class)
        
        explanation = (
            f"Based on the Random Forest ensemble model analysis, the student is predicted in the '{pred_class}' "
            f"category with a composite index of {continuous_score}/100 ({confidence*100:.1f}% confidence). "
            f"Key contributing factors include {factors[0].name} ({factors[0].importance*100:.1f}%) and "
            f"{factors[1].name} ({factors[1].importance*100:.1f}%). Risk profile assessed as {risk_level} Risk."
        )
        
        return PredictionResponse(
            performance=pred_class,
            score=continuous_score,
            confidence=round(confidence, 2),
            riskLevel=risk_level,
            riskScore=risk_score,
            factors=factors,
            recommendations=recommendations,
            explanation=explanation
        )

# Singleton predictor instance
predictor = PerformancePredictor()

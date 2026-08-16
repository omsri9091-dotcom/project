import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report
import joblib

def generate_synthetic_data(num_samples=2000, random_seed=42):
    np.random.seed(random_seed)
    
    # 1. Base academic attributes
    attendance = np.clip(np.random.normal(loc=76, scale=14, size=num_samples), 35, 100).round(1)
    study_hours = np.clip(np.random.normal(loc=3.8, scale=1.6, size=num_samples), 0.5, 8.5).round(1)
    previous_marks = np.clip(np.random.normal(loc=68, scale=16, size=num_samples), 25, 99).round(1)
    assignment_score = np.clip(np.random.normal(loc=74, scale=15, size=num_samples), 30, 100).round(1)
    internal_marks = np.clip(np.random.normal(loc=70, scale=16, size=num_samples), 20, 100).round(1)
    previous_gpa = np.clip(np.random.normal(loc=7.1, scale=1.4, size=num_samples), 2.0, 10.0).round(2)
    participation = np.clip(np.random.normal(loc=6.5, scale=2.0, size=num_samples), 1, 10).round(0).astype(int)
    
    # Backlogs correlate inversely with marks and attendance
    backlog_prob = np.clip(1.0 - (previous_marks / 100.0) * 0.7 - (attendance / 100.0) * 0.3, 0.05, 0.95)
    backlogs = np.random.binomial(n=5, p=backlog_prob * 0.5, size=num_samples)
    
    # 2. Composite performance index (0 to 100)
    base_score = (
        0.20 * attendance +
        0.16 * (study_hours / 8.5 * 100) +
        0.22 * previous_marks +
        0.14 * assignment_score +
        0.16 * internal_marks +
        0.08 * (previous_gpa * 10) +
        0.04 * (participation * 10) -
        4.0 * backlogs
    )
    
    noise = np.random.normal(0, 3.5, size=num_samples)
    composite_score = np.clip(base_score + noise, 0, 100).round(1)
    
    # 3. Discretize into classes: Poor (<50), Average (50-65), Good (65-80), Excellent (>=80)
    classes = []
    for s in composite_score:
        if s >= 80.0:
            classes.append("Excellent")
        elif s >= 65.0:
            classes.append("Good")
        elif s >= 50.0:
            classes.append("Average")
        else:
            classes.append("Poor")
            
    df = pd.DataFrame({
        "attendance": attendance,
        "study_hours": study_hours,
        "previous_marks": previous_marks,
        "assignment_score": assignment_score,
        "internal_marks": internal_marks,
        "previous_gpa": previous_gpa,
        "participation": participation,
        "backlogs": backlogs,
        "composite_score": composite_score,
        "performance": classes
    })
    
    return df

def train():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(base_dir, "model")
    dataset_dir = os.path.join(base_dir, "dataset")
    
    os.makedirs(model_dir, exist_ok=True)
    os.makedirs(dataset_dir, exist_ok=True)
    
    print("[ADEXA AI] Generating realistic student academic dataset...")
    df = generate_synthetic_data(num_samples=2500, random_seed=42)
    csv_path = os.path.join(dataset_dir, "student_performance.csv")
    df.to_csv(csv_path, index=False)
    print(f"[OK] Dataset saved to {csv_path} ({len(df)} records)")
    
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
    
    X = df[feature_cols]
    y = df["performance"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("[ADEXA AI] Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted")
    cm = confusion_matrix(y_test, y_pred, labels=["Poor", "Average", "Good", "Excellent"]).tolist()
    
    feature_importances = [
        {"name": col, "importance": round(float(imp), 4)}
        for col, imp in zip(feature_cols, model.feature_importances_)
    ]
    feature_importances.sort(key=lambda x: x["importance"], reverse=True)
    
    metrics = {
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1_score": round(float(f1), 4),
        "confusion_matrix": cm,
        "classes": ["Poor", "Average", "Good", "Excellent"],
        "feature_importances": feature_importances,
        "sample_count": len(df),
        "features": feature_cols
    }
    
    print(f"[METRICS] Evaluation Metrics:")
    print(f"   Accuracy:  {accuracy * 100:.2f}%")
    print(f"   Precision: {precision * 100:.2f}%")
    print(f"   Recall:    {recall * 100:.2f}%")
    print(f"   F1-Score:  {f1 * 100:.2f}%")
    
    model_path = os.path.join(model_dir, "student_performance_model.pkl")
    joblib.dump(model, model_path)
    print(f"[SAVED] Trained model saved to {model_path}")
    
    metrics_path = os.path.join(model_dir, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"[SAVED] Metrics saved to {metrics_path}")
    
    return metrics

if __name__ == "__main__":
    train()

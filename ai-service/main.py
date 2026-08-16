from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import json
from predict import predictor, StudentData, PredictionResponse

app = FastAPI(
    title="ADEXA AI - Machine Learning Prediction Service",
    description="Random Forest Academic Performance Prediction, Risk Engine & Explainable AI Microservice",
    version="1.0.0"
)

# Enable CORS for communication with Node backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ADEXA AI Machine Learning Service",
        "model_loaded": predictor.model is not None,
        "version": "1.0.0"
    }

@app.get("/metrics")
def get_metrics():
    """Returns actual model evaluation metrics (Accuracy, Precision, Recall, F1, Confusion Matrix, Feature Importance)"""
    if not predictor.metrics:
        predictor.load_model()
    return predictor.metrics

@app.post("/predict", response_model=PredictionResponse)
def predict_performance(data: StudentData):
    """
    Receives academic features, runs Random Forest inference,
    calculates risk levels, Explainable AI factor weights, and targeted recommendations.
    """
    try:
        result = predictor.predict(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/recommendations")
def get_recommendations(data: StudentData):
    try:
        pred_res = predictor.predict(data)
        return {
            "performance": pred_res.performance,
            "riskLevel": pred_res.riskLevel,
            "recommendations": pred_res.recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

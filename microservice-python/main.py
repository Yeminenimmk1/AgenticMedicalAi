"""
FastAPI Server for Medical AI Models
======================================
Serves the trained Machine Learning models (XGBoost, RandomForest, GradientBoosting, Prophet)
via REST API for the Java Spring Boot backend to consume.

Run local dev server:
uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import os

# Create the FastAPI app
app = FastAPI(
    title="Medical AI ML Core",
    description="Python microservice running predictive models for Agentic Medical AI",
    version="1.0.0"
)

# Allow CORS since React or Java might call this directly during testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global dictionary to hold models in memory
# Models are loaded once at startup so inference is fast
ml_models = {}

@app.on_event("startup")
async def load_models():
    """Loads all .pkl models into memory on server startup."""
    print("="*55)
    print("  Loading ML Models into memory...")
    print("="*55)
    
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    
    try:
        # Load Digital Twin (Diabetes)
        diabetes_path = os.path.join(models_dir, "digital_twin_model.pkl")
        ml_models["diabetes"] = joblib.load(diabetes_path)
        print(f"[OK] Loaded Diabetes Risk Model (accuracy: {ml_models['diabetes']['accuracy']}%)")
        
        # Load Digital Twin (Heart)
        heart_path = os.path.join(models_dir, "heart_risk_model.pkl")
        ml_models["heart"] = joblib.load(heart_path)
        print(f"[OK] Loaded Heart Risk Model (accuracy: {ml_models['heart']['accuracy']}%)")
        
        # Load Misuse Monitor
        misuse_path = os.path.join(models_dir, "misuse_model.pkl")
        ml_models["misuse"] = joblib.load(misuse_path)
        print(f"[OK] Loaded Misuse Monitor (precision: {ml_models['misuse']['precision']}%)")
        
        # Load Outbreak Prophet
        outbreak_path = os.path.join(models_dir, "outbreak_prophet_model.pkl")
        ml_models["outbreak"] = joblib.load(outbreak_path)
        print(f"[OK] Loaded Outbreak Forecaster (MAPE: {ml_models['outbreak']['mape']}%)")
        
    except FileNotFoundError as e:
        print(f"[ERROR] Error loading model: {e}")
        print("Did you run the training scripts?")
        
    print("="*55)
    print("  FastAPI Server Ready on port 8000")
    print("="*55)

@app.api_route("/api/health", methods=["GET", "HEAD"])
def health_check():
    """Health check endpoint — used by UptimeRobot to keep Render alive."""
    return {"status": "ok", "service": "medicalai-python", "models_loaded": len(ml_models)}

# Import and include routers here (to avoid circular imports)
from routers.ml_router import router as ml_router
from routers.outbreak_router import router as outbreak_router

app.include_router(ml_router, prefix="/api/ml", tags=["Machine Learning"])
app.include_router(outbreak_router, prefix="/api/outbreak", tags=["Public Health"])

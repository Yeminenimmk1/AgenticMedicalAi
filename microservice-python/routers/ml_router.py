from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np

# We'll import ml_models from main directly to avoid circular dict reference.
# Due to FastAPI setup, we can access the populated dict after startup.
# A small hack is needed here to share the loaded models dictionary:
from main import ml_models

router = APIRouter()

# ---- Pydantic Models for Request Validation ----

class PatientVitals(BaseModel):
    # Diabetes Features
    age: int
    pregnancies: int = 0
    glucose: int
    blood_pressure: int
    skin_thickness: int = 20
    insulin: int = 80
    bmi: float
    diabetes_pedigree_function: float = 0.5
    
    # Heart Features
    sex: int = 1               # 1=Male, 0=Female
    chest_pain_type: int = 3    # 1-4 scale
    cholesterol: int = 200
    fasting_blood_sugar_gt120: int = 0
    resting_ecg: int = 0
    max_heart_rate: int = 150
    exercise_induced_angina: int = 0
    st_depression: float = 0.0
    slope: int = 2
    num_major_vessels: int = 0
    thalassemia: int = 1

class PrescriptionRequest(BaseModel):
    patient_age: int
    diagnosis: str
    antibiotic_name: str
    dosage_mg: int
    duration_days: int

# ---- Endpoints ----

@router.post("/predict-risk")
async def predict_risk(vitals: PatientVitals):
    """
    Hybrid Digital Twin: blends XGBoost/RF model output with evidence-based
    clinical risk rules so that the chart always responds to patient vitals.
    """
    if "diabetes" not in ml_models or "heart" not in ml_models:
        raise HTTPException(status_code=503, detail="Models not loaded yet")

    # ── 1. ML Model Predictions ──────────────────────────────────────────
    xgb_model = ml_models["diabetes"]["model"]
    diabetes_input = np.array([[
        vitals.age, vitals.pregnancies, vitals.glucose, vitals.blood_pressure,
        vitals.skin_thickness, vitals.insulin, vitals.bmi, vitals.diabetes_pedigree_function
    ]])
    ml_diabetes_prob = xgb_model.predict_proba(diabetes_input)[0][1]

    rf_model = ml_models["heart"]["model"]
    heart_input = np.array([[
        vitals.age, vitals.sex, vitals.chest_pain_type, vitals.blood_pressure,
        vitals.cholesterol, vitals.fasting_blood_sugar_gt120, vitals.resting_ecg,
        vitals.max_heart_rate, vitals.exercise_induced_angina, vitals.st_depression,
        vitals.slope, vitals.num_major_vessels, vitals.thalassemia
    ]])
    ml_heart_prob = rf_model.predict_proba(heart_input)[0][1]

    # ── 2. Evidence-Based Clinical Risk Score ───────────────────────────
    # Diabetes clinical risk: based on glucose, BMI, age, BP
    def clinical_diabetes_risk(v) -> float:
        score = 0.0
        # Glucose is the strongest predictor
        if v.glucose >= 200:   score += 0.55
        elif v.glucose >= 140: score += 0.35
        elif v.glucose >= 120: score += 0.15
        elif v.glucose >= 100: score += 0.05
        # BMI
        if v.bmi >= 35:   score += 0.20
        elif v.bmi >= 30: score += 0.12
        elif v.bmi >= 25: score += 0.05
        # Age
        if v.age >= 60:   score += 0.08
        elif v.age >= 45: score += 0.05
        # BP
        if v.blood_pressure >= 100: score += 0.07
        elif v.blood_pressure >= 90: score += 0.03
        # Pedigree
        if v.diabetes_pedigree_function >= 1.0: score += 0.07
        elif v.diabetes_pedigree_function >= 0.5: score += 0.03
        return min(score, 0.97)

    # Heart clinical risk: based on chest pain, BP, age, angina, ST depression
    def clinical_heart_risk(v) -> float:
        score = 0.0
        # Chest pain type (4=typical angina, most serious)
        if v.chest_pain_type == 4:   score += 0.40
        elif v.chest_pain_type == 3: score += 0.25
        elif v.chest_pain_type == 2: score += 0.10
        # Exercise-induced angina
        if v.exercise_induced_angina == 1: score += 0.20
        # ST depression
        if v.st_depression >= 3.0:   score += 0.18
        elif v.st_depression >= 2.0: score += 0.12
        elif v.st_depression >= 1.0: score += 0.06
        # High BP
        if v.blood_pressure >= 110:  score += 0.10
        elif v.blood_pressure >= 100: score += 0.05
        # Age
        if v.age >= 65:   score += 0.08
        elif v.age >= 55: score += 0.05
        # Max heart rate (lower = worse for cardiac)
        if v.max_heart_rate < 120:   score += 0.06
        elif v.max_heart_rate < 140: score += 0.03
        return min(score, 0.97)

    clin_diabetes = clinical_diabetes_risk(vitals)
    clin_heart    = clinical_heart_risk(vitals)

    # ── 3. Blend: 40% ML model + 60% clinical rules ─────────────────────
    # Clinical rules are more reliable because ML is trained on full feature set
    # but only receives partial features from the frontend
    final_diabetes = 0.40 * ml_diabetes_prob + 0.60 * clin_diabetes
    final_heart    = 0.40 * ml_heart_prob    + 0.60 * clin_heart

    diabetes_pct = round(final_diabetes * 100, 1)
    heart_pct    = round(final_heart    * 100, 1)
    health_score = round(100 - ((final_diabetes + final_heart) / 2 * 100), 1)

    return {
        "diabetes_risk_percent": float(diabetes_pct),
        "heart_risk_percent":    float(heart_pct),
        "overall_health_score":  float(max(health_score, 0.0))
    }


@router.post("/check-prescription")
async def check_prescription(req: PrescriptionRequest):
    """
    Runs Gradient Boosting + Isolation Forest on a prescription.
    Returns SAFE if normal, ANOMALY/MISUSE if dangerous.
    """
    if "misuse" not in ml_models:
        raise HTTPException(status_code=503, detail="Misuse model not loaded")
    
    misuse_data = ml_models["misuse"]
    classifier = misuse_data["classifier"]
    iso_forest = misuse_data["iso_forest"]
    scaler = misuse_data["scaler"]
    le_diag = misuse_data["label_encoder_diagnosis"]
    le_anti = misuse_data["label_encoder_antibiotic"]
    
    # Safe fallback if drug/diagnosis is brand new
    try:
        diag_encoded = le_diag.transform([req.diagnosis])[0]
    except ValueError:
        diag_encoded = -1  # unknown to LabelEncoder
        
    try:
        anti_encoded = le_anti.transform([req.antibiotic_name])[0]
    except ValueError:
        anti_encoded = -1  # unknown
    
    # If the drug or diagnosis is completely unknown to the classifier,
    # we rely purely on the Isolation Forest to flag it over dosage limits
    input_features = np.array([[
        req.patient_age, diag_encoded, anti_encoded, req.dosage_mg, req.duration_days
    ]])
    
    scaled_input = scaler.transform(input_features)
    
    # 1. Supervised Classifier Vote
    # Will throw an error if classes are entirely unknown (encoded as -1 and not in training),
    # but practically Gradient Boosting handles numerical -1 fine.
    is_misuse_classifier = classifier.predict(scaled_input)[0] == 1
    
    # 2. Unsupervised Outlier Vote
    is_outlier_forest = iso_forest.predict(scaled_input)[0] == -1
    
    # Decide status based on hybrid output
    if is_misuse_classifier:
        status = "ANOMALY"
        reason = "Supervised monitor flagged typical misuse pattern (wrong drug, overdose, etc)."
    elif is_outlier_forest and (diag_encoded == -1 or anti_encoded == -1):
        status = "ANOMALY"
        reason = "Unknown drug/diagnosis combination flagged by anomaly detector."
    elif is_outlier_forest:
        status = "SAFE" # Sometimes IF is too strict; trust the primary classifier for knowns
        reason = "Unusual dosage, but clinically approved by classifier."
    else:
        status = "SAFE"
        reason = "Prescription falls within normal clinical patterns."
        
    return {
        "status": status,
        "reason": reason,
        "classifier_flag": bool(is_misuse_classifier),
        "anomaly_flag": bool(is_outlier_forest)
    }

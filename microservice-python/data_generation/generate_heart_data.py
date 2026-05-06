"""
Synthetic Heart Disease Dataset Generator
==========================================
Generates patient cardiovascular data for training the Digital Twin
Random Forest model. Target accuracy: >= 85%

Output: data/heart_disease_data.xlsx  (10,000 rows)

Key indicators: age, chest pain type, cholesterol, max heart rate,
exercise-induced angina, resting ECG, blood pressure
"""

import numpy as np
import pandas as pd
import os

np.random.seed(7)

NUM_ROWS = 10000

# Chest pain types (clinical standard)
CHEST_PAIN_TYPES = {
    1: "typical_angina",       # most likely heart disease
    2: "atypical_angina",
    3: "non_anginal_pain",
    4: "asymptomatic"          # can still have disease
}

# Thalassemia types
THAL_TYPES = {
    1: "normal",
    2: "fixed_defect",
    3: "reversable_defect"
}

print("Generating synthetic heart disease dataset...")


def generate_heart_dataset(n):
    data = []

    for i in range(n):
        # ~45% have heart disease — a realistic clinical split
        has_disease = np.random.random() < 0.45

        # --- Age ---
        if has_disease:
            age = int(np.clip(np.random.normal(58, 9), 30, 80))
        else:
            age = int(np.clip(np.random.normal(50, 10), 28, 75))

        # --- Sex (1 = Male, 0 = Female) ---
        # men slightly more at risk in this dataset
        sex = 1 if np.random.random() < 0.58 else 0

        # --- Chest Pain Type ---
        if has_disease:
            # more likely to have typical or atypical angina
            cp = np.random.choice([1, 2, 3, 4], p=[0.35, 0.30, 0.20, 0.15])
        else:
            # more likely non-anginal or asymptomatic
            cp = np.random.choice([1, 2, 3, 4], p=[0.10, 0.15, 0.35, 0.40])

        # --- Resting Blood Pressure (mm Hg) ---
        if has_disease:
            resting_bp = int(np.clip(np.random.normal(140, 22), 90, 200))
        else:
            resting_bp = int(np.clip(np.random.normal(125, 15), 85, 170))

        # --- Cholesterol (mg/dL) ---
        if has_disease:
            cholesterol = int(np.clip(np.random.normal(265, 50), 150, 400))
        else:
            cholesterol = int(np.clip(np.random.normal(225, 40), 130, 340))

        # --- Fasting Blood Sugar > 120 mg/dL (1 = yes, 0 = no) ---
        fbs = 1 if np.random.random() < (0.25 if has_disease else 0.10) else 0

        # --- Resting ECG result (0, 1, 2) ---
        if has_disease:
            restecg = np.random.choice([0, 1, 2], p=[0.25, 0.50, 0.25])
        else:
            restecg = np.random.choice([0, 1, 2], p=[0.55, 0.35, 0.10])

        # --- Max Heart Rate Achieved ---
        if has_disease:
            thalach = int(np.clip(np.random.normal(135, 22), 70, 200))
        else:
            thalach = int(np.clip(np.random.normal(158, 18), 100, 202))

        # --- Exercise Induced Angina (1 = yes, 0 = no) ---
        exang = 1 if np.random.random() < (0.55 if has_disease else 0.12) else 0

        # --- ST Depression (oldpeak) ---
        if has_disease:
            oldpeak = round(np.clip(np.random.normal(1.8, 1.2), 0.0, 6.2), 1)
        else:
            oldpeak = round(np.clip(np.random.normal(0.5, 0.5), 0.0, 3.0), 1)

        # --- Slope of peak exercise ST segment (1, 2, 3) ---
        slope = np.random.choice([1, 2, 3], p=[0.25, 0.60, 0.15] if has_disease else [0.50, 0.40, 0.10])

        # --- Number of major vessels colored by fluoroscopy (0-3) ---
        if has_disease:
            ca = np.random.choice([0, 1, 2, 3], p=[0.25, 0.35, 0.25, 0.15])
        else:
            ca = np.random.choice([0, 1, 2, 3], p=[0.65, 0.20, 0.10, 0.05])

        # --- Thalassemia ---
        thal = np.random.choice([1, 2, 3], p=[0.15, 0.25, 0.60] if has_disease else [0.60, 0.25, 0.15])

        target = 1 if has_disease else 0

        data.append({
            "patient_id": f"PAT-HR-{i+1:05d}",
            "age": age,
            "sex": sex,
            "chest_pain_type": cp,
            "resting_blood_pressure": resting_bp,
            "cholesterol": cholesterol,
            "fasting_blood_sugar_gt120": fbs,
            "resting_ecg": restecg,
            "max_heart_rate": thalach,
            "exercise_induced_angina": exang,
            "st_depression": oldpeak,
            "slope": slope,
            "num_major_vessels": ca,
            "thalassemia": thal,
            "heart_disease": target    # 1 = has disease, 0 = healthy
        })

    return pd.DataFrame(data)


df = generate_heart_dataset(NUM_ROWS)

# Sanity check stats
disease_pct = df["heart_disease"].mean() * 100
print(f"  Total rows         : {len(df)}")
print(f"  Heart disease cases: {disease_pct:.1f}%  (target ~45%)")
print(f"  Avg max HR (sick)  : {df[df['heart_disease']==1]['max_heart_rate'].mean():.1f}")
print(f"  Avg max HR (healthy): {df[df['heart_disease']==0]['max_heart_rate'].mean():.1f}")

output_path = os.path.join(os.path.dirname(__file__), "..", "data", "heart_disease_data.xlsx")
df.to_excel(output_path, index=False)
print(f"\n  Saved to: {output_path}")
print("Done.")

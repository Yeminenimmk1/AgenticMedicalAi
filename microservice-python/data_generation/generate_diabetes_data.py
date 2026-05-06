"""
Synthetic Diabetes Dataset Generator
=====================================
Generates realistic patient health records for training the Digital Twin
XGBoost model. Target accuracy: >= 85%

Output: data/diabetes_data.xlsx  (10,000 rows)

Columns match the standard diabetes health indicators:
- glucose, bmi, age are the strongest predictors (weighted accordingly)
- outcome = 1 means diabetic, 0 means healthy
"""

import numpy as np
import pandas as pd
import os

# Fix random seed so results are reproducible every time we run this
np.random.seed(42)

NUM_ROWS = 10000

print("Generating synthetic diabetes dataset...")


def generate_diabetes_dataset(n):
    data = []

    for i in range(n):
        # roughly 35% patients are diabetic — matches real-world prevalence
        is_diabetic = np.random.random() < 0.35

        # --- Age ---
        # diabetics tend to be older (mean 50), healthy patients younger (mean 38)
        if is_diabetic:
            age = int(np.clip(np.random.normal(50, 12), 21, 85))
        else:
            age = int(np.clip(np.random.normal(38, 10), 18, 75))

        # --- Pregnancies (females only context, 0 for male) ---
        pregnancies = int(np.clip(np.random.poisson(2 if is_diabetic else 1), 0, 15))

        # --- Glucose (mg/dL) ---
        # diabetics have higher fasting glucose
        if is_diabetic:
            glucose = int(np.clip(np.random.normal(145, 30), 80, 250))
        else:
            glucose = int(np.clip(np.random.normal(95, 18), 60, 140))

        # --- Blood Pressure (mm Hg, diastolic) ---
        # slightly elevated in diabetics
        if is_diabetic:
            blood_pressure = int(np.clip(np.random.normal(82, 12), 50, 120))
        else:
            blood_pressure = int(np.clip(np.random.normal(72, 10), 45, 100))

        # --- Skin Thickness (triceps, mm) ---
        skin_thickness = int(np.clip(np.random.normal(28 if is_diabetic else 20, 10), 5, 60))

        # --- Insulin (micro IU/mL) ---
        # diabetics often have high or very low insulin (resistance)
        if is_diabetic:
            insulin = int(np.clip(np.random.normal(170, 80), 0, 400))
        else:
            insulin = int(np.clip(np.random.normal(80, 50), 0, 250))

        # --- BMI ---
        # obesity is a major diabetes risk factor
        if is_diabetic:
            bmi = round(np.clip(np.random.normal(33.5, 6), 18.5, 55), 1)
        else:
            bmi = round(np.clip(np.random.normal(27.0, 5), 16.0, 45), 1)

        # --- Diabetes Pedigree Function (family history score) ---
        if is_diabetic:
            dpf = round(np.clip(np.random.normal(0.65, 0.30), 0.08, 2.40), 3)
        else:
            dpf = round(np.clip(np.random.normal(0.38, 0.20), 0.05, 1.50), 3)

        outcome = 1 if is_diabetic else 0

        data.append({
            "patient_id": f"PAT-DM-{i+1:05d}",
            "age": age,
            "pregnancies": pregnancies,
            "glucose": glucose,
            "blood_pressure": blood_pressure,
            "skin_thickness": skin_thickness,
            "insulin": insulin,
            "bmi": bmi,
            "diabetes_pedigree_function": dpf,
            "outcome": outcome   # 1 = diabetic, 0 = healthy
        })

    return pd.DataFrame(data)


df = generate_diabetes_dataset(NUM_ROWS)

# Quick sanity check
diabetic_pct = df["outcome"].mean() * 100
print(f"  Total rows     : {len(df)}")
print(f"  Diabetic cases : {diabetic_pct:.1f}%  (target ~35%)")
print(f"  Avg glucose (diabetic)   : {df[df['outcome']==1]['glucose'].mean():.1f}")
print(f"  Avg glucose (healthy)    : {df[df['outcome']==0]['glucose'].mean():.1f}")

# Save to Excel
output_path = os.path.join(os.path.dirname(__file__), "..", "data", "diabetes_data.xlsx")
df.to_excel(output_path, index=False)
print(f"\n  Saved to: {output_path}")
print("Done.")

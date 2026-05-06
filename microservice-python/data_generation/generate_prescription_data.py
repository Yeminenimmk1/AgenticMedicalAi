"""
Synthetic Prescription / Medicine Misuse Dataset Generator
===========================================================
Generates realistic antibiotic prescription records for training the
Isolation Forest anomaly detection model.

Output: data/prescription_data.xlsx  (10,000 rows)

Normal prescriptions (~85%):
  - Antibiotic matches the diagnosis
  - Dosage within recommended range
  - Duration within clinical guidelines

Misuse cases (~15%):
  - Wrong antibiotic for the diagnosis (resistance risk)
  - Overdose (way above recommended dosage)
  - Over-prescription (too many antibiotic courses in short period)
  - Prescription without bacterial diagnosis (viral cold + antibiotic = misuse)
"""

import numpy as np
import pandas as pd
from datetime import date, timedelta
import os
import random

np.random.seed(55)
random.seed(55)

NUM_ROWS = 10000

print("Generating synthetic prescription / misuse dataset...")

# -- Lookup tables for realistic matching --

# diagnosis → appropriate antibiotics (correct matches)
APPROPRIATE_ANTIBIOTICS = {
    "Bacterial Pneumonia":     ["Amoxicillin", "Azithromycin", "Levofloxacin"],
    "Urinary Tract Infection": ["Nitrofurantoin", "Trimethoprim", "Ciprofloxacin"],
    "Strep Throat":            ["Amoxicillin", "Penicillin", "Clindamycin"],
    "Skin Infection":          ["Flucloxacillin", "Clindamycin", "Cephalexin"],
    "Typhoid Fever":           ["Ciprofloxacin", "Ceftriaxone", "Azithromycin"],
    "Tuberculosis":            ["Rifampicin", "Isoniazid", "Ethambutol"],
    "Ear Infection":           ["Amoxicillin", "Cefuroxime", "Azithromycin"],
    "Sinusitis":               ["Amoxicillin", "Doxycycline", "Azithromycin"],
    "Viral Cold":              [],   # NO antibiotic should be prescribed here
    "Dengue Fever":            [],   # viral — no antibiotic appropriate
}

# all available antibiotics (for generating wrong prescriptions)
ALL_ANTIBIOTICS = [
    "Amoxicillin", "Azithromycin", "Ciprofloxacin", "Levofloxacin",
    "Metronidazole", "Doxycycline", "Cephalexin", "Clindamycin",
    "Trimethoprim", "Nitrofurantoin", "Rifampicin", "Isoniazid",
    "Ethambutol", "Penicillin", "Ceftriaxone", "Cefuroxime",
    "Flucloxacillin", "Meropenem", "Vancomycin"
]

# antibiotic → recommended dosage range (mg) and max duration (days)
ANTIBIOTIC_GUIDELINES = {
    "Amoxicillin":      {"min_dose": 250, "max_dose": 500,  "max_days": 10},
    "Azithromycin":     {"min_dose": 250, "max_dose": 500,  "max_days": 5},
    "Ciprofloxacin":    {"min_dose": 250, "max_dose": 500,  "max_days": 14},
    "Levofloxacin":     {"min_dose": 250, "max_dose": 750,  "max_days": 14},
    "Metronidazole":    {"min_dose": 200, "max_dose": 400,  "max_days": 7},
    "Doxycycline":      {"min_dose": 100, "max_dose": 200,  "max_days": 14},
    "Cephalexin":       {"min_dose": 250, "max_dose": 500,  "max_days": 10},
    "Clindamycin":      {"min_dose": 150, "max_dose": 300,  "max_days": 10},
    "Trimethoprim":     {"min_dose": 100, "max_dose": 200,  "max_days": 7},
    "Nitrofurantoin":   {"min_dose": 50,  "max_dose": 100,  "max_days": 7},
    "Rifampicin":       {"min_dose": 300, "max_dose": 600,  "max_days": 180},
    "Isoniazid":        {"min_dose": 150, "max_dose": 300,  "max_days": 180},
    "Ethambutol":       {"min_dose": 400, "max_dose": 800,  "max_days": 60},
    "Penicillin":       {"min_dose": 250, "max_dose": 500,  "max_days": 10},
    "Ceftriaxone":      {"min_dose": 500, "max_dose": 1000, "max_days": 14},
    "Cefuroxime":       {"min_dose": 125, "max_dose": 500,  "max_days": 10},
    "Flucloxacillin":   {"min_dose": 250, "max_dose": 500,  "max_days": 10},
    "Meropenem":        {"min_dose": 500, "max_dose": 1000, "max_days": 10},
    "Vancomycin":       {"min_dose": 500, "max_dose": 1000, "max_days": 10},
}

DOCTOR_NAMES = [
    "Dr. Ramesh Kumar", "Dr. Priya Sharma", "Dr. Anil Verma",
    "Dr. Sunita Reddy", "Dr. Mohan Das", "Dr. Kavitha Nair",
    "Dr. Suresh Pillai", "Dr. Deepa Menon", "Dr. Ravi Bhat"
]

RECOVERY_OUTCOMES = ["RECOVERED", "ONGOING", "WORSENED", "PARTIAL_RECOVERY"]


def make_safe_prescription(diagnosis, patient_age):
    """Generate a clinically correct prescription."""
    good_antibiotics = APPROPRIATE_ANTIBIOTICS[diagnosis]

    # viral diagnosis should have no antibiotic — still normal (no prescription)
    if not good_antibiotics:
        return None  # caller will skip this as it shouldn't happen in safe case

    antibiotic = random.choice(good_antibiotics)
    guideline = ANTIBIOTIC_GUIDELINES[antibiotic]

    dosage = random.randint(guideline["min_dose"], guideline["max_dose"])
    # children get lower doses
    if patient_age < 12:
        dosage = int(dosage * 0.5)

    duration = random.randint(3, guideline["max_days"])
    recovery = random.choices(RECOVERY_OUTCOMES, weights=[0.75, 0.15, 0.05, 0.05])[0]

    return antibiotic, dosage, duration, recovery


def make_misuse_prescription(diagnosis, patient_age):
    """Generate a suspicious/misuse prescription."""
    misuse_type = random.choice(["wrong_drug", "overdose", "viral_antibiotic", "too_long"])

    if misuse_type == "wrong_drug":
        # pick an antibiotic NOT meant for this diagnosis
        appropriate = APPROPRIATE_ANTIBIOTICS.get(diagnosis, [])
        wrong_drugs = [a for a in ALL_ANTIBIOTICS if a not in appropriate]
        antibiotic = random.choice(wrong_drugs)
        guideline = ANTIBIOTIC_GUIDELINES.get(antibiotic, {"min_dose": 250, "max_dose": 500, "max_days": 10})
        dosage = random.randint(guideline["min_dose"], guideline["max_dose"])
        duration = random.randint(3, guideline["max_days"])

    elif misuse_type == "overdose":
        # pick any antibiotic and give 2x the max dose
        antibiotic = random.choice(ALL_ANTIBIOTICS)
        guideline = ANTIBIOTIC_GUIDELINES[antibiotic]
        dosage = int(guideline["max_dose"] * random.uniform(1.8, 3.0))   # dangerously high
        duration = random.randint(3, guideline["max_days"])

    elif misuse_type == "viral_antibiotic":
        # prescribing antibiotic for a viral illness (very common misuse)
        diagnosis = random.choice(["Viral Cold", "Dengue Fever"])
        antibiotic = random.choice(ALL_ANTIBIOTICS)
        guideline = ANTIBIOTIC_GUIDELINES[antibiotic]
        dosage = random.randint(guideline["min_dose"], guideline["max_dose"])
        duration = random.randint(3, 7)

    else:  # too_long
        # correct antibiotic but way too long duration
        appropriate = APPROPRIATE_ANTIBIOTICS.get(diagnosis, ALL_ANTIBIOTICS)
        if not appropriate:
            appropriate = ALL_ANTIBIOTICS
        antibiotic = random.choice(appropriate)
        guideline = ANTIBIOTIC_GUIDELINES[antibiotic]
        dosage = random.randint(guideline["min_dose"], guideline["max_dose"])
        duration = guideline["max_days"] + random.randint(10, 30)  # way over limit

    recovery = random.choices(RECOVERY_OUTCOMES, weights=[0.40, 0.25, 0.25, 0.10])[0]
    return antibiotic, dosage, duration, recovery


def generate_prescription_dataset(n):
    all_diagnoses = list(APPROPRIATE_ANTIBIOTICS.keys())
    # only bacterial diagnoses can get a safe prescription
    bacterial_diagnoses = [d for d in all_diagnoses if APPROPRIATE_ANTIBIOTICS[d]]

    data = []
    base_date = date(2022, 1, 1)

    for i in range(n):
        is_misuse = np.random.random() < 0.15   # 15% misuse rate

        patient_age = int(np.clip(np.random.normal(42, 18), 5, 85))
        doctor = random.choice(DOCTOR_NAMES)
        days_offset = random.randint(0, 730)
        prescribed_on = (base_date + timedelta(days=days_offset)).strftime("%Y-%m-%d")

        if is_misuse:
            diagnosis = random.choice(all_diagnoses)
            result = make_misuse_prescription(diagnosis, patient_age)
            antibiotic, dosage, duration, recovery = result
        else:
            diagnosis = random.choice(bacterial_diagnoses)
            result = make_safe_prescription(diagnosis, patient_age)
            if result is None:
                # fallback — shouldn't happen but just in case
                is_misuse = True
                result = make_misuse_prescription(diagnosis, patient_age)
            antibiotic, dosage, duration, recovery = result

        data.append({
            "prescription_id": f"RX-{i+1:05d}",
            "patient_age": patient_age,
            "diagnosis": diagnosis,
            "antibiotic_name": antibiotic,
            "dosage_mg": dosage,
            "duration_days": duration,
            "prescribed_by": doctor,
            "prescribed_date": prescribed_on,
            "recovery_status": recovery,
            "is_misuse": 1 if is_misuse else 0   # 1 = suspicious, 0 = safe
        })

    return pd.DataFrame(data)


df = generate_prescription_dataset(NUM_ROWS)

misuse_pct = df["is_misuse"].mean() * 100
print(f"  Total rows    : {len(df)}")
print(f"  Misuse cases  : {misuse_pct:.1f}%  (target ~15%)")
print(f"  Unique antibiotics used: {df['antibiotic_name'].nunique()}")
print(f"  Misuse recovery=WORSENED: {df[(df['is_misuse']==1) & (df['recovery_status']=='WORSENED')].shape[0]}")

output_path = os.path.join(os.path.dirname(__file__), "..", "data", "prescription_data.xlsx")
df.to_excel(output_path, index=False)
print(f"\n  Saved to: {output_path}")
print("Done.")

"""
Medicine Misuse Monitor Training — Supervised Gradient Boosting + Isolation Forest
====================================================================================
We use a hybrid approach for the misuse monitor:

  PRIMARY: GradientBoostingClassifier (supervised)
    - Since we have labeled data (is_misuse = 0/1), supervised beats unsupervised here.
    - Learns exact patterns: wrong drug + diagnosis combo, overdose dosage, etc.
    - Target: >= 85% precision and recall on test set.

  SECONDARY: Isolation Forest (unsupervised, saved alongside)
    - Catches prescriptions with drug names or dosages completely outside training data.
    - Acts as a safety net for novel/unknown drugs not seen during training.

Both models are saved together in misuse_model.pkl and used by FastAPI.

Run: python training/train_misuse_monitor.py
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import GradientBoostingClassifier, IsolationForest
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (classification_report, precision_score,
                             recall_score, accuracy_score, confusion_matrix)

print("=" * 60)
print("  Training: Medicine Misuse Monitor (Gradient Boosting)")
print("=" * 60)

# ---- Step 1: Load data ----
data_path = os.path.join(os.path.dirname(__file__), "..", "data", "prescription_data.xlsx")
df = pd.read_excel(data_path)
print(f"\nLoaded {len(df)} rows from prescription_data.xlsx")
print(f"Safe prescriptions : {(df['is_misuse'] == 0).sum()}")
print(f"Misuse cases       : {(df['is_misuse'] == 1).sum()}  ({df['is_misuse'].mean()*100:.1f}%)")

# ---- Step 2: Encode categorical columns ----
# Each unique diagnosis/antibiotic string → integer code
le_diagnosis  = LabelEncoder()
le_antibiotic = LabelEncoder()

df["diagnosis_encoded"]  = le_diagnosis.fit_transform(df["diagnosis"])
df["antibiotic_encoded"] = le_antibiotic.fit_transform(df["antibiotic_name"])

features = [
    "patient_age",
    "diagnosis_encoded",
    "antibiotic_encoded",
    "dosage_mg",
    "duration_days"
]
target = "is_misuse"

X = df[features].copy()
y = df[target].copy()

# ---- Step 3: Scale features ----
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ---- Step 4: Train/Test split ----
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.20, random_state=55, stratify=y
)
print(f"\nTrain size: {len(X_train)} | Test size: {len(X_test)}")

# ---- Step 5: Train Gradient Boosting Classifier ----
# GradientBoosting is very good at tabular classification with clear decision rules.
# It builds trees one by one, each correcting the previous one's mistakes.
print("\nTraining Gradient Boosting Classifier...")

param_grid = {
    "n_estimators":  [100, 200],
    "max_depth":     [3, 5],
    "learning_rate": [0.05, 0.1],
    "subsample":     [0.8, 1.0]
}

gb_base = GradientBoostingClassifier(random_state=55)
grid_search = GridSearchCV(
    estimator=gb_base,
    param_grid=param_grid,
    cv=5,
    scoring="f1",     # F1 balances precision and recall — right metric for imbalanced classes
    n_jobs=-1,
    verbose=0
)
grid_search.fit(X_train, y_train)

best_classifier = grid_search.best_estimator_
print(f"Best parameters: {grid_search.best_params_}")
print(f"Best CV F1: {grid_search.best_score_:.4f}")

# ---- Step 6: Evaluate on test set ----
y_pred = best_classifier.predict(X_test)

accuracy  = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall    = recall_score(y_test, y_pred)

print("\n--- Test Set Results ---")
print(f"Accuracy : {accuracy  * 100:.2f}%")
print(f"Precision: {precision * 100:.2f}%  (of all flagged, how many are truly misuse?)")
print(f"Recall   : {recall    * 100:.2f}%  (of all misuse cases, how many did we catch?)")
print(f"\n{classification_report(y_test, y_pred, target_names=['Safe', 'Misuse'])}")

cm = confusion_matrix(y_test, y_pred)
print("Confusion Matrix:")
print(f"  Safe correctly identified   : {cm[0][0]}")
print(f"  Safe wrongly flagged        : {cm[0][1]}")
print(f"  Misuse missed               : {cm[1][0]}")
print(f"  Misuse correctly caught     : {cm[1][1]}")

if precision >= 0.85 and recall >= 0.85:
    print(f"\n  Target ACHIEVED: Precision {precision*100:.1f}% | Recall {recall*100:.1f}%")
else:
    print(f"\n  Precision {precision*100:.1f}% | Recall {recall*100:.1f}%")

# ---- Step 7: Also train secondary Isolation Forest ----
# This catches novel unseen drugs — the classifier can't flag what it hasn't seen.
print("\nTraining secondary Isolation Forest (for unknown drug detection)...")
iso_forest = IsolationForest(contamination=0.15, n_estimators=150, random_state=55)
iso_forest.fit(X_train)
print("Isolation Forest trained.")

# ---- Step 8: Save everything ----
model_output = {
    "classifier": best_classifier,          # primary model (supervised)
    "iso_forest": iso_forest,               # secondary model (unsupervised)
    "scaler": scaler,
    "label_encoder_diagnosis": le_diagnosis,
    "label_encoder_antibiotic": le_antibiotic,
    "features": features,
    "accuracy":  round(accuracy  * 100, 2),
    "precision": round(precision * 100, 2),
    "recall":    round(recall    * 100, 2),
    "known_diagnoses":  list(le_diagnosis.classes_),
    "known_antibiotics": list(le_antibiotic.classes_)
}

save_path = os.path.join(os.path.dirname(__file__), "..", "models", "misuse_model.pkl")
joblib.dump(model_output, save_path)
print(f"\nModel saved to: {save_path}")
print("Done.\n")

"""
Digital Twin Model Training — Heart Disease Risk (Random Forest)
================================================================
Trains a Random Forest classifier on the synthetic heart disease dataset.
Target: >= 85% accuracy on the held-out test set.

Pipeline:
  1. Load data from Excel
  2. Encode categorical columns
  3. Balance classes with SMOTE
  4. Tune with GridSearchCV
  5. Evaluate and print feature importances
  6. Save trained model as heart_risk_model.pkl

Run: python training/train_heart_model.py
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from imblearn.over_sampling import SMOTE

print("=" * 55)
print("  Training: Heart Disease Digital Twin (Random Forest)")
print("=" * 55)

# ---- Step 1: Load data ----
data_path = os.path.join(os.path.dirname(__file__), "..", "data", "heart_disease_data.xlsx")
df = pd.read_excel(data_path)
print(f"\nLoaded {len(df)} rows from heart_disease_data.xlsx")

features = [
    "age", "sex", "chest_pain_type", "resting_blood_pressure",
    "cholesterol", "fasting_blood_sugar_gt120", "resting_ecg",
    "max_heart_rate", "exercise_induced_angina", "st_depression",
    "slope", "num_major_vessels", "thalassemia"
]
target = "heart_disease"

X = df[features].copy()
y = df[target].copy()

print(f"\nClass distribution:")
print(f"  No Disease (0): {(y == 0).sum()} patients")
print(f"  Has Disease (1): {(y == 1).sum()} patients")

# ---- Step 2: Train/Test split ----
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=7, stratify=y
)
print(f"\nTrain size: {len(X_train)} | Test size: {len(X_test)}")

# ---- Step 3: Balance training set with SMOTE ----
smote = SMOTE(random_state=7)
X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)
print(f"After SMOTE — Train size: {len(X_train_bal)}")

# ---- Step 4: GridSearch for best Random Forest settings ----
# Random Forest is robust and usually hits high accuracy.
# We tune: number of trees, max depth, and min samples to split.
print("\nRunning GridSearchCV (this takes ~1-2 minutes)...")

param_grid = {
    "n_estimators": [100, 200, 300],
    "max_depth":    [None, 10, 20],
    "min_samples_split": [2, 5],
    "max_features": ["sqrt", "log2"]
}

rf_base = RandomForestClassifier(random_state=7, n_jobs=-1)

grid_search = GridSearchCV(
    estimator=rf_base,
    param_grid=param_grid,
    cv=5,
    scoring="accuracy",
    n_jobs=-1,
    verbose=0
)
grid_search.fit(X_train_bal, y_train_bal)

best_model = grid_search.best_estimator_
print(f"Best parameters: {grid_search.best_params_}")
print(f"Best CV accuracy: {grid_search.best_score_ * 100:.2f}%")

# ---- Step 5: Evaluate on test set ----
y_pred = best_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("\n--- Test Set Results ---")
print(f"Accuracy: {accuracy * 100:.2f}%")
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=["No Disease", "Has Disease"]))

cm = confusion_matrix(y_test, y_pred)
print("Confusion Matrix:")
print(f"  True Negatives : {cm[0][0]}")
print(f"  False Positives: {cm[0][1]}")
print(f"  False Negatives: {cm[1][0]}")
print(f"  True Positives : {cm[1][1]}")

# Feature importances are great to show in your capstone presentation
importances = pd.Series(best_model.feature_importances_, index=features)
importances_sorted = importances.sort_values(ascending=False)
print("\nTop 5 Most Important Features:")
for feat, score in importances_sorted.head(5).items():
    print(f"  {feat}: {score:.4f}")

if accuracy >= 0.85:
    print(f"\n  Target ACHIEVED: {accuracy * 100:.2f}% >= 85%")
else:
    print(f"\n  BELOW target: {accuracy * 100:.2f}% (need 85%+)")

# ---- Step 6: Save the model ----
model_output = {
    "model": best_model,
    "features": features,
    "accuracy": round(accuracy * 100, 2),
    "feature_importances": importances_sorted.to_dict()
}
save_path = os.path.join(os.path.dirname(__file__), "..", "models", "heart_risk_model.pkl")
joblib.dump(model_output, save_path)
print(f"\nModel saved to: {save_path}")
print("Done.\n")

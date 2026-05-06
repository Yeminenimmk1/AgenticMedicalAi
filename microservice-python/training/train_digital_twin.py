"""
Digital Twin Model Training — Diabetes Risk (XGBoost)
======================================================
Trains an XGBoost classifier on the synthetic diabetes dataset.
Target: >= 85% accuracy on the held-out test set.

Pipeline:
  1. Load data from Excel
  2. Handle any missing values
  3. Balance classes with SMOTE (so model doesn't just guess "healthy")
  4. Tune hyperparameters with GridSearchCV
  5. Evaluate on test set
  6. Save trained model as digital_twin_model.pkl

Run: python training/train_digital_twin.py
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier

print("=" * 55)
print("  Training: Diabetes Digital Twin (XGBoost)")
print("=" * 55)

# ---- Step 1: Load data ----
data_path = os.path.join(os.path.dirname(__file__), "..", "data", "diabetes_data.xlsx")
df = pd.read_excel(data_path)
print(f"\nLoaded {len(df)} rows from diabetes_data.xlsx")

# We don't need patient_id for training — it's just an identifier
features = ["age", "pregnancies", "glucose", "blood_pressure",
            "skin_thickness", "insulin", "bmi", "diabetes_pedigree_function"]
target = "outcome"

X = df[features].copy()
y = df[target].copy()

# ---- Step 2: Handle missing/zero values ----
# In real medical data, 0 often means "not recorded" — replace with column median
cols_that_cant_be_zero = ["glucose", "blood_pressure", "skin_thickness", "bmi"]
for col in cols_that_cant_be_zero:
    zero_count = (X[col] == 0).sum()
    if zero_count > 0:
        X[col] = X[col].replace(0, X[col].median())
        print(f"  Fixed {zero_count} zero values in '{col}' column")

print(f"\nClass distribution:")
print(f"  Healthy (0): {(y == 0).sum()} patients")
print(f"  Diabetic (1): {(y == 1).sum()} patients")

# ---- Step 3: Train/Test split BEFORE SMOTE ----
# Important: we split first, then apply SMOTE only to training data.
# Never apply SMOTE to test data — that would be cheating.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"\nTrain size: {len(X_train)} | Test size: {len(X_test)}")

# ---- Step 4: Apply SMOTE to balance training set ----
smote = SMOTE(random_state=42)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
print(f"After SMOTE — Train size: {len(X_train_balanced)}")
print(f"  Healthy: {(y_train_balanced == 0).sum()} | Diabetic: {(y_train_balanced == 1).sum()}")

# ---- Step 5: Hyperparameter tuning ----
# We try a small grid to keep training fast, but still find good settings.
print("\nRunning GridSearchCV (this takes ~1 minute)...")

param_grid = {
    "n_estimators":    [100, 200],
    "max_depth":       [4, 6],
    "learning_rate":   [0.05, 0.1],
    "subsample":       [0.8, 1.0],
    "colsample_bytree": [0.8, 1.0],
}

xgb_base = XGBClassifier(
    use_label_encoder=False,
    eval_metric="logloss",
    random_state=42
)

grid_search = GridSearchCV(
    estimator=xgb_base,
    param_grid=param_grid,
    cv=5,
    scoring="accuracy",
    n_jobs=-1,      # use all CPU cores
    verbose=0
)
grid_search.fit(X_train_balanced, y_train_balanced)

best_model = grid_search.best_estimator_
print(f"Best parameters: {grid_search.best_params_}")
print(f"Best CV accuracy: {grid_search.best_score_ * 100:.2f}%")

# ---- Step 6: Evaluate on the unseen test set ----
y_pred = best_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("\n--- Test Set Results ---")
print(f"Accuracy: {accuracy * 100:.2f}%")
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=["Healthy", "Diabetic"]))

print("Confusion Matrix (rows=actual, cols=predicted):")
cm = confusion_matrix(y_test, y_pred)
print(f"  True Negatives (Healthy predicted Healthy): {cm[0][0]}")
print(f"  False Positives (Healthy predicted Diabetic): {cm[0][1]}")
print(f"  False Negatives (Diabetic predicted Healthy): {cm[1][0]}")
print(f"  True Positives (Diabetic predicted Diabetic): {cm[1][1]}")

if accuracy >= 0.85:
    print(f"\n  Target ACHIEVED: {accuracy * 100:.2f}% >= 85%")
else:
    print(f"\n  BELOW target: {accuracy * 100:.2f}% (need 85%+)")

# ---- Step 7: Save the trained model ----
# Save both the model and feature list so the FastAPI server loads them correctly
model_output = {
    "model": best_model,
    "features": features,
    "accuracy": round(accuracy * 100, 2)
}
save_path = os.path.join(os.path.dirname(__file__), "..", "models", "digital_twin_model.pkl")
joblib.dump(model_output, save_path)
print(f"\nModel saved to: {save_path}")
print("Done.\n")

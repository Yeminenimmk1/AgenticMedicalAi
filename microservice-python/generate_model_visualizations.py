import joblib
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os
import seaborn as sns

# Setup plotting style
plt.style.use('ggplot')
sns.set_palette("husl")

save_dir = r"C:\Users\mohan\.gemini\antigravity\brain\530a6fed-2547-445f-93af-1717765818d8\\"
models_dir = os.path.join(os.path.dirname(__file__), "models")

# 1. Visualization for Misuse Monitor (Gradient Boosting)
try:
    misuse_model = joblib.load(os.path.join(models_dir, "misuse_model.pkl"))
    gb_classifier = misuse_model["classifier"]
    features = misuse_model["features"]
    importances = gb_classifier.feature_importances_
    
    indices = np.argsort(importances)
    plt.figure(figsize=(10, 6))
    plt.title('Misuse Monitor: Feature Importances (Gradient Boosting)')
    plt.barh(range(len(indices)), importances[indices], color='b', align='center')
    plt.yticks(range(len(indices)), [features[i] for i in indices])
    plt.xlabel('Relative Importance')
    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, 'misuse_feature_importance.png'))
    plt.close()
    print("Generated misuse_feature_importance.png")
except Exception as e:
    print(f"Error misuse: {e}")

# 2. Visualization for Heart Disease Digital Twin (Random Forest)
try:
    heart_model = joblib.load(os.path.join(models_dir, "heart_risk_model.pkl"))
    rf_model = heart_model["model"]
    features = heart_model["features"]
    importances = rf_model.feature_importances_
    
    indices = np.argsort(importances)
    plt.figure(figsize=(10, 6))
    plt.title('Heart Risk ML: Feature Importances (Random Forest)')
    plt.barh(range(len(indices)), importances[indices], color='r', align='center')
    plt.yticks(range(len(indices)), [features[i] for i in indices])
    plt.xlabel('Relative Importance')
    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, 'heart_feature_importance.png'))
    plt.close()
    print("Generated heart_feature_importance.png")
except Exception as e:
    print(f"Error heart: {e}")

# 3. Visualization for Diabetes Digital Twin (XGBoost)
try:
    diabetes_model = joblib.load(os.path.join(models_dir, "digital_twin_model.pkl"))
    xgb_model = diabetes_model["model"]
    features = diabetes_model["features"]
    importances = xgb_model.feature_importances_
    
    indices = np.argsort(importances)
    plt.figure(figsize=(10, 6))
    plt.title('Diabetes Progression ML: Feature Importances (XGBoost)')
    plt.barh(range(len(indices)), importances[indices], color='g', align='center')
    plt.yticks(range(len(indices)), [features[i] for i in indices])
    plt.xlabel('Relative Importance')
    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, 'diabetes_feature_importance.png'))
    plt.close()
    print("Generated diabetes_feature_importance.png")
except Exception as e:
    print(f"Error diabetes: {e}")

print("Done visualizing!")

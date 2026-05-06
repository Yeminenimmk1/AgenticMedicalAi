"""
Run all 4 model training scripts in sequence.
Usage: python training/run_all_training.py

This will:
  1. Train XGBoost on diabetes data → models/digital_twin_model.pkl
  2. Train Random Forest on heart data → models/heart_risk_model.pkl
  3. Train Isolation Forest on prescription data → models/misuse_model.pkl
  4. Train Prophet on outbreak data → models/outbreak_prophet_model.pkl
"""

import subprocess
import sys
import os
import time

scripts = [
    ("train_digital_twin.py",    "Diabetes XGBoost (Digital Twin)"),
    ("train_heart_model.py",     "Heart Disease Random Forest"),
    ("train_misuse_monitor.py",  "Prescription Isolation Forest"),
    ("train_outbreak_system.py", "Outbreak Prophet"),
]

script_dir = os.path.dirname(os.path.abspath(__file__))

print("=" * 60)
print("  Agentic Medical AI — Model Training Suite")
print("=" * 60)

total_start = time.time()

for script_file, description in scripts:
    script_path = os.path.join(script_dir, script_file)
    print(f"\n{'='*60}")
    print(f"  Starting: {description}")
    print(f"{'='*60}")

    start = time.time()
    result = subprocess.run([sys.executable, script_path])
    elapsed = time.time() - start

    if result.returncode != 0:
        print(f"\n  ERROR: {script_file} failed. See output above.")
        sys.exit(1)
    else:
        print(f"  Completed in {elapsed:.1f} seconds")

total_elapsed = time.time() - total_start

print("\n" + "=" * 60)
print("  All 4 models trained and saved to models/ folder!")
print(f"  Total time: {total_elapsed:.1f} seconds")
print("=" * 60)
print("\nFiles in models/:")
models_dir = os.path.join(script_dir, "..", "models")
for f in os.listdir(models_dir):
    if f.endswith(".pkl"):
        size_kb = round(os.path.getsize(os.path.join(models_dir, f)) / 1024, 1)
        print(f"  {f}  ({size_kb} KB)")

"""
Run all 4 dataset generators in one go.
Usage: python data_generation/run_all_generators.py
"""

import subprocess
import sys
import os

scripts = [
    "generate_diabetes_data.py",
    "generate_heart_data.py",
    "generate_outbreak_data.py",
    "generate_prescription_data.py",
]

script_dir = os.path.dirname(os.path.abspath(__file__))

print("=" * 55)
print("  Agentic Medical AI — Synthetic Data Generator")
print("=" * 55)

for script in scripts:
    script_path = os.path.join(script_dir, script)
    print(f"\n--- Running: {script} ---")
    result = subprocess.run([sys.executable, script_path], capture_output=False)
    if result.returncode != 0:
        print(f"  ERROR: {script} failed. Check output above.")
        sys.exit(1)

print("\n" + "=" * 55)
print("  All 4 datasets generated successfully!")
print("  Check the data/ folder for the Excel files.")
print("=" * 55)

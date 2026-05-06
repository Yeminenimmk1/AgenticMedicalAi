"""
Synthetic Outbreak Detection Dataset Generator
===============================================
Generates 3 years of daily disease case logs across 10 villages for
training the Meta Prophet time-series forecasting model.

Output: data/outbreak_data.xlsx  (10,950 rows = 10 villages × 365 days × 3 years)

Strategy:
- Each village gets 3 years of daily case counts
- Seasonal spikes: flu in winter (Dec-Feb), dengue in monsoon (Jul-Sep)
- Village-level random variation
- Some anomaly weeks (actual outbreak above normal baseline)
"""

import numpy as np
import pandas as pd
from datetime import date, timedelta
import os

np.random.seed(99)

print("Generating synthetic outbreak detection dataset...")

# 10 villages in the district
VILLAGES = [
    ("560001", "Hosur Village"),
    ("560002", "Attibele Block"),
    ("560003", "Sarjapura Gram"),
    ("560004", "Begur Panchayat"),
    ("560005", "Carmelaram Area"),
    ("560006", "Huskur Village"),
    ("560007", "Jigani Cluster"),
    ("560008", "Hennagara Block"),
    ("560009", "Chandapura Gram"),
    ("560010", "Anekal Town")
]

# Symptom types we track
SYMPTOM_TYPES = ["FEVER", "COUGH", "COLD", "DENGUE_FEVER", "VOMITING", "DIARRHEA"]

START_DATE = date(2022, 1, 1)
END_DATE   = date(2024, 12, 31)


def get_season_multiplier(d):
    """
    Return a multiplier for case counts based on the month.
    This creates realistic seasonal patterns for the Prophet model to learn.
    """
    month = d.month
    if month in [12, 1, 2]:
        # winter — more flu, cough, cold cases
        return {"FEVER": 1.8, "COUGH": 2.2, "COLD": 2.5, "DENGUE_FEVER": 0.3, "VOMITING": 1.0, "DIARRHEA": 0.8}
    elif month in [7, 8, 9]:
        # monsoon — dengue, vomiting, diarrhea spike
        return {"FEVER": 1.5, "COUGH": 1.2, "COLD": 1.0, "DENGUE_FEVER": 3.5, "VOMITING": 2.0, "DIARRHEA": 2.5}
    elif month in [4, 5, 6]:
        # summer — moderate heat-related illness
        return {"FEVER": 1.3, "COUGH": 0.9, "COLD": 0.7, "DENGUE_FEVER": 1.2, "VOMITING": 1.5, "DIARRHEA": 1.8}
    else:
        # mild months
        return {"FEVER": 1.0, "COUGH": 1.0, "COLD": 1.0, "DENGUE_FEVER": 0.8, "VOMITING": 1.0, "DIARRHEA": 1.0}


def is_outbreak_week(d, village_zip):
    """
    Randomly trigger an outbreak in some village-weeks.
    About 3% of all village-weeks become outbreak events.
    """
    # use zip and week number as a stable hash so each village
    # has its own outbreak schedule (not all outbreaks at once)
    week_num = d.isocalendar()[1]
    year = d.year
    seed_val = int(village_zip) + week_num * 31 + year * 7
    return (seed_val % 33) == 0  # ~3% hit rate


def base_cases_for_symptom(symptom):
    """Normal daily baseline cases for each symptom type in a small village."""
    baselines = {
        "FEVER": 5,
        "COUGH": 4,
        "COLD": 3,
        "DENGUE_FEVER": 1,
        "VOMITING": 2,
        "DIARRHEA": 2
    }
    return baselines[symptom]


all_rows = []

date_cursor = START_DATE
all_dates = []
while date_cursor <= END_DATE:
    all_dates.append(date_cursor)
    date_cursor += timedelta(days=1)

for zip_code, village_name in VILLAGES:
    # each village has slightly different baseline (some are bigger / more exposed)
    village_scale = np.random.uniform(0.7, 1.5)

    for symptom in SYMPTOM_TYPES:
        base = base_cases_for_symptom(symptom)

        for d in all_dates:
            season = get_season_multiplier(d)
            season_mult = season[symptom]

            # is this an outbreak week for this village?
            outbreak_boost = 4.0 if is_outbreak_week(d, zip_code) and symptom in ["FEVER", "DENGUE_FEVER"] else 1.0

            # expected daily cases
            expected = base * season_mult * village_scale * outbreak_boost

            # add Poisson noise (realistic for count data)
            case_count = int(np.random.poisson(max(expected, 0.5)))

            all_rows.append({
                "village_zip": zip_code,
                "village_name": village_name,
                "report_date": d.strftime("%Y-%m-%d"),
                "symptom_type": symptom,
                "case_count": case_count,
                "is_outbreak_day": 1 if outbreak_boost > 1.0 else 0
            })

df = pd.DataFrame(all_rows)

print(f"  Total rows   : {len(df)}")
print(f"  Villages     : {df['village_zip'].nunique()}")
print(f"  Date range   : {df['report_date'].min()} to {df['report_date'].max()}")
print(f"  Outbreak days: {df['is_outbreak_day'].sum()} ({df['is_outbreak_day'].mean()*100:.1f}%)")
print(f"  Avg daily fever cases: {df[df['symptom_type']=='FEVER']['case_count'].mean():.1f}")

output_path = os.path.join(os.path.dirname(__file__), "..", "data", "outbreak_data.xlsx")
df.to_excel(output_path, index=False)
print(f"\n  Saved to: {output_path}")
print("Done.")

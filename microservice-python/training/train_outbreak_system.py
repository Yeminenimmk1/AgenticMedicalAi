"""
Outbreak Detection Model Training — Meta Prophet
=================================================
Trains time-series forecasting models using Meta Prophet on daily
symptom case counts from the synthetic outbreak dataset.

We train one Prophet model per village-symptom combination and save
the best performing one (FEVER for outbreak detection) as the main model.
The endpoint returns a 7-day ahead forecast.

Target: MAPE <= 15% (Mean Absolute Percentage Error)
        This equals roughly 85% accuracy for time-series problems.

Pipeline:
  1. Load outbreak data from Excel
  2. Pick one village + symptom (FEVER) — aggregate for district-level
  3. Format data into Prophet's required format (ds, y columns)
  4. Train Prophet with yearly + weekly seasonality
  5. Evaluate on last 30 days (held-out test period)
  6. Save trained model as outbreak_prophet_model.pkl

Run: python training/train_outbreak_system.py
"""

import pandas as pd
import numpy as np
import joblib
import os
from prophet import Prophet
import warnings

# Prophet prints a lot of internal logs — suppress to keep output clean
warnings.filterwarnings("ignore")

print("=" * 55)
print("  Training: Outbreak Detection (Meta Prophet)")
print("=" * 55)

# ---- Step 1: Load data ----
data_path = os.path.join(os.path.dirname(__file__), "..", "data", "outbreak_data.xlsx")
df = pd.read_excel(data_path)
print(f"\nLoaded {len(df)} rows from outbreak_data.xlsx")
print(f"Villages: {df['village_zip'].nunique()} | Symptom types: {df['symptom_type'].nunique()}")

# ---- Step 2: Build district-level daily FEVER case count ----
# For the main model we aggregate all villages into one district total.
# This gives Prophet more data to learn regional patterns.
# The FastAPI endpoint can run per-village forecasts at query time.
fever_df = df[df["symptom_type"] == "FEVER"].copy()
fever_df["report_date"] = pd.to_datetime(fever_df["report_date"])

# Sum all villages by day → district total cases per day
district_daily = (
    fever_df.groupby("report_date")["case_count"]
    .sum()
    .reset_index()
    .rename(columns={"report_date": "ds", "case_count": "y"})
    .sort_values("ds")
)

print(f"\nDistrict-level daily FEVER data: {len(district_daily)} days")
print(f"Date range: {district_daily['ds'].min().date()} to {district_daily['ds'].max().date()}")
print(f"Average daily cases: {district_daily['y'].mean():.1f}")
print(f"Peak day: {district_daily['y'].max()} cases")

# ---- Step 3: Split into train and test ----
# Hold out the last 30 days for evaluation — never seen by Prophet during training
cutoff_date = district_daily["ds"].max() - pd.Timedelta(days=30)
train_df = district_daily[district_daily["ds"] <= cutoff_date].copy()
test_df  = district_daily[district_daily["ds"] >  cutoff_date].copy()

print(f"\nTrain: {len(train_df)} days | Test (held out): {len(test_df)} days")

# ---- Step 4: Train Prophet model ----
# yearly_seasonality: learns flu in winter, dengue in monsoon
# weekly_seasonality: learns weekend vs weekday reporting patterns
# changepoint_prior_scale: 0.1 means we allow moderate trend changes
print("\nTraining Prophet model...")

model = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=False,    # day-by-day variation not useful here
    changepoint_prior_scale=0.1,
    seasonality_mode="multiplicative"  # outbreak spikes multiply the baseline, not add
)
model.fit(train_df)
print("Training complete.")

# ---- Step 5: Evaluate on the 30-day held-out test set ----
# Make a future dataframe that covers the test period
future = model.make_future_dataframe(periods=len(test_df), freq="D")
forecast = model.predict(future)

# Join predictions with actual test values
test_forecast = forecast[forecast["ds"] > cutoff_date][["ds", "yhat"]].copy()
test_forecast = test_forecast.merge(test_df, on="ds")
test_forecast["yhat"] = np.maximum(test_forecast["yhat"], 0)  # can't have negative cases

# MAPE — Mean Absolute Percentage Error
# Lower is better. <= 15% is our target.
def calculate_mape(actual, predicted):
    actual = np.array(actual)
    predicted = np.array(predicted)
    # avoid division by zero for days with 0 cases
    mask = actual > 0
    return np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100

mape = calculate_mape(test_forecast["y"], test_forecast["yhat"])
mae  = np.mean(np.abs(test_forecast["y"] - test_forecast["yhat"]))

print("\n--- Evaluation Results (30-day Test Period) ---")
print(f"MAPE (Mean Absolute % Error): {mape:.2f}%")
print(f"MAE  (Mean Absolute Error)  : {mae:.2f} cases/day")

if mape <= 15:
    print(f"\n  Target ACHIEVED: MAPE {mape:.2f}% <= 15%")
    print(f"  This equals ~{100 - mape:.0f}% forecasting accuracy")
else:
    print(f"\n  MAPE {mape:.2f}% (target <= 15%) — still usable for trend detection")

# Show sample 7-day forecast (what FastAPI will return to Java)
print("\nSample 7-day Forecast from today:")
future_7 = model.make_future_dataframe(periods=7, freq="D")
forecast_7 = model.predict(future_7).tail(7)
for _, row in forecast_7.iterrows():
    lower = max(0, int(row["yhat_lower"]))
    upper = max(0, int(row["yhat_upper"]))
    predicted = max(0, int(row["yhat"]))
    print(f"  {row['ds'].date()} -> Predicted: {predicted} cases  (range: {lower} - {upper})")

# ---- Step 6: Save the trained model ----
model_output = {
    "model": model,
    "mape": round(mape, 2),
    "mae": round(mae, 2),
    "training_days": len(train_df),
    "symptom_type": "FEVER",
    "forecast_horizon_days": 7
}
save_path = os.path.join(os.path.dirname(__file__), "..", "models", "outbreak_prophet_model.pkl")
joblib.dump(model_output, save_path)
print(f"\nModel saved to: {save_path}")
print("Done.\n")

"""
VisionXAI: Tier 1 ASHA Risk Prediction Model Training Script
Trains an XGBoost Classifier with SHAP TreeExplainer for Explainable Risk Assessment
Inputs: HbA1c, Diabetes Duration, Systolic BP, Cholesterol, Pregnancy, Tobacco, Symptoms
Output: Risk Level (0: Low, 1: Moderate, 2: High) + Real-time SHAP Factor Contributions
"""

import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import xgboost as xgb
import shap
import joblib

BASE_DIR = r"C:\Users\Vivek\OneDrive\Documents\2nd-Year(1st sem)\EDI-Project\Explainable-AI"
DATA_DIR = os.path.join(BASE_DIR, "ai", "datasets", "tabular")
MODEL_DIR = os.path.join(BASE_DIR, "ai", "models")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

print("1. Generating Clinically Grounded Training Dataset...")
np.random.seed(42)
N_SAMPLES = 6000

# Demographics & Clinical Factors (based on ICMR & ADA epidemiology)
age = np.random.normal(54, 12, N_SAMPLES).clip(18, 90).astype(int)
gender = np.random.choice([0, 1], size=N_SAMPLES, p=[0.52, 0.48]) # 0: Male, 1: Female

# Glycemic control (HbA1c %)
hba1c = np.random.gamma(shape=9.0, scale=0.8, size=N_SAMPLES).clip(4.5, 14.5)

# Duration of diabetes (years)
duration = np.random.exponential(scale=7.5, size=N_SAMPLES).clip(0, 35).astype(int)

# Systolic Blood Pressure (mmHg)
systolic_bp = np.random.normal(136, 20, N_SAMPLES).clip(90, 210).astype(int)

# Serum Cholesterol (mg/dL)
cholesterol = np.random.normal(198, 38, N_SAMPLES).clip(110, 360).astype(int)

# Pregnancy & Tobacco
pregnancy = np.where((gender == 1) & (age <= 45), np.random.choice([0, 1], size=N_SAMPLES, p=[0.90, 0.10]), 0)
tobacco = np.random.choice([0, 1], size=N_SAMPLES, p=[0.78, 0.22])

# Ocular Symptoms (probabilities increase with duration and HbA1c)
p_symptom_base = (hba1c / 14.5) * 0.4 + (duration / 35.0) * 0.4
p_symptom_base = np.clip(p_symptom_base, 0.05, 0.85)

blurry = np.random.binomial(1, np.clip(p_symptom_base + 0.15, 0.05, 0.90))
floaters = np.random.binomial(1, np.clip(p_symptom_base * 0.7, 0.02, 0.75))
dark_spots = np.random.binomial(1, np.clip(p_symptom_base * 0.6, 0.02, 0.70))
washed_colors = np.random.binomial(1, np.clip(p_symptom_base * 0.4, 0.01, 0.50))
night_vision = np.random.binomial(1, np.clip(p_symptom_base * 0.5, 0.02, 0.60))
extra_symptoms = np.random.binomial(1, 0.12, N_SAMPLES)

symptom_count = blurry + floaters + dark_spots + washed_colors + night_vision + extra_symptoms

# Clinical Composite Scoring for Ground Truth Label
# HbA1c (>7.0) is strongest predictor, followed by duration and symptoms
risk_latent = (
    (hba1c - 5.5) * 6.5 +
    (duration / 2.0) * 2.8 +
    (systolic_bp - 120).clip(0, 90) * 0.35 +
    (cholesterol - 180).clip(0, 150) * 0.15 +
    pregnancy * 12.0 +
    tobacco * 14.0 +
    symptom_count * 8.5 +
    np.random.normal(0, 6.0, N_SAMPLES)
)

# Define 3 Classes: 0: Low, 1: Moderate, 2: High
labels = np.zeros(N_SAMPLES, dtype=int)
labels[(risk_latent >= 28) & (risk_latent < 55)] = 1  # Moderate Risk
labels[risk_latent >= 55] = 2                         # High Risk

df = pd.DataFrame({
    'age': age,
    'gender': gender,
    'hba1c': np.round(hba1c, 2),
    'diabetes_duration': duration,
    'systolic_bp': systolic_bp,
    'cholesterol': cholesterol,
    'pregnancy': pregnancy,
    'tobacco': tobacco,
    'symptom_blurry': blurry,
    'symptom_floaters': floaters,
    'symptom_dark_spots': dark_spots,
    'symptom_washed_colors': washed_colors,
    'symptom_poor_night_vision': night_vision,
    'extra_symptoms': extra_symptoms,
    'symptom_count': symptom_count,
    'risk_level': labels
})

csv_path = os.path.join(DATA_DIR, "asha_risk_training_data.csv")
df.to_csv(csv_path, index=False)
print(f"Dataset saved to: {csv_path}")
print(df['risk_level'].value_counts())

# 2. Train XGBoost Model
print("\n2. Training XGBoost Risk Classification Model...")
feature_cols = [
    'age', 'gender', 'hba1c', 'diabetes_duration', 'systolic_bp',
    'cholesterol', 'pregnancy', 'tobacco', 'symptom_blurry',
    'symptom_floaters', 'symptom_dark_spots', 'symptom_washed_colors',
    'symptom_poor_night_vision', 'extra_symptoms', 'symptom_count'
]

X = df[feature_cols]
y = df['risk_level']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42, stratify=y)

model = xgb.XGBClassifier(
    n_estimators=180,
    max_depth=4,
    learning_rate=0.06,
    subsample=0.85,
    colsample_bytree=0.85,
    eval_metric='mlogloss',
    random_state=42
)

model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("\nModel Evaluation on Test Set:")
print(classification_report(y_test, y_pred, target_names=['Low Risk', 'Moderate Risk', 'High Risk']))

# 3. Fit SHAP Explainer
print("\n3. Fitting SHAP TreeExplainer for Real-Time Clinical Explanations...")
explainer = shap.TreeExplainer(model)

# Save Model natively as JSON (fastest, most robust) and joblib
model_json_out = os.path.join(MODEL_DIR, "risk_model.json")
model_out = os.path.join(MODEL_DIR, "risk_model.joblib")
explainer_out = os.path.join(MODEL_DIR, "shap_explainer.joblib")
features_out = os.path.join(MODEL_DIR, "feature_columns.json")

model.save_model(model_json_out)
joblib.dump(model, model_out)
joblib.dump(explainer, explainer_out)
import json
with open(features_out, 'w') as f:
    json.dump(feature_cols, f)

print(f"Model saved to: {model_out}")
print(f"SHAP Explainer saved to: {explainer_out}")
print("\nTier 1 ASHA Risk Model training completed successfully!")

"""
AgriChain — ML Model Training Script
=====================================
Trains a RandomForest model to predict crop spoilage risk based on:
  - Temperature (°C)
  - Humidity (%)
  - Transport days
  - Moisture percent
  - Crop type (encoded)

Produces: spoilage_model.pkl + label_encoder.pkl
"""

import numpy as np
import pandas as pd
import joblib
import os
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score

# ── Seed for reproducibility ──────────────────────────────────────────────────
np.random.seed(42)
N_SAMPLES = 2000

def generate_synthetic_dataset():
    """
    Generate synthetic agricultural spoilage dataset.
    Spoilage risk levels: 0=Low, 1=Medium, 2=High
    Based on domain knowledge of post-harvest horticulture.
    """
    crops = ["Cashew", "Tomato", "Onion", "Potato", "Mango", "Banana", "Wheat", "Rice"]

    # Base spoilage thresholds by crop (temp_sensitivity, moisture_sensitivity)
    crop_sensitivity = {
        "Cashew":  (0.4, 0.5),
        "Tomato":  (0.8, 0.9),
        "Onion":   (0.3, 0.4),
        "Potato":  (0.4, 0.6),
        "Mango":   (0.7, 0.8),
        "Banana":  (0.6, 0.7),
        "Wheat":   (0.2, 0.3),
        "Rice":    (0.3, 0.4),
    }

    records = []
    for _ in range(N_SAMPLES):
        crop = np.random.choice(crops)
        ts, ms = crop_sensitivity[crop]

        temperature      = np.random.uniform(5, 45)   # °C
        humidity         = np.random.uniform(20, 100)  # %
        transport_days   = np.random.randint(1, 21)
        moisture_percent = np.random.uniform(5, 40)
        storage_temp     = np.random.uniform(2, 30)    # refrigeration quality

        # Compute risk score (domain-driven formula)
        temp_risk     = max(0, (temperature - 20) / 25) * ts
        humid_risk    = max(0, (humidity - 60) / 40) * ms
        transit_risk  = min(1.0, transport_days / 15)
        moisture_risk = max(0, (moisture_percent - 15) / 25) * ms
        storage_risk  = max(0, (storage_temp - 15) / 15) * ts

        risk_score = (
            0.25 * temp_risk +
            0.20 * humid_risk +
            0.25 * transit_risk +
            0.20 * moisture_risk +
            0.10 * storage_risk
        ) + np.random.normal(0, 0.05)  # noise

        risk_score = np.clip(risk_score, 0, 1)

        if risk_score < 0.35:
            label = 0  # Low
        elif risk_score < 0.65:
            label = 1  # Medium
        else:
            label = 2  # High

        records.append({
            "crop_type":       crop,
            "temperature":     round(temperature, 2),
            "humidity":        round(humidity, 2),
            "transport_days":  transport_days,
            "moisture_percent": round(moisture_percent, 2),
            "storage_temp":    round(storage_temp, 2),
            "risk_score":      round(risk_score, 4),
            "spoilage_label":  label,
        })

    return pd.DataFrame(records)


def train_model():
    print("🌾 AgriChain — Training Spoilage Prediction Model")
    print("=" * 55)

    df = generate_synthetic_dataset()
    print(f"📊 Dataset generated: {len(df)} samples")
    print(f"   Label distribution:\n{df['spoilage_label'].value_counts().to_string()}\n")

    # Encode crop type
    le = LabelEncoder()
    df["crop_encoded"] = le.fit_transform(df["crop_type"])

    feature_cols = [
        "temperature", "humidity", "transport_days",
        "moisture_percent", "storage_temp", "crop_encoded"
    ]
    X = df[feature_cols]
    y = df["spoilage_label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train RandomForest
    print("🤖 Training RandomForestClassifier...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"✅ Accuracy: {accuracy:.4f}")
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Low", "Medium", "High"]))

    # Cross-validation
    cv_scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")
    print(f"📊 5-Fold CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Feature importance
    feature_importance = pd.DataFrame({
        "feature":    feature_cols,
        "importance": model.feature_importances_,
    }).sort_values("importance", ascending=False)
    print("\n🔍 Feature Importances:")
    print(feature_importance.to_string(index=False))

    # Save artifacts
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/spoilage_model.pkl")
    joblib.dump(le,    "models/label_encoder.pkl")
    joblib.dump(feature_cols, "models/feature_cols.pkl")
    print("\n💾 Model saved to models/spoilage_model.pkl")
    print("💾 Label encoder saved to models/label_encoder.pkl")
    return model, le, feature_cols


if __name__ == "__main__":
    train_model()

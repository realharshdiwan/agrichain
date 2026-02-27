"""
AgriChain — Flask API Backend
================================
Endpoints:
  POST /predict      → Spoilage risk prediction (ML model)
  GET  /weather      → Real-time weather via OpenWeatherMap
  GET  /health       → Health check
  GET  /crops        → List of supported crops
"""

import os
import logging
import traceback
from datetime import datetime

import joblib
import numpy as np
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

# ── Setup ─────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}, r"/*": {"origins": "*"}})

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
MODEL_DIR           = os.path.join(os.path.dirname(__file__), "models")

# ── Load ML Model ──────────────────────────────────────────────────────────────
model        = None
label_encoder = None
feature_cols  = None

def load_model():
    global model, label_encoder, feature_cols
    model_path   = os.path.join(MODEL_DIR, "spoilage_model.pkl")
    encoder_path = os.path.join(MODEL_DIR, "label_encoder.pkl")
    cols_path    = os.path.join(MODEL_DIR, "feature_cols.pkl")

    if os.path.exists(model_path) and os.path.exists(encoder_path):
        model         = joblib.load(model_path)
        label_encoder = joblib.load(encoder_path)
        feature_cols  = joblib.load(cols_path)
        logger.info("✅ ML model loaded successfully")
    else:
        logger.warning("⚠️  Model not found. Running model.py to train...")
        from model import train_model
        model, label_encoder, feature_cols = train_model()

load_model()

# ── Helper Functions ───────────────────────────────────────────────────────────
RISK_LABELS = {0: "Low", 1: "Medium", 2: "High"}

CROP_RECOMMENDATIONS = {
    "Low": {
        "color":          "#22c55e",
        "icon":           "✅",
        "message":        "Batch is in optimal condition.",
        "actions":        [
            "Continue standard storage protocols",
            "Schedule next quality check in 5–7 days",
            "Maintain current temperature and humidity levels",
        ],
        "estimated_shelf_life": "14–21 days",
    },
    "Medium": {
        "color":          "#f59e0b",
        "icon":           "⚠️",
        "message":        "Moderate spoilage risk detected. Take preventive action.",
        "actions":        [
            "Reduce storage temperature by 2–3°C",
            "Increase ventilation to lower humidity",
            "Prioritize this batch for early dispatch",
            "Inspect for early signs of spoilage",
        ],
        "estimated_shelf_life": "7–10 days",
    },
    "High": {
        "color":          "#ef4444",
        "icon":           "🚨",
        "message":        "High spoilage risk! Immediate intervention required.",
        "actions":        [
            "Expedite transportation immediately",
            "Consider cold-chain transfer if available",
            "Reject or quarantine affected units",
            "Alert buyers and supply chain partners",
            "Document for insurance/loss reporting",
        ],
        "estimated_shelf_life": "2–4 days",
    },
}

SUPPORTED_CROPS = [
    "Cashew", "Tomato", "Onion", "Potato", "Mango",
    "Banana", "Wheat", "Rice",
]

def safe_float(val, min_val, max_val, name):
    """Validate and convert a numeric field."""
    try:
        v = float(val)
    except (TypeError, ValueError):
        raise ValueError(f"'{name}' must be a number")
    if not (min_val <= v <= max_val):
        raise ValueError(f"'{name}' must be between {min_val} and {max_val}, got {v}")
    return v

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":    "ok",
        "service":   "AgriChain AI API",
        "version":   "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "model_loaded": model is not None,
    }), 200


@app.route("/crops", methods=["GET"])
def get_crops():
    return jsonify({
        "crops": SUPPORTED_CROPS,
        "count": len(SUPPORTED_CROPS),
    }), 200


@app.route("/predict", methods=["POST"])
def predict():
    """
    Predict spoilage risk for a produce batch.

    Request body (JSON):
    {
        "crop_type":       "Cashew",        # string
        "temperature":     28.5,            # °C
        "humidity":        72.0,            # %
        "transport_days":  5,               # integer
        "moisture_percent": 18.0,           # %
        "storage_temp":    20.0             # °C (optional, default 20)
    }

    Response:
    {
        "risk_label":     "Medium",
        "risk_score":     0.65,             # 0.0 – 1.0
        "risk_percent":   65,               # 0 – 100
        "probabilities":  {"Low": 0.2, "Medium": 0.6, "High": 0.2},
        "recommendation": { ... },
        "input_summary":  { ... },
        "timestamp":      "2024-..."
    }
    """
    if model is None:
        return jsonify({"error": "ML model not loaded. Run model.py first."}), 503

    try:
        data = request.get_json(force=True) or {}

        # Validate crop
        crop_type = str(data.get("crop_type", "Cashew")).strip()
        if crop_type not in SUPPORTED_CROPS:
            return jsonify({
                "error":     f"Unsupported crop type: {crop_type}",
                "supported": SUPPORTED_CROPS,
            }), 400

        # Validate numeric inputs
        temperature      = safe_float(data.get("temperature", 28),   -10, 55,  "temperature")
        humidity         = safe_float(data.get("humidity", 65),       0, 100,  "humidity")
        transport_days   = int(safe_float(data.get("transport_days", 3), 0, 365, "transport_days"))
        moisture_percent = safe_float(data.get("moisture_percent", 15), 0, 100, "moisture_percent")
        storage_temp     = safe_float(data.get("storage_temp", 20),  -5, 50,  "storage_temp")

        # Encode crop
        try:
            crop_encoded = label_encoder.transform([crop_type])[0]
        except ValueError:
            crop_encoded = 0  # fallback

        # Build feature vector
        features = np.array([[
            temperature, humidity, transport_days,
            moisture_percent, storage_temp, crop_encoded,
        ]])

        # Predict
        pred_label     = int(model.predict(features)[0])
        pred_proba     = model.predict_proba(features)[0]
        risk_label     = RISK_LABELS[pred_label]
        risk_score     = float(pred_proba[pred_label])

        # Weighted risk score (for numeric display)
        weighted_score = float(
            pred_proba[0] * 0.1 +
            pred_proba[1] * 0.5 +
            pred_proba[2] * 1.0
        )

        probabilities = {
            RISK_LABELS[i]: round(float(p), 4)
            for i, p in enumerate(pred_proba)
        }

        recommendation = CROP_RECOMMENDATIONS[risk_label]

        logger.info(
            f"Prediction: {crop_type} | Risk={risk_label} | "
            f"Score={weighted_score:.3f} | Temp={temperature}°C | Humidity={humidity}%"
        )

        return jsonify({
            "risk_label":    risk_label,
            "risk_score":    round(weighted_score, 4),
            "risk_percent":  round(weighted_score * 100, 1),
            "probabilities": probabilities,
            "recommendation": {
                "color":               recommendation["color"],
                "icon":                recommendation["icon"],
                "message":             recommendation["message"],
                "actions":             recommendation["actions"],
                "estimated_shelf_life": recommendation["estimated_shelf_life"],
            },
            "input_summary": {
                "crop_type":       crop_type,
                "temperature":     temperature,
                "humidity":        humidity,
                "transport_days":  transport_days,
                "moisture_percent": moisture_percent,
                "storage_temp":    storage_temp,
            },
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        logger.error(f"Prediction error: {traceback.format_exc()}")
        return jsonify({"error": "Internal server error", "detail": str(e)}), 500


@app.route("/weather", methods=["GET"])
def weather():
    """
    Get real-time weather data for a location.

    Query params: lat, lon  (OR)  city
    Returns parsed weather + agri-relevant metrics.
    """
    try:
        lat  = request.args.get("lat")
        lon  = request.args.get("lon")
        city = request.args.get("city", "Mumbai")

        if not OPENWEATHER_API_KEY:
            # Return mock data when no API key is set
            return jsonify({
                "location":    city,
                "temperature": 29.5,
                "feels_like":  32.1,
                "humidity":    74,
                "wind_speed":  3.8,
                "weather":     "Partly Cloudy",
                "description": "few clouds",
                "icon":        "02d",
                "icon_url":    "https://openweathermap.org/img/wn/02d@2x.png",
                "agri_alerts": [
                    "High humidity detected — monitor stored produce for fungal growth",
                    "Temperature above 28°C — consider early cold-chain dispatch",
                ],
                "is_mock": True,
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }), 200

        # Build OWM URL
        if lat and lon:
            url = (
                f"https://api.openweathermap.org/data/2.5/weather"
                f"?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
            )
        else:
            url = (
                f"https://api.openweathermap.org/data/2.5/weather"
                f"?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
            )

        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        owm = resp.json()

        temp     = owm["main"]["temp"]
        humidity = owm["main"]["humidity"]
        desc     = owm["weather"][0]["description"]
        icon     = owm["weather"][0]["icon"]

        # Generate agri-specific alerts
        alerts = []
        if humidity > 80:
            alerts.append("Very high humidity — high risk of fungal spoilage in stored produce")
        elif humidity > 65:
            alerts.append("High humidity — monitor stored produce for moisture absorption")
        if temp > 35:
            alerts.append("Extreme heat — prioritise cold-chain logistics immediately")
        elif temp > 28:
            alerts.append("High temperature — consider early dispatch or cooling measures")
        if temp < 5:
            alerts.append("Low temperature — protect cold-sensitive crops from frost")

        return jsonify({
            "location":    owm.get("name", city),
            "temperature": round(temp, 1),
            "feels_like":  round(owm["main"]["feels_like"], 1),
            "humidity":    humidity,
            "wind_speed":  owm["wind"]["speed"],
            "weather":     owm["weather"][0]["main"],
            "description": desc,
            "icon":        icon,
            "icon_url":    f"https://openweathermap.org/img/wn/{icon}@2x.png",
            "agri_alerts": alerts,
            "is_mock":     False,
            "timestamp":   datetime.utcnow().isoformat() + "Z",
        }), 200

    except requests.exceptions.Timeout:
        return jsonify({"error": "Weather API timeout. Try again."}), 504
    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"Weather API error: {e.response.status_code}"}), 502
    except Exception as e:
        logger.error(f"Weather error: {traceback.format_exc()}")
        return jsonify({"error": "Failed to fetch weather data", "detail": str(e)}), 500


# ── Error handlers ─────────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500


# ── Run ─────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port  = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    logger.info(f"🚀 AgriChain API starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)

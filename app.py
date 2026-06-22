import os
import pickle
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# ── Load model & encoders ────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "hospital_stay_model.pkl"), "rb") as f:
    model = pickle.load(f)

with open(os.path.join(BASE_DIR, "encoders.pkl"), "rb") as f:
    encoders = pickle.load(f)

# Feature order must match training order exactly
FEATURE_ORDER = [
    "Hospital_code",
    "Hospital_type_code",
    "City_Code_Hospital",
    "Hospital_region_code",
    "Available_Extra_Rooms_in_Hospital",
    "Department",
    "Ward_Type",
    "Ward_Facility_Code",
    "Bed_Grade",
    "City_Code_Patient",
    "Type_of_Admission",
    "Severity_of_Illness",
    "Visitors_with_Patient",
    "Age",
    "Admission_Deposit",
]

# Columns that are categorical (use pd.Categorical)
CAT_COLS = [
    "Hospital_type_code",
    "Hospital_region_code",
    "Department",
    "Ward_Type",
    "Ward_Facility_Code",
    "Type_of_Admission",
    "Severity_of_Illness",
    "Age",
]

# Class labels
CLASS_LABELS = {
    0: {"label": "Short Stay",  "range": "0–30 days",  "severity": "low"},
    1: {"label": "Medium Stay", "range": "31–70 days", "severity": "medium"},
    2: {"label": "Long Stay",   "range": "71+ days",   "severity": "high"},
}

# ── Hospital lookup table (derived from HealthCareAnalytics.csv) ─────────────
# Maps Hospital_code (int) → {type, city, region, extra_rooms, ward_type, ward_facility}
# Used for Simple Mode auto-fill and server-side fallback defaults.
HOSPITAL_LOOKUP = {
    1:  {"type":"d","city":10,"region":"Y","extra_rooms":3,"ward_type":"R","ward_facility":"B"},
    2:  {"type":"c","city":5, "region":"Z","extra_rooms":2,"ward_type":"S","ward_facility":"F"},
    3:  {"type":"c","city":3, "region":"Z","extra_rooms":3,"ward_type":"R","ward_facility":"A"},
    4:  {"type":"a","city":4, "region":"X","extra_rooms":3,"ward_type":"R","ward_facility":"F"},
    5:  {"type":"a","city":1, "region":"X","extra_rooms":3,"ward_type":"R","ward_facility":"E"},
    6:  {"type":"a","city":6, "region":"X","extra_rooms":3,"ward_type":"R","ward_facility":"F"},
    7:  {"type":"a","city":4, "region":"X","extra_rooms":3,"ward_type":"R","ward_facility":"F"},
    8:  {"type":"c","city":3, "region":"Z","extra_rooms":3,"ward_type":"R","ward_facility":"F"},
    9:  {"type":"d","city":5, "region":"Z","extra_rooms":3,"ward_type":"Q","ward_facility":"F"},
    10: {"type":"e","city":1, "region":"X","extra_rooms":3,"ward_type":"Q","ward_facility":"E"},
    11: {"type":"b","city":2, "region":"Y","extra_rooms":4,"ward_type":"Q","ward_facility":"D"},
    12: {"type":"a","city":9, "region":"Y","extra_rooms":3,"ward_type":"R","ward_facility":"B"},
    13: {"type":"a","city":5, "region":"Z","extra_rooms":3,"ward_type":"R","ward_facility":"F"},
    14: {"type":"a","city":1, "region":"X","extra_rooms":3,"ward_type":"Q","ward_facility":"E"},
    15: {"type":"c","city":5, "region":"Z","extra_rooms":3,"ward_type":"Q","ward_facility":"F"},
    16: {"type":"c","city":3, "region":"Z","extra_rooms":3,"ward_type":"S","ward_facility":"A"},
    17: {"type":"e","city":1, "region":"X","extra_rooms":3,"ward_type":"R","ward_facility":"E"},
    18: {"type":"d","city":13,"region":"Y","extra_rooms":3,"ward_type":"Q","ward_facility":"B"},
    19: {"type":"a","city":7, "region":"Y","extra_rooms":3,"ward_type":"Q","ward_facility":"C"},
    20: {"type":"b","city":2, "region":"Y","extra_rooms":2,"ward_type":"S","ward_facility":"D"},
    21: {"type":"c","city":3, "region":"Z","extra_rooms":3,"ward_type":"S","ward_facility":"A"},
    22: {"type":"g","city":9, "region":"Y","extra_rooms":3,"ward_type":"S","ward_facility":"B"},
    23: {"type":"a","city":6, "region":"X","extra_rooms":3,"ward_type":"Q","ward_facility":"F"},
    24: {"type":"a","city":1, "region":"X","extra_rooms":3,"ward_type":"R","ward_facility":"E"},
    25: {"type":"e","city":1, "region":"X","extra_rooms":3,"ward_type":"S","ward_facility":"E"},
    26: {"type":"b","city":2, "region":"Y","extra_rooms":3,"ward_type":"R","ward_facility":"D"},
    27: {"type":"a","city":7, "region":"Y","extra_rooms":3,"ward_type":"R","ward_facility":"C"},
    28: {"type":"b","city":11,"region":"X","extra_rooms":3,"ward_type":"R","ward_facility":"F"},
    29: {"type":"a","city":4, "region":"X","extra_rooms":3,"ward_type":"R","ward_facility":"F"},
    30: {"type":"c","city":3, "region":"Z","extra_rooms":3,"ward_type":"Q","ward_facility":"A"},
    31: {"type":"c","city":3, "region":"Z","extra_rooms":3,"ward_type":"R","ward_facility":"A"},
    32: {"type":"f","city":9, "region":"Y","extra_rooms":2,"ward_type":"S","ward_facility":"B"},
}

# ── Simple Mode global defaults (used when fields are absent in payload) ──────
# Simple Mode shows only 7 fields; remaining 8 are filled as follows:
#   Hospital_code              → 8  (mid-sized hospital from dataset)
#   Hospital_type_code         → auto-filled from HOSPITAL_LOOKUP[Hospital_code]
#   City_Code_Hospital         → auto-filled from HOSPITAL_LOOKUP[Hospital_code]
#   Hospital_region_code       → auto-filled from HOSPITAL_LOOKUP[Hospital_code]
#   Available_Extra_Rooms      → auto-filled from HOSPITAL_LOOKUP[Hospital_code]
#   Ward_Type                  → auto-filled from HOSPITAL_LOOKUP[Hospital_code]
#   Ward_Facility_Code         → auto-filled from HOSPITAL_LOOKUP[Hospital_code]
#   City_Code_Patient          → 7  (modal value from dataset)
SIMPLE_DEFAULTS = {
    "Hospital_code":                    8,
    "City_Code_Patient":                7,
}

# ── Readable label maps (sent to frontend for display) ───────────────────────
LABEL_MAPS = {
    "Hospital_type_code": {
        "a": "General Hospital",
        "b": "Multi-Specialty Hospital",
        "c": "Teaching / Research Hospital",
        "d": "Community Hospital",
        "e": "Specialty Clinic",
        "f": "District Hospital",
        "g": "Government Hospital",
    },
    "Hospital_region_code": {
        "X": "North Region",
        "Y": "Central Region",
        "Z": "South Region",
    },
    "Ward_Type": {
        "P": "Intensive Care Unit (ICU)",
        "Q": "Semi-Private Ward",
        "R": "General Ward",
        "S": "Special Care Ward",
        "T": "Observation Ward",
        "U": "Isolation Ward",
    },
    "Ward_Facility_Code": {
        "A": "Basic Facility",
        "B": "Standard Facility",
        "C": "Intermediate Facility",
        "D": "Advanced Facility",
        "E": "Premium Facility",
        "F": "Elite Facility",
    },
}


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the main HTML page with encoder options and label maps."""
    return render_template(
        "index.html",
        encoders=encoders,
        label_maps=LABEL_MAPS,
        hospital_lookup=HOSPITAL_LOOKUP,
    )


@app.route("/predict", methods=["POST"])
def predict():
    """Accept JSON form data, run XGBoost, return prediction.

    Supports both Simple Mode (partial payload → server fills defaults) and
    Advanced Mode (full 15-field payload).
    """
    try:
        data = request.get_json(force=True)

        # ── Apply Simple Mode server-side defaults ────────────────────────────
        # If Hospital_code is provided, auto-fill hospital-specific fields
        hosp_code = data.get("Hospital_code")
        if hosp_code is not None:
            try:
                hosp_code_int = int(hosp_code)
                if hosp_code_int in HOSPITAL_LOOKUP:
                    h = HOSPITAL_LOOKUP[hosp_code_int]
                    data.setdefault("Hospital_type_code",             h["type"])
                    data.setdefault("City_Code_Hospital",             h["city"])
                    data.setdefault("Hospital_region_code",           h["region"])
                    data.setdefault("Available_Extra_Rooms_in_Hospital", h["extra_rooms"])
                    data.setdefault("Ward_Type",                      h["ward_type"])
                    data.setdefault("Ward_Facility_Code",             h["ward_facility"])
            except (ValueError, TypeError):
                pass

        # Apply global simple defaults for anything still missing
        for k, v in SIMPLE_DEFAULTS.items():
            data.setdefault(k, v)

        # ── Validate: check all 15 features are now present ───────────────────
        missing = [f for f in FEATURE_ORDER if data.get(f) is None]
        if missing:
            return jsonify({"error": f"Missing required field(s): {', '.join(missing)}"}), 400

        # ── Validate categoricals ─────────────────────────────────────────────
        for col in CAT_COLS:
            val = data.get(col)
            if val and val not in encoders[col]:
                return jsonify({
                    "error": f"Invalid value '{val}' for {col}. "
                             f"Allowed: {encoders[col]}"
                }), 400

        # ── Build DataFrame ───────────────────────────────────────────────────
        row = {feature: [data[feature]] for feature in FEATURE_ORDER}
        df = pd.DataFrame(row)

        # Cast numeric columns
        numeric_cols = [c for c in FEATURE_ORDER if c not in CAT_COLS]
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        # Cast categorical columns using the saved encoder categories
        for col in CAT_COLS:
            cats = encoders[col]
            df[col] = pd.Categorical(df[col], categories=cats)

        # Ensure column order matches training
        df = df[FEATURE_ORDER]

        # ── Predict ───────────────────────────────────────────────────────────
        pred_class = int(model.predict(df)[0])
        proba = model.predict_proba(df)[0].tolist()

        result = CLASS_LABELS[pred_class]
        return jsonify({
            "prediction":    pred_class,
            "label":         result["label"],
            "range":         result["range"],
            "severity":      result["severity"],
            "probabilities": {
                "short":  round(proba[0] * 100, 2),
                "medium": round(proba[1] * 100, 2),
                "long":   round(proba[2] * 100, 2),
            },
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)

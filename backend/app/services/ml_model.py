# =============================================================
# app/services/ml_model.py  —  RANDOM FOREST ML MODEL LOADER
# =============================================================
# PURPOSE:
#   Loads the trained Random Forest model (.pkl file) and
#   provides a predict_score() function used by allocation_engine.
#
# PHASE 3 FILE — requires running ml/02_model_training.py first
#   to generate: backend/ml/models/allocation_model.pkl
#
# WHY RANDOM FOREST?
#   1. Handles non-linear relationships between features
#      (e.g. CGPA matters differently for ML vs Web Dev roles)
#   2. Gives feature importance scores — we can tell admin
#      "Skills contributed 45%, CGPA only 20% for this domain"
#   3. Resistant to overfitting on small datasets
#   4. No feature scaling needed (unlike SVM, Neural Networks)
#
# HOW TO EXPLAIN TO FACULTY:
#   "We first compute a formula-based score. Then we feed those
#    scores + raw features into a Random Forest trained on
#    historical match data. The forest gives a probability of
#    successful match. We blend 70% formula + 30% ML for the
#    final score. This hybrid approach is more robust than
#    either method alone."
# =============================================================

import os
import numpy as np

# ── Load model at import time (cached in memory) ──────────────
# This runs ONCE when the server starts, not on every API call
_model = None
_model_path = os.path.join(
    os.path.dirname(__file__),   # this file's directory
    "../../ml/models/allocation_model.pkl"
)


def _load_model():
    """Load the trained Random Forest model from disk."""
    global _model
    if _model is not None:
        return _model  # already loaded — return cached

    import joblib
    abs_path = os.path.abspath(_model_path)

    if not os.path.exists(abs_path):
        raise FileNotFoundError(
            f"ML model not found at {abs_path}. "
            "Run ml/02_model_training.py first to generate it."
        )

    _model = joblib.load(abs_path)
    print(f"[ML] Random Forest model loaded: {abs_path}")
    return _model


def predict_score(features: dict) -> float:
    """
    Predict the probability that a student-internship pair
    is a good match, using the trained Random Forest model.

    Args:
        features: dict with keys:
            skill_score, cgpa_score, location_score, domain_score,
            cgpa_raw, num_skills, num_req_skills, min_cgpa_req

    Returns:
        float between 0.0 and 1.0 (probability of good match)
    """
    model = _load_model()

    # Convert feature dict to numpy array (model expects this format)
    # ORDER MATTERS — must match the order used during training
    feature_order = [
        "skill_score",
        "cgpa_score",
        "location_score",
        "domain_score",
        "cgpa_raw",
        "num_skills",
        "num_req_skills",
        "min_cgpa_req",
    ]

    X = np.array([[features.get(k, 0.0) for k in feature_order]])

    # predict_proba returns [[prob_class_0, prob_class_1]]
    # Class 1 = "good match" — we want that probability
    prob = model.predict_proba(X)[0][1]
    return float(prob)


def get_feature_importance():
    """
    Returns feature importance scores from the trained model.
    Use this to show faculty WHICH FACTOR mattered most.

    Returns: list of (feature_name, importance_score) tuples
    """
    model = _load_model()

    feature_names = [
        "Skill Match",
        "CGPA Score",
        "Location Match",
        "Domain Match",
        "Raw CGPA",
        "Student Skill Count",
        "Required Skill Count",
        "Min CGPA Requirement",
    ]

    importances = model.feature_importances_  # from sklearn Random Forest
    pairs = list(zip(feature_names, importances))
    pairs.sort(key=lambda x: x[1], reverse=True)  # sort highest first

    return [{"feature": name, "importance": round(float(score), 4)}
            for name, score in pairs]

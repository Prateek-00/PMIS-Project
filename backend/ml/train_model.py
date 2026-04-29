# =============================================================
# ml/train_model.py  —  RANDOM FOREST MODEL TRAINING
# =============================================================
# PURPOSE:
#   Trains a Random Forest classifier on the generated training data
#   and saves the model as allocation_model.pkl
#
# HOW TO RUN (in order):
#   Step 1:  cd backend
#   Step 2:  python ml/generate_data.py        ← creates training_data.csv
#   Step 3:  python ml/train_model.py          ← trains & saves model
#
# After this, ml_model.py can load allocation_model.pkl
# =============================================================

import os
import sys
import pandas as pd
import numpy as np
import joblib

from sklearn.ensemble         import RandomForestClassifier
from sklearn.model_selection  import train_test_split, cross_val_score
from sklearn.metrics          import (accuracy_score, classification_report,
                                       confusion_matrix)

# ── Paths ─────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(__file__)
DATA_PATH  = os.path.join(BASE_DIR, "training_data.csv")
MODEL_DIR  = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "allocation_model.pkl")


def train():
    print("\n" + "="*55)
    print("  PMIS — Random Forest Model Training")
    print("="*55)

    # ── Step 1: Load data ─────────────────────────────────────
    if not os.path.exists(DATA_PATH):
        print(f"\n❌ training_data.csv not found at {DATA_PATH}")
        print("   Run this first:  python ml/generate_data.py")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH)
    print(f"\n[1/5] Loaded {len(df)} training samples from CSV")

    # ── Step 2: Prepare features & labels ────────────────────
    feature_cols = [
        "skill_score",
        "cgpa_score",
        "location_score",
        "domain_score",
        "cgpa_raw",
        "num_skills",
        "num_req_skills",
        "min_cgpa_req",
    ]

    X = df[feature_cols].values   # feature matrix
    y = df["label"].values        # target labels (0 or 1)

    print(f"[2/5] Features: {feature_cols}")
    print(f"      Samples: {len(X)}, Class distribution: {np.bincount(y)}")

    # ── Step 3: Train/test split ──────────────────────────────
    # 80% training, 20% testing — standard ML practice
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[3/5] Split: {len(X_train)} train / {len(X_test)} test")

    # ── Step 4: Train Random Forest ───────────────────────────
    print("[4/5] Training Random Forest...")

    model = RandomForestClassifier(
        n_estimators  = 100,    # number of decision trees
        max_depth     = 8,      # max depth of each tree (prevents overfitting)
        min_samples_split = 5,  # min samples to split a node
        random_state  = 42,     # for reproducibility
        n_jobs        = -1      # use all CPU cores
    )
    model.fit(X_train, y_train)

    # ── Step 5: Evaluate ──────────────────────────────────────
    print("[5/5] Evaluating model...\n")

    y_pred        = model.predict(X_test)
    test_accuracy = accuracy_score(y_test, y_pred)

    # Cross-validation (5-fold) — more reliable than single test split
    cv_scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")

    print(f"  Test Accuracy:           {test_accuracy*100:.2f}%")
    print(f"  Cross-Val Accuracy:      {cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%")
    print(f"\n  Classification Report:")
    print(classification_report(y_test, y_pred,
                                 target_names=["Bad Match (0)", "Good Match (1)"]))

    # Feature importance — great to show in presentation!
    print("  Feature Importances (for presentation):")
    importances = model.feature_importances_
    for feat, imp in sorted(zip(feature_cols, importances),
                             key=lambda x: x[1], reverse=True):
        bar = "█" * int(imp * 40)
        print(f"    {feat:<22} {bar} {imp*100:.1f}%")

    # ── Save model ────────────────────────────────────────────
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print(f"\n✅ Model saved to: {MODEL_PATH}")
    print(f"\n   Now restart the Flask server.")
    print(f"   The allocation engine will automatically use this model.")
    print("="*55 + "\n")

    return model, test_accuracy


if __name__ == "__main__":
    train()

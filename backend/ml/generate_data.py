# =============================================================
# ml/generate_data.py  —  TRAINING DATA GENERATOR
# =============================================================
# PURPOSE:
#   Creates synthetic training data for the Random Forest model.
#   Since we don't have real historical placement data yet,
#   we simulate it using the formula scores + known good/bad rules.
#
# HOW TO RUN:
#   cd backend
#   python ml/generate_data.py
#
# OUTPUT:
#   Creates: backend/ml/training_data.csv
# =============================================================

import pandas as pd
import numpy as np
import os
import sys

# Add backend to path so we can run this standalone
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


def generate_training_data(n_samples=1000, random_seed=42):
    """
    Generate n_samples rows of synthetic student-internship pair data.

    Each row represents one (student, internship) pair.
    The 'label' column = 1 if it's a good match, 0 if not.

    Label logic (simulates real-world placement success):
      - Good match: high skill overlap AND decent CGPA AND right domain
      - Bad match: low skills OR CGPA below minimum OR wrong location
    """
    np.random.seed(random_seed)

    data = []

    for _ in range(n_samples):
        # ── Raw feature generation ────────────────────────────
        skill_score    = np.random.beta(2, 2)    # bell-curve 0–1 (most around 0.5)
        cgpa_raw       = np.random.uniform(4.0, 10.0)
        min_cgpa_req   = np.random.choice([5.5, 6.0, 6.5, 7.0, 7.5])
        num_skills     = np.random.randint(1, 8)
        num_req_skills = np.random.randint(1, 6)

        # Compute derived scores (same logic as scoring.py)
        cgpa_score     = min(1.0, cgpa_raw / 10.0) if cgpa_raw >= min_cgpa_req else max(0.0, cgpa_raw / 10.0 * 0.5)
        location_score = float(np.random.choice([0.0, 0.5, 1.0], p=[0.3, 0.2, 0.5]))
        domain_score   = float(np.random.choice([0.0, 0.3, 0.6, 1.0], p=[0.2, 0.2, 0.3, 0.3]))

        # ── Generate label ────────────────────────────────────
        # Good match = combination of strong factors
        # Adds some noise to simulate real-world uncertainty
        score = (
            skill_score    * 0.40 +
            cgpa_score     * 0.25 +
            location_score * 0.20 +
            domain_score   * 0.15
        )

        # Add noise (5% random label flips = real-world imperfection)
        noise = np.random.uniform(-0.08, 0.08)
        label = 1 if (score + noise) >= 0.55 else 0

        data.append({
            "skill_score":       round(skill_score, 4),
            "cgpa_score":        round(cgpa_score, 4),
            "location_score":    round(location_score, 4),
            "domain_score":      round(domain_score, 4),
            "cgpa_raw":          round(cgpa_raw, 2),
            "num_skills":        num_skills,
            "num_req_skills":    num_req_skills,
            "min_cgpa_req":      min_cgpa_req,
            "label":             label   # 0 = bad match, 1 = good match
        })

    df = pd.DataFrame(data)

    # ── Save to CSV ───────────────────────────────────────────
    output_path = os.path.join(os.path.dirname(__file__), "training_data.csv")
    df.to_csv(output_path, index=False)

    # ── Summary ───────────────────────────────────────────────
    print(f"\n✅ Generated {n_samples} training samples")
    print(f"   Saved to: {output_path}")
    print(f"\n   Label distribution:")
    print(f"     Good matches (1): {df['label'].sum()} ({df['label'].mean()*100:.1f}%)")
    print(f"     Bad  matches (0): {(df['label']==0).sum()} ({(1-df['label'].mean())*100:.1f}%)")
    print(f"\n   Sample data (first 3 rows):")
    print(df.head(3).to_string(index=False))

    return df


if __name__ == "__main__":
    generate_training_data(n_samples=1000)

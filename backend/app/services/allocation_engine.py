# =============================================================
# app/services/allocation_engine.py  —  GREEDY MATCHING ENGINE
# =============================================================
# PURPOSE:
#   This is the BRAIN of PMIS. Called by admin when they click
#   "Run AI Allocation". It:
#   1. Fetches all students + all internships from DB
#   2. Scores every student-internship pair (O(n²) combinations)
#   3. Uses greedy algorithm to assign best matches
#   4. Optionally uses Random Forest ML model to boost scores (Phase 3)
#   5. Saves results to Allocation table
#
# ALGORITHM: Greedy Matching
#   - Sort all pairs by score (highest first)
#   - Assign greedily: pick the best pair, mark both as assigned
#     (respects internship openings — multiple students per slot)
#   - Time complexity: O(n²) scoring + O(n log n) sorting
# =============================================================

from app import db
from app.models.user       import User, StudentProfile
from app.models.internship import Internship
from app.models.allocation import Allocation
from app.services.scoring  import compute_score


def run_allocation_engine():
    """
    Main function: runs the full AI allocation.
    Called from routes/admin.py when admin triggers the engine.

    Returns: list of Allocation objects saved to DB
    """

    # ── Step 1: Fetch all data ────────────────────────────────
    students    = User.query.filter_by(role="student").all()
    internships = Internship.query.filter_by(is_active=True).all()

    if not students or not internships:
        return []  # nothing to allocate

    # ── Step 2: Try to load ML model (Phase 3) ────────────────
    ml_available = False
    try:
        from app.services.ml_model import predict_score
        ml_available = True
    except Exception:
        # ML model not trained yet — that's fine, use formula only
        pass

    # ── Step 3: Score ALL pairs ───────────────────────────────
    # This is the O(n²) step: every student × every internship
    all_pairs = []  # list of (student, internship, score_dict)

    for student in students:
        profile = student.student_profile
        if not profile:
            continue  # skip students without profiles

        for internship in internships:
            # Base formula score
            scores = compute_score(profile, internship)

            # Optional ML boost (Phase 3)
            ml_boost = 0.0
            if ml_available:
                try:
                    features = _build_feature_vector(profile, internship, scores)
                    ml_boost = predict_score(features)
                    # Blend: 70% formula + 30% ML model
                    scores["total"] = round(scores["total"] * 0.70 + ml_boost * 0.30, 4)
                    scores["ml"]    = ml_boost
                except Exception:
                    pass  # ML failed for this pair — use formula only

            all_pairs.append((student, internship, scores))

    # ── Step 4: Sort all pairs by total score (best first) ────
    all_pairs.sort(key=lambda x: x[2]["total"], reverse=True)

    # ── Step 5: Greedy Assignment ─────────────────────────────
    # Track how many slots remain per internship
    remaining_slots = {i.id: i.openings for i in internships}
    assigned_students = set()  # each student gets max 1 internship
    results = []

    for student, internship, scores in all_pairs:
        # Skip if student already matched
        if student.id in assigned_students:
            continue

        # Skip if internship has no more openings
        if remaining_slots.get(internship.id, 0) <= 0:
            continue

        # ── Create allocation record ──────────────────────────
        allocation = Allocation(
            student_id     = student.id,
            internship_id  = internship.id,
            total_score    = scores["total"],
            skill_score    = scores.get("skill", 0),
            cgpa_score     = scores.get("cgpa", 0),
            location_score = scores.get("location", 0),
            domain_score   = scores.get("domain", 0),
            ml_score       = scores.get("ml", 0),
            status         = "allocated"
        )
        db.session.add(allocation)

        # Mark student as assigned, decrement internship slots
        assigned_students.add(student.id)
        remaining_slots[internship.id] -= 1
        results.append(allocation)

    db.session.commit()
    return results


def _build_feature_vector(profile, internship, base_scores):
    """
    Converts a student-internship pair into a flat feature vector
    that the Random Forest model can understand.

    This is what gets fed into predict_score().
    """
    return {
        "skill_score":      base_scores.get("skill", 0),
        "cgpa_score":       base_scores.get("cgpa", 0),
        "location_score":   base_scores.get("location", 0),
        "domain_score":     base_scores.get("domain", 0),
        "cgpa_raw":         profile.cgpa or 0.0,
        "num_skills":       len(profile.skills) if profile.skills else 0,
        "num_req_skills":   len(internship.required_skills) if internship.required_skills else 0,
        "min_cgpa_req":     internship.min_cgpa or 0.0,
    }

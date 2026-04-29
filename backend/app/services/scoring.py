# =============================================================
# app/services/scoring.py  —  AI SCORING FORMULA
# =============================================================
# PURPOSE:
#   Given one student profile + one internship listing,
#   compute a compatibility score between 0.0 and 1.0.
#
# FORMULA:
#   Score = (Skill Match × 0.40)
#         + (CGPA Score  × 0.25)
#         + (Location    × 0.20)
#         + (Domain      × 0.15)
#
# WHY THESE WEIGHTS?
#   Skills are the most important (40%) — a Python intern role
#   needs Python skills above all else.
#   CGPA matters but isn't everything (25%).
#   Location affects acceptance rates (20%).
#   Domain alignment matters for learning fit (15%).
#
# THIS FILE IS PURE MATH — no DB calls, no Flask stuff.
# Easy to test in isolation.
# =============================================================


def compute_score(student_profile, internship):
    """
    Compute compatibility score between a student and an internship.

    Args:
        student_profile: StudentProfile DB model instance
        internship:      Internship DB model instance

    Returns:
        dict with individual component scores + weighted total
        Example: {
            "skill": 0.75, "cgpa": 0.85, "location": 1.0, "domain": 0.5,
            "total": 0.7775
        }
    """
    skill_score    = _skill_match(student_profile, internship)
    cgpa_score     = _cgpa_score(student_profile, internship)
    location_score = _location_match(student_profile, internship)
    domain_score   = _domain_match(student_profile, internship)

    # Weighted combination
    total = (
        skill_score    * 0.40 +
        cgpa_score     * 0.25 +
        location_score * 0.20 +
        domain_score   * 0.15
    )

    return {
        "skill":    round(skill_score, 4),
        "cgpa":     round(cgpa_score, 4),
        "location": round(location_score, 4),
        "domain":   round(domain_score, 4),
        "total":    round(total, 4)
    }


# ── COMPONENT 1: SKILL MATCH (weight 0.40) ───────────────────
def _skill_match(profile, internship):
    """
    Jaccard similarity between student skills and required skills.

    Jaccard = |Intersection| / |Union|
    Example:
      Student skills:  {Python, ML, SQL}       → set A
      Required skills: {Python, ML, TensorFlow} → set B
      Intersection: {Python, ML} → size 2
      Union: {Python, ML, SQL, TensorFlow} → size 4
      Score = 2/4 = 0.5

    Returns: float 0.0–1.0
    """
    student_skill_ids  = {s.id for s in profile.skills}         if profile.skills else set()
    required_skill_ids = {s.id for s in internship.required_skills} if internship.required_skills else set()

    # No required skills = any student qualifies
    if not required_skill_ids:
        return 0.5  # neutral score

    # No student skills = zero match
    if not student_skill_ids:
        return 0.0

    intersection = student_skill_ids & required_skill_ids  # set AND
    union        = student_skill_ids | required_skill_ids  # set OR

    return len(intersection) / len(union)


# ── COMPONENT 2: CGPA SCORE (weight 0.25) ────────────────────
def _cgpa_score(profile, internship):
    """
    Scores CGPA relative to the internship's minimum requirement.

    Logic:
      - If student CGPA < min_cgpa required → penalty applied
      - If CGPA meets or exceeds requirement → score scales up to 1.0
      - Perfect score = CGPA of 10.0

    Returns: float 0.0–1.0
    """
    student_cgpa = profile.cgpa or 0.0
    min_required = internship.min_cgpa or 0.0

    # Student doesn't meet minimum
    if student_cgpa < min_required:
        # Partial score — don't completely zero out, just penalize
        return max(0.0, student_cgpa / 10.0 * 0.5)

    # Normalize to 0–1 scale (CGPA is 0–10)
    return min(1.0, student_cgpa / 10.0)


# ── COMPONENT 3: LOCATION MATCH (weight 0.20) ────────────────
def _location_match(profile, internship):
    """
    Checks if student's preferred location matches internship location.

    Returns:
      1.0  — exact match OR internship is "Remote"
      0.5  — partial match (e.g. both have "Delhi" somewhere)
      0.0  — no match
    """
    student_loc = (profile.preferred_location or "").lower().strip()
    intern_loc  = (internship.location or "").lower().strip()

    # Remote internships match everyone
    if intern_loc in ["remote", "work from home", "wfh"]:
        return 1.0

    # Exact match
    if student_loc == intern_loc:
        return 1.0

    # Partial match (one contains the other)
    if student_loc and intern_loc:
        if student_loc in intern_loc or intern_loc in student_loc:
            return 0.5

    return 0.0


# ── COMPONENT 4: DOMAIN MATCH (weight 0.15) ──────────────────
def _domain_match(profile, internship):
    """
    Checks if student's preferred domain matches internship domain.

    Returns:
      1.0  — exact match
      0.5  — partial match (e.g. "ML" vs "Machine Learning")
      0.0  — no match
    """
    student_domain = (profile.preferred_domain or "").lower().strip()
    intern_domain  = (internship.domain or "").lower().strip()

    if not student_domain or not intern_domain:
        return 0.3  # unknown domain = neutral score

    if student_domain == intern_domain:
        return 1.0

    # Check partial overlap (handles abbreviations and variations)
    # e.g. "ml" matches "machine learning", "web" matches "web development"
    student_words = set(student_domain.split())
    intern_words  = set(intern_domain.split())
    overlap       = student_words & intern_words

    if overlap:
        return 0.6  # partial keyword match

    return 0.0

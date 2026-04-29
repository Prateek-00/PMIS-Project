# =============================================================
# app/routes/student.py  —  STUDENT API ENDPOINTS
# =============================================================
# Endpoints:
#   GET  /api/student/profile               — view my profile
#   PUT  /api/student/profile               — update my profile & skills
#   GET  /api/student/internships           — see all active listings
#   GET  /api/student/recommendations       — AI-sorted recommendations
#   POST /api/student/apply/<internship_id> — apply to an internship
#   GET  /api/student/allocation            — see my allocation result
# =============================================================

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app import db
from app.models.user        import User, StudentProfile
from app.models.internship  import Internship
from app.models.skill       import Skill
from app.models.allocation  import Allocation
from app.services.scoring   import compute_score

student_bp = Blueprint("student", __name__)


def require_student(fn):
    """
    Decorator: blocks non-students from accessing student routes.
    Usage: @require_student on any route function.
    """
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "student":
            return jsonify({"error": "Students only"}), 403
        return fn(*args, **kwargs)
    return wrapper


# ── VIEW PROFILE ─────────────────────────────────────────────
@student_bp.route("/profile", methods=["GET"])
@jwt_required()
@require_student
def get_profile():
    """Returns the student's profile with their skills."""
    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    profile = user.student_profile

    return jsonify({
        "name":    user.name,
        "email":   user.email,
        "profile": profile.to_dict() if profile else {}
    }), 200


# ── UPDATE PROFILE ───────────────────────────────────────────
@student_bp.route("/profile", methods=["PUT"])
@jwt_required()
@require_student
def update_profile():
    """
    Update student profile.
    Body: { cgpa, branch, year, preferred_domain, preferred_location, skill_ids: [1,2,3] }
    """
    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    profile = user.student_profile
    data    = request.get_json()

    # Update basic profile fields
    if "cgpa"                in data: profile.cgpa                = float(data["cgpa"])
    if "branch"              in data: profile.branch              = data["branch"]
    if "year"                in data: profile.year                = int(data["year"])
    if "preferred_domain"    in data: profile.preferred_domain    = data["preferred_domain"]
    if "preferred_location"  in data: profile.preferred_location  = data["preferred_location"]
    if "phone"               in data: profile.phone               = data["phone"]

    # Update skills: replace entire list with submitted skill IDs
    if "skill_ids" in data:
        skills = Skill.query.filter(Skill.id.in_(data["skill_ids"])).all()
        profile.skills = skills  # SQLAlchemy handles the junction table automatically

    db.session.commit()
    return jsonify({"message": "Profile updated", "profile": profile.to_dict()}), 200


# ── ALL ACTIVE INTERNSHIPS ────────────────────────────────────
@student_bp.route("/internships", methods=["GET"])
@jwt_required()
@require_student
def get_internships():
    """Returns all active internship listings."""
    internships = Internship.query.filter_by(is_active=True).all()
    return jsonify([i.to_dict() for i in internships]), 200


# ── AI RECOMMENDATIONS ────────────────────────────────────────
@student_bp.route("/recommendations", methods=["GET"])
@jwt_required()
@require_student
def get_recommendations():
    """
    Returns internships sorted by AI match score (highest first).
    This uses the SAME scoring formula as the allocation engine.
    Each internship includes a match_score field (0–100).
    """
    user_id     = int(get_jwt_identity())
    user        = User.query.get(user_id)
    profile     = user.student_profile
    internships = Internship.query.filter_by(is_active=True).all()

    # Score every internship against this student
    results = []
    for internship in internships:
        score_breakdown = compute_score(profile, internship)
        item = internship.to_dict()
        item["match_score"]    = round(score_breakdown["total"] * 100, 1)
        item["score_breakdown"] = {
            k: round(v * 100, 1) for k, v in score_breakdown.items()
        }
        results.append(item)

    # Sort by match score — highest first
    results.sort(key=lambda x: x["match_score"], reverse=True)

    return jsonify(results), 200


# ── APPLY TO INTERNSHIP ───────────────────────────────────────
@student_bp.route("/apply/<int:internship_id>", methods=["POST"])
@jwt_required()
@require_student
def apply(internship_id):
    """Student applies to an internship (marks interest)."""
    user_id    = int(get_jwt_identity())
    internship = Internship.query.get(internship_id)

    if not internship or not internship.is_active:
        return jsonify({"error": "Internship not found or closed"}), 404

    # Check if already applied (already allocated to this)
    existing = Allocation.query.filter_by(
        student_id=user_id, internship_id=internship_id
    ).first()
    if existing:
        return jsonify({"message": "Already applied"}), 200

    return jsonify({"message": f"Applied to '{internship.title}' successfully"}), 200


# ── MY ALLOCATION RESULT ──────────────────────────────────────
@student_bp.route("/allocation", methods=["GET"])
@jwt_required()
@require_student
def my_allocation():
    """
    Returns the student's allocation result after the admin runs the engine.
    Shows which internship they were matched to and the score breakdown.
    """
    user_id    = int(get_jwt_identity())
    allocation = Allocation.query.filter_by(student_id=user_id).order_by(
        Allocation.allocated_at.desc()
    ).first()

    if not allocation:
        return jsonify({"message": "No allocation yet. Ask admin to run the AI engine."}), 200

    return jsonify(allocation.to_dict()), 200

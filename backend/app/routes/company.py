# =============================================================
# app/routes/company.py  —  COMPANY API ENDPOINTS
# =============================================================
# Endpoints:
#   POST /api/company/listings           — post a new internship
#   GET  /api/company/listings           — view my listings
#   PUT  /api/company/listings/<id>      — edit a listing
#   DELETE /api/company/listings/<id>    — remove a listing
#   GET  /api/company/applicants/<id>    — who applied / was matched
# =============================================================

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app import db
from app.models.user       import User
from app.models.internship import Internship
from app.models.skill      import Skill
from app.models.allocation import Allocation

company_bp = Blueprint("company", __name__)


def require_company(fn):
    """Decorator: blocks non-companies from accessing these routes."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "company":
            return jsonify({"error": "Companies only"}), 403
        return fn(*args, **kwargs)
    return wrapper


# ── POST NEW INTERNSHIP ───────────────────────────────────────
@company_bp.route("/listings", methods=["POST"])
@jwt_required()
@require_company
def post_listing():
    """
    Company posts a new internship listing.
    Body: {
      title, description, domain, location,
      min_cgpa, stipend, duration, openings,
      skill_ids: [1, 3, 5]
    }
    """
    user_id = int(get_jwt_identity())
    data    = request.get_json()

    if not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    internship = Internship(
        title       = data["title"],
        description = data.get("description", ""),
        company_id  = user_id,
        domain      = data.get("domain", ""),
        location    = data.get("location", ""),
        min_cgpa    = float(data.get("min_cgpa", 0)),
        stipend     = int(data.get("stipend", 0)),
        duration    = data.get("duration", ""),
        openings    = int(data.get("openings", 1))
    )

    # Attach required skills
    if data.get("skill_ids"):
        skills = Skill.query.filter(Skill.id.in_(data["skill_ids"])).all()
        internship.required_skills = skills

    db.session.add(internship)
    db.session.commit()

    return jsonify({
        "message":    "Internship posted successfully",
        "internship": internship.to_dict()
    }), 201


# ── VIEW MY LISTINGS ─────────────────────────────────────────
@company_bp.route("/listings", methods=["GET"])
@jwt_required()
@require_company
def my_listings():
    """Returns all internships posted by this company."""
    user_id     = int(get_jwt_identity())
    internships = Internship.query.filter_by(company_id=user_id).all()
    return jsonify([i.to_dict() for i in internships]), 200


# ── EDIT LISTING ─────────────────────────────────────────────
@company_bp.route("/listings/<int:internship_id>", methods=["PUT"])
@jwt_required()
@require_company
def edit_listing(internship_id):
    """Update an existing listing."""
    user_id    = int(get_jwt_identity())
    internship = Internship.query.get(internship_id)

    if not internship or internship.company_id != user_id:
        return jsonify({"error": "Listing not found"}), 404

    data = request.get_json()
    if "title"       in data: internship.title    = data["title"]
    if "description" in data: internship.description = data["description"]
    if "domain"      in data: internship.domain   = data["domain"]
    if "location"    in data: internship.location = data["location"]
    if "min_cgpa"    in data: internship.min_cgpa = float(data["min_cgpa"])
    if "stipend"     in data: internship.stipend  = int(data["stipend"])
    if "openings"    in data: internship.openings = int(data["openings"])
    if "is_active"   in data: internship.is_active= bool(data["is_active"])

    if "skill_ids" in data:
        skills = Skill.query.filter(Skill.id.in_(data["skill_ids"])).all()
        internship.required_skills = skills

    db.session.commit()
    return jsonify({"message": "Updated", "internship": internship.to_dict()}), 200


# ── DELETE LISTING ────────────────────────────────────────────
@company_bp.route("/listings/<int:internship_id>", methods=["DELETE"])
@jwt_required()
@require_company
def delete_listing(internship_id):
    """Deactivate (soft delete) a listing."""
    user_id    = int(get_jwt_identity())
    internship = Internship.query.get(internship_id)

    if not internship or internship.company_id != user_id:
        return jsonify({"error": "Listing not found"}), 404

    internship.is_active = False  # soft delete — keep data, just hide it
    db.session.commit()
    return jsonify({"message": "Listing deactivated"}), 200


# ── VIEW APPLICANTS / ALLOCATIONS ────────────────────────────
@company_bp.route("/applicants/<int:internship_id>", methods=["GET"])
@jwt_required()
@require_company
def get_applicants(internship_id):
    """
    Returns all students allocated to a specific internship listing.
    Shows their name, email, CGPA, and match score.
    """
    user_id    = int(get_jwt_identity())
    internship = Internship.query.get(internship_id)

    if not internship or internship.company_id != user_id:
        return jsonify({"error": "Listing not found"}), 404

    allocations = Allocation.query.filter_by(internship_id=internship_id).all()

    result = []
    for a in allocations:
        student = a.student
        profile = student.student_profile
        result.append({
            "student_name":  student.name,
            "student_email": student.email,
            "cgpa":          profile.cgpa if profile else "-",
            "match_score":   round(a.total_score * 100, 1),
            "status":        a.status
        })

    return jsonify({
        "internship": internship.title,
        "total":      len(result),
        "applicants": result
    }), 200

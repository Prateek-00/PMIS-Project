# =============================================================
# app/routes/admin.py  —  ADMIN API ENDPOINTS
# =============================================================
# Endpoints:
#   POST /api/admin/seed-skills          — populate skill tag table
#   POST /api/admin/seed-demo-data       — create demo users for showcase
#   POST /api/admin/run-allocation       — TRIGGER AI MATCHING ENGINE
#   GET  /api/admin/allocations          — view all allocation results
#   GET  /api/admin/analytics            — dashboard numbers
#   GET  /api/admin/students             — list all students
#   GET  /api/admin/internships          — list all internships
# =============================================================

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import time

from app import db
from app.models.user       import User, StudentProfile
from app.models.internship import Internship
from app.models.skill      import Skill
from app.models.allocation import Allocation
from app.services.allocation_engine import run_allocation_engine

admin_bp = Blueprint("admin", __name__)


def require_admin(fn):
    """Decorator: blocks non-admins from accessing admin routes."""
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"error": "Admins only"}), 403
        return fn(*args, **kwargs)
    return wrapper


# ── SEED SKILLS ───────────────────────────────────────────────
@admin_bp.route("/seed-skills", methods=["POST"])
@jwt_required()
@require_admin
def seed_skills():
    """
    Populates the skill table with preset skill tags.
    Run this ONCE after setting up the database.
    """
    skills_data = [
        # Programming Languages
        {"name": "Python",       "category": "Programming"},
        {"name": "Java",         "category": "Programming"},
        {"name": "JavaScript",   "category": "Programming"},
        {"name": "C++",          "category": "Programming"},
        {"name": "SQL",          "category": "Programming"},
        # Data Science & ML
        {"name": "Machine Learning",  "category": "Data Science"},
        {"name": "Deep Learning",     "category": "Data Science"},
        {"name": "Data Analysis",     "category": "Data Science"},
        {"name": "TensorFlow",        "category": "Data Science"},
        {"name": "Scikit-learn",      "category": "Data Science"},
        {"name": "Pandas",            "category": "Data Science"},
        # Web Development
        {"name": "React",         "category": "Web Dev"},
        {"name": "Node.js",       "category": "Web Dev"},
        {"name": "Flask",         "category": "Web Dev"},
        {"name": "Django",        "category": "Web Dev"},
        {"name": "HTML/CSS",      "category": "Web Dev"},
        # Tools
        {"name": "Git",           "category": "Tools"},
        {"name": "Docker",        "category": "Tools"},
        {"name": "Linux",         "category": "Tools"},
        {"name": "Excel",         "category": "Tools"},
    ]

    added = 0
    for item in skills_data:
        if not Skill.query.filter_by(name=item["name"]).first():
            db.session.add(Skill(**item))
            added += 1

    db.session.commit()
    return jsonify({"message": f"Seeded {added} skills", "total": Skill.query.count()}), 200


# ── SEED DEMO DATA ────────────────────────────────────────────
@admin_bp.route("/seed-demo-data", methods=["POST"])
@jwt_required()
@require_admin
def seed_demo_data():
    """
    Creates 3 demo students + 2 demo companies + 3 demo internships.
    Run this for the college demo — gives you data to show the AI working.
    """
    import bcrypt

    def hash_pw(pw):
        return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

    # Helper: get or create user
    def get_or_create_user(email, **kwargs):
        u = User.query.filter_by(email=email).first()
        if not u:
            u = User(email=email, **kwargs)
            db.session.add(u)
            db.session.flush()
        return u

    # ── Companies ────────────────────────────────────────────
    c1 = get_or_create_user("techcorp@demo.com",
        name="TechCorp India", role="company",
        password_hash=hash_pw("demo123"))
    c2 = get_or_create_user("datawave@demo.com",
        name="DataWave Solutions", role="company",
        password_hash=hash_pw("demo123"))

    db.session.flush()

    # ── Internships ──────────────────────────────────────────
    py_skill = Skill.query.filter_by(name="Python").first()
    ml_skill = Skill.query.filter_by(name="Machine Learning").first()
    react_skill = Skill.query.filter_by(name="React").first()
    js_skill = Skill.query.filter_by(name="JavaScript").first()

    if not Internship.query.filter_by(title="ML Engineer Intern").first():
        i1 = Internship(title="ML Engineer Intern", company_id=c1.id,
                        domain="Machine Learning", location="Delhi",
                        min_cgpa=7.0, stipend=15000, duration="3 months", openings=2)
        if py_skill:  i1.required_skills.append(py_skill)
        if ml_skill:  i1.required_skills.append(ml_skill)
        db.session.add(i1)

    if not Internship.query.filter_by(title="Frontend React Developer Intern").first():
        i2 = Internship(title="Frontend React Developer Intern", company_id=c1.id,
                        domain="Web Development", location="Remote",
                        min_cgpa=6.0, stipend=10000, duration="2 months", openings=3)
        if react_skill: i2.required_skills.append(react_skill)
        if js_skill:    i2.required_skills.append(js_skill)
        db.session.add(i2)

    if not Internship.query.filter_by(title="Data Analyst Intern").first():
        i3 = Internship(title="Data Analyst Intern", company_id=c2.id,
                        domain="Data Science", location="Bangalore",
                        min_cgpa=6.5, stipend=12000, duration="3 months", openings=2)
        if py_skill:   i3.required_skills.append(py_skill)
        db.session.add(i3)

    # ── Students ─────────────────────────────────────────────
    # Student 1: Perfect ML match
    s1 = get_or_create_user("alice@demo.com",
        name="Alice Sharma", role="student",
        password_hash=hash_pw("demo123"))
    if not s1.student_profile:
        p1 = StudentProfile(user_id=s1.id, cgpa=8.5, branch="Computer Science",
                            year=3, preferred_domain="Machine Learning",
                            preferred_location="Delhi")
        if py_skill: p1.skills.append(py_skill)
        if ml_skill: p1.skills.append(ml_skill)
        db.session.add(p1)

    # Student 2: Partial match
    s2 = get_or_create_user("bob@demo.com",
        name="Bob Kumar", role="student",
        password_hash=hash_pw("demo123"))
    if not s2.student_profile:
        p2 = StudentProfile(user_id=s2.id, cgpa=7.0, branch="Information Technology",
                            year=3, preferred_domain="Web Development",
                            preferred_location="Remote")
        if js_skill:    p2.skills.append(js_skill)
        if react_skill: p2.skills.append(react_skill)
        db.session.add(p2)

    # Student 3: Poor match (low CGPA, wrong domain)
    s3 = get_or_create_user("charlie@demo.com",
        name="Charlie Singh", role="student",
        password_hash=hash_pw("demo123"))
    if not s3.student_profile:
        p3 = StudentProfile(user_id=s3.id, cgpa=5.5, branch="Electronics",
                            year=2, preferred_domain="Hardware",
                            preferred_location="Kolkata")
        db.session.add(p3)

    db.session.commit()

    return jsonify({
        "message": "Demo data seeded!",
        "accounts": {
            "admin":    "admin@pmis.com / admin123",
            "students": ["alice@demo.com / demo123", "bob@demo.com / demo123", "charlie@demo.com / demo123"],
            "companies": ["techcorp@demo.com / demo123", "datawave@demo.com / demo123"]
        }
    }), 200


# ── RUN AI ALLOCATION ENGINE ──────────────────────────────────
@admin_bp.route("/run-allocation", methods=["POST"])
@jwt_required()
@require_admin
def run_allocation():
    """
    MAIN DEMO ENDPOINT — Triggers the AI matching engine.
    Clears previous allocations, re-runs the greedy algorithm,
    saves results to DB, and returns them.

    THIS IS THE BUTTON THAT IMPRESSES FACULTY.
    """
    start_time = time.time()

    # Clear previous allocation results
    Allocation.query.delete()
    db.session.commit()

    # Run the allocation engine (see services/allocation_engine.py)
    results = run_allocation_engine()

    elapsed = round(time.time() - start_time, 3)

    return jsonify({
        "message":      f"AI Allocation completed in {elapsed}s",
        "total_matched": len(results),
        "time_taken":   f"{elapsed} seconds",
        "allocations":  [a.to_dict() for a in results]
    }), 200


# ── VIEW ALL ALLOCATIONS ─────────────────────────────────────
@admin_bp.route("/allocations", methods=["GET"])
@jwt_required()
@require_admin
def get_allocations():
    """Returns all allocation results in the database."""
    allocations = Allocation.query.order_by(Allocation.total_score.desc()).all()
    return jsonify([a.to_dict() for a in allocations]), 200


# ── ANALYTICS ────────────────────────────────────────────────
@admin_bp.route("/analytics", methods=["GET"])
@jwt_required()
@require_admin
def analytics():
    """Dashboard numbers for the admin panel."""
    return jsonify({
        "total_students":    User.query.filter_by(role="student").count(),
        "total_companies":   User.query.filter_by(role="company").count(),
        "total_internships": Internship.query.filter_by(is_active=True).count(),
        "total_allocations": Allocation.query.count(),
        "total_skills":      Skill.query.count(),
    }), 200


# ── LIST ALL STUDENTS ─────────────────────────────────────────
@admin_bp.route("/students", methods=["GET"])
@jwt_required()
@require_admin
def get_students():
    """Returns all students with their profiles."""
    students = User.query.filter_by(role="student").all()
    result = []
    for s in students:
        item = s.to_dict()
        if s.student_profile:
            item["profile"] = s.student_profile.to_dict()
        result.append(item)
    return jsonify(result), 200


# ── LIST ALL INTERNSHIPS ──────────────────────────────────────
@admin_bp.route("/internships", methods=["GET"])
@jwt_required()
@require_admin
def get_internships():
    """Returns all internships (active and inactive)."""
    internships = Internship.query.all()
    return jsonify([i.to_dict() for i in internships]), 200

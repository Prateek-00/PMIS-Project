# =============================================================
# app/models/user.py  —  USER + STUDENT PROFILE TABLES
# =============================================================
# Two tables:
#   1. User        — email, password hash, role (student/company/admin)
#   2. StudentProfile — CGPA, domain preference, location, skills
#
# WHY TWO TABLES?
#   Not all users are students. Companies and admins don't have CGPA.
#   Separating keeps things clean and normalized.
# =============================================================

from datetime import datetime
from app import db
from app.models.skill import student_skills


class User(db.Model):
    """
    Core authentication table. Every person who logs in is here.
    Role determines which dashboard they see.
    """
    __tablename__ = "user"

    id           = db.Column(db.Integer, primary_key=True)
    email        = db.Column(db.String(120), unique=True, nullable=False)
    password_hash= db.Column(db.String(255), nullable=False)  # bcrypt hash, never plain text
    role         = db.Column(db.String(20),  nullable=False)  # "student", "company", "admin"
    name         = db.Column(db.String(100), nullable=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    # ── Relationships ────────────────────────────────────────
    # One-to-one link to StudentProfile (only for role="student")
    student_profile = db.relationship("StudentProfile", backref="user",
                                      uselist=False, cascade="all, delete-orphan")

    # Internships posted by this user (only for role="company")
    internships = db.relationship("Internship", backref="company", lazy=True)

    def to_dict(self):
        return {
            "id":    self.id,
            "email": self.email,
            "name":  self.name,
            "role":  self.role
        }

    def __repr__(self):
        return f"<User {self.email} [{self.role}]>"


class StudentProfile(db.Model):
    """
    Extended profile for students.
    Contains everything the AI scoring engine needs for matching.
    """
    __tablename__ = "student_profile"

    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=True)

    # ── Fields used by scoring formula ───────────────────────
    cgpa          = db.Column(db.Float, default=0.0)          # 0.0 – 10.0
    branch        = db.Column(db.String(100))                  # "Computer Science"
    year          = db.Column(db.Integer)                      # 2, 3, 4
    preferred_domain = db.Column(db.String(100))               # "Machine Learning", "Web Dev"
    preferred_location = db.Column(db.String(100))             # "Delhi", "Remote"
    phone         = db.Column(db.String(15))
    resume_url    = db.Column(db.String(300))                  # link to uploaded resume

    # ── Skills (many-to-many via student_skills table) ───────
    skills = db.relationship("Skill", secondary=student_skills,
                              backref=db.backref("students", lazy="dynamic"))

    def to_dict(self):
        return {
            "cgpa":               self.cgpa,
            "branch":             self.branch,
            "year":               self.year,
            "preferred_domain":   self.preferred_domain,
            "preferred_location": self.preferred_location,
            "skills":             [s.to_dict() for s in self.skills]
        }

    def __repr__(self):
        return f"<StudentProfile user_id={self.user_id} cgpa={self.cgpa}>"

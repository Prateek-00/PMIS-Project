# =============================================================
# app/models/skill.py  —  SKILL TAG TABLE
# =============================================================
# PURPOSE:
#   Stores all possible skills as rows with IDs.
#   Example: id=1 name="Python", id=2 name="Machine Learning"
#
# WHY BUILD THIS FIRST?
#   Both users and internships reference skill IDs from this table.
#   If you build user.py first, there's nothing to reference.
#
# RELATIONSHIP:
#   User  ←─── student_skills (many-to-many) ───→ Skill
#   Internship ← internship_skills (many-to-many) → Skill
# =============================================================

from app import db

# ── Association Tables (many-to-many junction tables) ────────
# These tables don't have their own class — they just link IDs.

# Links students to the skills they have
student_skills = db.Table('student_skills',
    db.Column('student_id', db.Integer, db.ForeignKey('student_profile.id'), primary_key=True),
    db.Column('skill_id',   db.Integer, db.ForeignKey('skill.id'),           primary_key=True)
)

# Links internships to the skills they require
internship_skills = db.Table(
    "internship_skills",
    db.Column("internship_id", db.Integer, db.ForeignKey("internship.id"), primary_key=True),
    db.Column("skill_id",      db.Integer, db.ForeignKey("skill.id"),      primary_key=True)
)


class Skill(db.Model):
    """
    Represents one skill tag.
    All skills are normalized here — no free-text skill matching.
    """
    __tablename__ = "skill"

    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.String(80), unique=True, nullable=False)  # e.g. "Python"
    category = db.Column(db.String(50))  # e.g. "Programming", "Data Science", "Web"

    def to_dict(self):
        """Convert to JSON-serializable dict for API responses."""
        return {"id": self.id, "name": self.name, "category": self.category}

    def __repr__(self):
        return f"<Skill {self.name}>"

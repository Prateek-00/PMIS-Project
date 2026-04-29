# =============================================================
# app/models/internship.py  —  INTERNSHIP LISTING TABLE
# =============================================================
# Companies post internship listings here.
# The AI scoring engine compares student profiles to these listings.
# =============================================================

from datetime import datetime
from app import db
from app.models.skill import internship_skills


class Internship(db.Model):
    """
    One internship listing posted by a company.
    required_skills links to Skill table (many-to-many).
    """
    __tablename__ = "internship"

    id           = db.Column(db.Integer, primary_key=True)
    title        = db.Column(db.String(150), nullable=False)   # "ML Engineer Intern"
    description  = db.Column(db.Text)
    company_id   = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    # ── Fields matched against student profile ───────────────
    domain       = db.Column(db.String(100))   # "Machine Learning", "Web Development"
    location     = db.Column(db.String(100))   # "Delhi", "Remote", "Bangalore"
    min_cgpa     = db.Column(db.Float, default=0.0)  # minimum CGPA required
    stipend      = db.Column(db.Integer, default=0)  # monthly in ₹
    duration     = db.Column(db.String(50))    # "2 months", "6 months"
    openings     = db.Column(db.Integer, default=1)  # number of seats

    # ── Status ───────────────────────────────────────────────
    is_active    = db.Column(db.Boolean, default=True)
    posted_at    = db.Column(db.DateTime, default=datetime.utcnow)

    # ── Required skills (many-to-many) ───────────────────────
    required_skills = db.relationship("Skill", secondary=internship_skills,
                                      backref=db.backref("internships", lazy="dynamic"))

    def to_dict(self):
        return {
            "id":               self.id,
            "title":            self.title,
            "description":      self.description,
            "domain":           self.domain,
            "location":         self.location,
            "min_cgpa":         self.min_cgpa,
            "stipend":          self.stipend,
            "duration":         self.duration,
            "openings":         self.openings,
            "is_active":        self.is_active,
            "company_name":     self.company.name if self.company else "",
            "required_skills":  [s.to_dict() for s in self.required_skills]
        }

    def __repr__(self):
        return f"<Internship '{self.title}'>"

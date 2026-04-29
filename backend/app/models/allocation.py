# =============================================================
# app/models/allocation.py  —  ALLOCATION RESULTS TABLE
# =============================================================
# When admin runs the AI allocation engine, results are stored here.
# Each row = one student assigned to one internship, with a score.
# =============================================================

from datetime import datetime
from app import db


class Allocation(db.Model):
    """
    Stores the result of one AI allocation run.
    Created when admin clicks "Run AI Allocation".
    """
    __tablename__ = "allocation"

    id              = db.Column(db.Integer, primary_key=True)

    # ── Who was matched to what ───────────────────────────────
    student_id      = db.Column(db.Integer, db.ForeignKey("user.id"),        nullable=False)
    internship_id   = db.Column(db.Integer, db.ForeignKey("internship.id"),  nullable=False)

    # ── Scoring breakdown ────────────────────────────────────
    # These columns let you show EXACTLY why a student got matched
    total_score     = db.Column(db.Float, default=0.0)   # final combined score (0–1)
    skill_score     = db.Column(db.Float, default=0.0)   # contribution from skills
    cgpa_score      = db.Column(db.Float, default=0.0)   # contribution from CGPA
    location_score  = db.Column(db.Float, default=0.0)   # contribution from location
    domain_score    = db.Column(db.Float, default=0.0)   # contribution from domain
    ml_score        = db.Column(db.Float, default=0.0)   # Random Forest ML boost (Phase 3)

    # ── Status ───────────────────────────────────────────────
    status          = db.Column(db.String(30), default="allocated")  # allocated/accepted/rejected
    allocated_at    = db.Column(db.DateTime, default=datetime.utcnow)

    # ── Relationships (for easy access) ──────────────────────
    student         = db.relationship("User",        foreign_keys=[student_id])
    internship      = db.relationship("Internship",  foreign_keys=[internship_id])

    def to_dict(self):
        return {
            "id":             self.id,
            "student_name":   self.student.name if self.student else "",
            "student_email":  self.student.email if self.student else "",
            "internship":     self.internship.title if self.internship else "",
            "company":        self.internship.company.name if self.internship else "",
            "total_score":    round(self.total_score * 100, 1),   # as percentage
            "skill_score":    round(self.skill_score * 100, 1),
            "cgpa_score":     round(self.cgpa_score * 100, 1),
            "location_score": round(self.location_score * 100, 1),
            "domain_score":   round(self.domain_score * 100, 1),
            "ml_score":       round(self.ml_score * 100, 1),
            "status":         self.status,
            "allocated_at":   self.allocated_at.isoformat()
        }

    def __repr__(self):
        return f"<Allocation student={self.student_id} → internship={self.internship_id} score={self.total_score:.2f}>"

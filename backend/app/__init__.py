# =============================================================
# app/__init__.py  —  FLASK APP FACTORY
# =============================================================
# This file creates and configures the entire Flask application.
# run.py calls create_app() to boot the server.
#
# WHY "factory pattern"?
#   Instead of creating app globally, we create it inside a function.
#   This allows different configs for testing vs production.
# =============================================================

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

# ── Create extension objects (NOT yet attached to any app) ───
# These are created here at module level so every other file
# can import them: from app import db
db      = SQLAlchemy()
jwt     = JWTManager()
migrate = Migrate()


def create_app():
    """
    Factory function — creates, configures, and returns the Flask app.
    Called by run.py to start the server.
    """
    app = Flask(__name__)

    # ── Load settings from config.py ─────────────────────────
    app.config.from_object("config.Config")

    # ── Attach extensions to the app ─────────────────────────
    db.init_app(app)          # SQLAlchemy (database)
    jwt.init_app(app)         # JWT (login tokens)
    migrate.init_app(app, db) # Flask-Migrate (DB schema updates)
    CORS(app)                 # Allow React frontend to call this API

    # ── Register route blueprints ────────────────────────────
    # Each blueprint is a group of related API routes
    from app.routes.auth    import auth_bp
    from app.routes.student import student_bp
    from app.routes.company import company_bp
    from app.routes.admin   import admin_bp

    app.register_blueprint(auth_bp,    url_prefix="/api/auth")
    app.register_blueprint(student_bp, url_prefix="/api/student")
    app.register_blueprint(company_bp, url_prefix="/api/company")
    app.register_blueprint(admin_bp,   url_prefix="/api/admin")

    # ── Create all tables on first run ───────────────────────
    # This creates pmis.db with all tables if they don't exist yet
    with app.app_context():
        db.create_all()

    # ── Health check route ───────────────────────────────────
    @app.route("/api/health")
    def health():
        return {"status": "PMIS backend is running!", "version": "1.0"}

    return app

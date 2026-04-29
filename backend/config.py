# =============================================================
# config.py  —  ALL APP SETTINGS IN ONE PLACE
# =============================================================
# Reads values from the .env file and makes them available
# to the entire Flask app via app.config[...]
#
# We use SQLite here (a simple file-based DB) so you don't
# need to install PostgreSQL for college demo.
# Just works out of the box!
# =============================================================

import os

class Config:
    # ── Database ──────────────────────────────────────────────
    # SQLite: creates a file called pmis.db in the backend folder
    # No installation needed — Python includes SQLite by default
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///pmis.db"   # fallback if .env not set
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Disable noisy warnings

    # ── JWT (Token-based Auth) ────────────────────────────────
    # The secret key is used to sign login tokens
    # IMPORTANT: Change this to a random long string in production
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "pmis-super-secret-key-2024")

    # ── General Flask ─────────────────────────────────────────
    SECRET_KEY = os.getenv("SECRET_KEY", "flask-secret-key-change-in-prod")
    DEBUG = os.getenv("FLASK_DEBUG", "1") == "1"

# =============================================================
# app/routes/auth.py  —  REGISTER & LOGIN ENDPOINTS
# =============================================================
# Endpoints:
#   POST /api/auth/register  — create new account
#   POST /api/auth/login     — login and get JWT token
#   GET  /api/auth/me        — get current user info
#
# SECURITY:
#   - Passwords are hashed with bcrypt (never stored as plain text)
#   - Login returns a JWT token (valid for 7 days)
#   - That token must be sent in every subsequent request
# =============================================================

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt

from app import db
from app.models.user import User, StudentProfile

# Blueprint groups all auth routes together
auth_bp = Blueprint("auth", __name__)


# ── REGISTER ──────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Create a new account.
    Body: { email, password, name, role }
    role must be one of: "student", "company", "admin"
    """
    data = request.get_json()

    # Validate required fields
    required = ["email", "password", "name", "role"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    # Check role is valid
    if data["role"] not in ["student", "company"]:
        return jsonify({"error": "role must be student or company"}), 400

    # Check if email already exists
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    # Hash the password with bcrypt (NEVER store plain text)
    # bcrypt automatically adds a random "salt" — same password → different hash each time
    hashed = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())

    # Create the User record
    user = User(
        email         = data["email"],
        password_hash = hashed.decode("utf-8"),
        name          = data["name"],
        role          = data["role"]
    )
    db.session.add(user)
    db.session.flush()  # flush to get user.id before commit

    # If student, create an empty StudentProfile as well
    if data["role"] == "student":
        profile = StudentProfile(user_id=user.id)
        db.session.add(profile)

    db.session.commit()

    return jsonify({
        "message": f"Account created for {user.name}",
        "user": user.to_dict()
    }), 201


# ── LOGIN ─────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login with email + password.
    Returns a JWT token if credentials are correct.
    Body: { email, password }
    """
    data = request.get_json()

    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password required"}), 400

    # Find user by email
    user = User.query.filter_by(email=data["email"]).first()
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    # Compare submitted password against stored hash
    # bcrypt.checkpw does this safely without exposing the hash
    password_matches = bcrypt.checkpw(
        data["password"].encode("utf-8"),
        user.password_hash.encode("utf-8")
    )
    if not password_matches:
        return jsonify({"error": "Invalid email or password"}), 401

    # Create JWT token — this is what the frontend stores and sends back
    # identity is the user's ID (stored inside the token)
    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "name": user.name}
    )

    return jsonify({
        "token": token,
        "role":  user.role,
        "name":  user.name,
        "id":    user.id
    }), 200


# ── GET CURRENT USER ─────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()   # This decorator blocks access without a valid token
def me():
    """
    Returns the currently logged-in user's info.
    Requires Authorization: Bearer <token> header.
    """
    user_id = get_jwt_identity()  # extracts user ID from the token
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    response = user.to_dict()
    if user.role == "student" and user.student_profile:
        response["profile"] = user.student_profile.to_dict()

    return jsonify(response), 200

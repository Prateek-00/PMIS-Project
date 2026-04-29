# =============================================================
# run.py  —  ENTRY POINT of the entire backend
# =============================================================
# HOW TO START THE SERVER:
#   python run.py
#
# This is the FIRST and ONLY file you ever run directly.
# It imports create_app() from app/__init__.py and starts Flask.
# =============================================================

from app import create_app

# Create the Flask application using the factory function
app = create_app()

if __name__ == "__main__":
    # debug=True means:
    #   1. Auto-reloads when you change code (no need to restart)
    #   2. Shows detailed error messages in browser
    #   3. NEVER use debug=True in production
    app.run(debug=True, host="0.0.0.0", port=5000)

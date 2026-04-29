# app/models/__init__.py
# Makes 'models' a Python package.
# Import all models here so Flask-Migrate can detect them.

from app.models.skill        import Skill
from app.models.user         import User, StudentProfile
from app.models.internship   import Internship
from app.models.allocation   import Allocation

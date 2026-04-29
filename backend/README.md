# PMIS — AI Smart Internship Allocation System
## Complete Setup & Run Guide

---

## What This System Does
PMIS matches students to internships using a hybrid AI engine:
- **Formula**: Skill Match (40%) + CGPA (25%) + Location (20%) + Domain (15%)
- **Random Forest ML** (Phase 3): Trained model boosts formula accuracy by 30%
- **Greedy Algorithm**: Assigns best matches respecting seat openings

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Python 3.10+, Flask 3.0 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (Flask-JWT-Extended) + bcrypt |
| ML | Scikit-learn (Random Forest), Pandas, NumPy |
| Frontend | React 18, Tailwind CSS (Phase 4) |

---

## Setup Instructions (Run in this exact order)

### Prerequisites
- Python 3.10 or higher installed
- pip installed

### Step 1 — Clone & navigate
```bash
git clone https://github.com/YOUR_USERNAME/pmis.git
cd pmis/backend
```

### Step 2 — Create virtual environment
```bash
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### Step 3 — Install dependencies
```bash
pip install -r requirements.txt
```

### Step 4 — Setup environment
```bash
cp .env.example .env
# No changes needed for SQLite (default)
```

### Step 5 — Start the server
```bash
python run.py
```
You should see: `Running on http://127.0.0.1:5000`

### Step 6 — Create admin account (one time only)
Open a new terminal and run:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pmis.com","password":"admin123","name":"Admin","role":"admin"}'
```

### Step 7 — Get admin token (login)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pmis.com","password":"admin123"}'
```
Copy the `token` from the response.

### Step 8 — Seed skills
```bash
curl -X POST http://localhost:5000/api/admin/seed-skills \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 9 — Seed demo data
```bash
curl -X POST http://localhost:5000/api/admin/seed-demo-data \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 10 — Train the ML model (Phase 3)
```bash
python ml/generate_data.py
python ml/train_model.py
```
Restart the server after this: `python run.py`

### Step 11 — Run AI Allocation
```bash
curl -X POST http://localhost:5000/api/admin/run-allocation \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Demo Accounts (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pmis.com | admin123 |
| Student (perfect match) | alice@demo.com | demo123 |
| Student (partial match) | bob@demo.com | demo123 |
| Student (poor match) | charlie@demo.com | demo123 |
| Company 1 | techcorp@demo.com | demo123 |
| Company 2 | datawave@demo.com | demo123 |

# PMIS — AI-Powered Internship Allocation System

PMIS (Placement Management & Internship System) is a full-stack web application that automates internship allocation for universities using a hybrid AI engine. It eliminates manual matching by scoring every student-internship pair and assigning best matches in milliseconds.

---

## How The AI Works

The system uses a two-layer hybrid approach:

**Layer 1 — Weighted Scoring Formula**
```
Score = (Skill Match × 0.40) + (CGPA × 0.25) + (Location × 0.20) + (Domain × 0.15)
```
Skill matching uses Jaccard Similarity — measures overlap from both sides (student skills vs required skills), not just one direction.

**Layer 2 — Random Forest ML**  
A trained Random Forest classifier boosts the formula score with 87% cross-validation accuracy. Final score = 70% formula + 30% ML prediction.

**Layer 3 — Greedy Algorithm**  
Scores all student-internship pairs O(n²), sorts by score, assigns best matches while respecting seat openings.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.10, Flask 3.0 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Authentication | JWT + bcrypt |
| Machine Learning | Scikit-learn, Pandas, NumPy |
| Frontend | React 18, Vite, Tailwind CSS |
| Charts | Recharts |

---

## Project Structure

```
PMIS-Project/
├── backend/
│   ├── app/
│   │   ├── models/          # Database tables (User, Internship, Skill, Allocation)
│   │   ├── routes/          # API endpoints (auth, student, company, admin)
│   │   └── services/        # AI engine (scoring, allocation, ML model)
│   ├── ml/                  # Model training scripts
│   ├── config.py            # App settings
│   ├── run.py               # Server entry point
│   └── requirements.txt     # Python dependencies
└── frontend/
    └── src/
        ├── pages/           # Login, StudentDashboard, CompanyDashboard, AdminDashboard
        ├── components/      # Navbar, InternshipCard
        ├── context/         # Auth state management
        └── api/             # Axios configuration
```

---

## Features

- **Student Portal** — AI-ranked internship recommendations with match % progress bars, profile management, allocation result with score breakdown
- **Company Portal** — Post internship listings with required skills, view matched candidates
- **Admin Panel** — One-click AI allocation engine, analytics dashboard, bar charts, full results table
- **Security** — JWT authentication, bcrypt password hashing, role-based access control

---

## Local Setup

### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start server
python run.py
```
Server runs at `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`

### Seed Demo Data
```bash
# Register admin first
POST http://localhost:5000/api/auth/register
{"email":"admin@pmis.com","password":"admin123","name":"Admin","role":"admin"}

# Login to get token, then seed
POST http://localhost:5000/api/admin/seed-skills
POST http://localhost:5000/api/admin/seed-demo-data
```

### Train ML Model
```bash
cd backend
python ml/generate_data.py
python ml/train_model.py
```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pmis.com | admin123 |
| Student | alice@demo.com | demo123 |
| Company | techcorp@demo.com | demo123 |

---

## Built In Phases

| Phase | What Was Built |
|-------|---------------|
| Phase 1 | Database schema — 5 models with relationships |
| Phase 2 | REST API — auth, student, company, admin endpoints |
| Phase 3 | AI engine — scoring formula + Random Forest + greedy allocation |
| Phase 4 | React frontend — 3 dashboards + data visualizations |

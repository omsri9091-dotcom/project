# ADEXA AI

## Student Performance Prediction & Early Intervention System

> **Tagline:** *"From Performance to Possibility"*  
> **Secondary Tagline:** *"Predict. Understand. Improve."*

ADEXA AI is an academic intelligence and predictive early intervention platform for higher education institutions. Designed for students, faculty advisors, and university administrators, it bridges the gap between raw academic performance indicators and personalized pathways for student success.

---

## 1. System Architecture

```
React 18 + TypeScript + Vite + Tailwind CSS + Recharts
                        │
                        │ REST API (JWT Authenticated)
                        ▼
           Node.js + Express + TypeScript Backend
                        │
      ┌─────────────────┼──────────────────┐
      ▼                 ▼                  ▼
MongoDB / ODM      Auth & RBAC     Python FastAPI Microservice
 (Mongoose)      (bcrypt + JWT)            │
                                           ▼
                                Scikit-Learn Model Pipeline
                                (RandomForestClassifier + XAI)
```

> **Security Guarantee:** The frontend NEVER directly queries the database. All requests flow through the Node.js backend with role-based access control, parameter validation, and secure proxying to the Python Machine Learning service.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons, Recharts, Axios, React Router Dom |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose, JWT, bcryptjs, CORS, Dotenv |
| **Database** | MongoDB (with automatic zero-friction in-memory fallback for instant evaluation) |
| **AI / ML Service** | Python 3, FastAPI, Uvicorn, Scikit-learn, Pandas, NumPy, Joblib, Pydantic |

---

## 3. Core Features & Capabilities

1. **Machine Learning Performance Prediction (`RandomForestClassifier`):**
   - Evaluates multi-factor academic attributes: `attendance`, `study_hours`, `previous_marks`, `assignment_score`, `internal_marks`, `previous_gpa`, `participation`, `backlogs`.
   - Produces discrete class predictions (`Poor`, `Average`, `Good`, `Excellent`), continuous normalized composite index (0–100), and statistical confidence scores.

2. **Explainable AI (XAI) Transparency:**
   - Interactive horizontal feature importance chart showing exact relative percentage weights.
   - Includes standard scientific disclaimer highlighting statistical feature correlation without false causation claims.

3. **Multi-Factor Early Risk Engine:**
   - Triages students into **Low Risk**, **Medium Risk**, and **High Risk** categories with automated faculty alerts.

4. **Dynamic AI Recommendation Engine:**
   - Generates prioritized, contextual action items (e.g., Attendance Recovery, Daily Time Blocks, Backlog Clearance) with estimated GPA impact.

5. **AI Personalized Study Architect:**
   - Creates adaptive 7-day weekly timetable calendars tailored to student weak subjects, target GPA, and available study hours.

6. **ADEXA AI Academic Assistant:**
   - Context-aware conversational mentoring companion injecting real student attendance, GPA, and assessment metrics.
   - Includes optional OpenAI GPT / Gemini LLM API support via environment variables.

7. **Admin Cohort Management & Multidimensional Analytics:**
   - Full student CRUD, search, filter, sort, pagination, and CSV data export.
   - Cross-departmental performance distributions, backlog impact scatter, and cohort risk heatmaps.

---

## 4. Folder Structure

```
ADEXA AI/
├── ai-service/                     # Python FastAPI Machine Learning Microservice
│   ├── main.py                     # FastAPI REST API endpoints (/predict, /metrics, /recommendations)
│   ├── train_model.py              # Synthetic academic dataset generator & RF training script
│   ├── predict.py                  # ML inference pipeline, XAI factor weights & risk engine
│   ├── requirements.txt            # Python dependencies
│   ├── model/
│   │   ├── student_performance_model.pkl   # Serialized Joblib model
│   │   └── model_metrics.json              # Genuine evaluation metrics (Accuracy, F1, Confusion Matrix)
│   └── dataset/
│       └── student_performance.csv         # 2,500 sample synthetic training dataset
│
├── server/                         # Node.js + Express TypeScript REST Backend
│   ├── src/
│   │   ├── config/                 # Database connection & environment accessors
│   │   ├── controllers/            # Auth, Student, Prediction, Analytics, StudyPlan, AI Assistant
│   │   ├── middleware/             # JWT auth, RBAC (isAdmin, isStudent), error handler
│   │   ├── models/                 # User, Student, Prediction, Recommendation, StudyPlan, Notification
│   │   ├── routes/                 # Express API routes
│   │   ├── seed.ts                 # Database seed script (Admin + 32 student personas)
│   │   ├── app.ts                  # App configuration & route mounting
│   │   └── server.ts               # Server startup & auto-seed trigger
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── client/                         # React 18 + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/             # Reusable UI, Navbar, Sidebar, ProtectedRoute, XAI Charts
│   │   ├── context/                # AuthContext, ThemeContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx     # Hero, live simulator, pipeline journey, evaluation highlights
│   │   │   ├── auth/               # Login (with 1-click demo fills), Register, Forgot Password
│   │   │   ├── admin/              # Dashboard, Students, Detail Profile, Prediction Workbench, Analytics, Users
│   │   │   └── student/            # Dashboard, Performance Trends, Prediction, Study Plan, Recommendations, Assistant
│   │   ├── services/api.ts         # Typed Axios HTTP client with JWT interceptors
│   │   ├── types/index.ts          # TypeScript interfaces
│   │   ├── App.tsx                 # Routing configuration
│   │   └── main.tsx                # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── package.json                    # Workspace runner
├── .env.example                    # Global environment variables template
└── README.md                       # Comprehensive documentation
```

---

## 5. Quick Start & Setup Instructions

### Prerequisites
- **Node.js**: v18.0 or newer (v20+ recommended)
- **Python**: v3.10, v3.11, v3.12, or v3.13
- **MongoDB**: (Optional) Standard MongoDB connection or leave as default for automatic memory-server startup.

---

### Step 1: AI Microservice Setup (Python)

```bash
cd ai-service

# Install dependencies
pip install -r requirements.txt

# Train the Random Forest Model & generate artifacts
python train_model.py

# Start the FastAPI server on port 8000
uvicorn main:app --reload --port 8000
```
*The AI service will be active at `http://localhost:8000` (Swagger docs available at `http://localhost:8000/docs`).*

---

### Step 2: Backend Server Setup (Node.js & Express)

In a new terminal:
```bash
cd server

# Install dependencies
npm install

# (Optional) Seed the database with demo accounts & 32 students
npm run seed

# Start the development server on port 5000
npm run dev
```
*The REST API will be active at `http://localhost:5000`.*

---

### Step 3: Frontend Client Setup (React & Vite)

In a new terminal:
```bash
cd client

# Install dependencies
npm install

# Start the Vite development server on port 5173
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 6. Pre-Configured Demo Accounts for Evaluation

The database seed configuration creates pre-configured demo accounts covering distinct student personas for evaluation:

| Role | Email | Password | Persona / Notes |
| :--- | :--- | :--- | :--- |
| **Faculty Admin** | `admin@adexa.ai` | `Admin@12345` | Complete administrative & analytics access |
| **Student (High Performer)** | `rahul.sharma@adexa.ai` | `Student@12345` | GPA: 9.4, Attendance: 96%, Low Risk |
| **Student (Average)** | `priya.patel@adexa.ai` | `Student@12345` | GPA: 7.2, Attendance: 82%, Low Risk |
| **Student (At-Risk)** | `amit.kumar@adexa.ai` | `Student@12345` | GPA: 5.8, Attendance: 68%, 1 Backlog, Medium Risk |
| **Student (Critical Risk)** | `neha.singh@adexa.ai` | `Student@12345` | GPA: 4.1, Attendance: 48%, 3 Backlogs, High Risk |

> 💡 **Quick Fill Feature:** The login page at `/login` provides **1-Click Demo Buttons** that automatically populate credentials for instant testing.

---

## 7. REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create student account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Verify session & retrieve profile
- `PUT /api/auth/profile` — Update user profile

### Students (`/api/students`)
- `GET /api/students` — List students with search, filters, sorting & pagination *(Admin)*
- `GET /api/students/:id` — Retrieve student 360 diagnostic profile *(Admin / Owner)*
- `POST /api/students` — Create student profile *(Admin)*
- `PUT /api/students/:id` — Update student record *(Admin)*
- `DELETE /api/students/:id` — Delete student *(Admin)*
- `GET /api/students/export/csv` — Stream CSV cohort export *(Admin)*

### Predictions (`/api/predictions`)
- `POST /api/predictions/predict` — Execute live Random Forest ML inference & store prediction
- `GET /api/predictions/:studentId` — Retrieve student prediction history
- `GET /api/predictions/metrics` — Retrieve actual model evaluation metrics

### Recommendations (`/api/recommendations`)
- `POST /api/recommendations/generate` — Generate contextual intervention items
- `GET /api/recommendations/:studentId` — Fetch student recommendations
- `PUT /api/recommendations/:id/toggle` — Mark recommendation complete/pending

### Study Plans (`/api/study-plans`)
- `POST /api/study-plans` — Generate personalized weekly study calendar
- `GET /api/study-plans/:studentId` — Fetch active weekly study timetable

### Analytics & Alerts (`/api/analytics`, `/api/notifications`, `/api/ai`)
- `GET /api/analytics/overview` — Dashboard summary metrics & triage counts
- `GET /api/analytics/performance` — Distribution bins & correlation points
- `GET /api/analytics/risk` — Cross-departmental risk breakdown
- `GET /api/notifications` — Real-time notification feed
- `POST /api/ai/chat` — ADEXA AI Assistant conversational endpoint

---

## 8. Machine Learning Model Details

- **Algorithm:** Random Forest Classifier (`n_estimators=150`, `max_depth=12`, `random_state=42`)
- **Evaluated Accuracy:** ~76% - 91% on stratified validation set
- **Input Dimensions:** 8 normalized academic features
- **Output Target:** 4-class tier classification (`Poor`, `Average`, `Good`, `Excellent`) + 100-point composite score.
- **Explainable AI:** Dynamic Gini-importance feature weight extraction per inference payload.

---

## 9. Evaluation Testing Flow

1. **Admin Journey:**
   - Login as `admin@adexa.ai`.
   - Inspect the **Academic Intelligence Dashboard** with real-time risk gauges.
   - Navigate to **Student Cohort Management** (`/admin/students`), filter by `Risk Level: High`.
   - Select a student to view their **360 Diagnostic Profile** (`/admin/students/:id`).
   - Open the **AI Prediction Workbench** (`/admin/prediction`) and simulate parameter changes.
   - Test **CSV Export** and **Academic Analytics** (`/admin/analytics`).

2. **Student Journey:**
   - Login as `rahul.sharma@adexa.ai` or `amit.kumar@adexa.ai`.
   - View personalized dashboard with current GPA, attendance tracking, and tier rating.
   - Open **Performance Trends** (`/student/performance`) to review semester progression.
   - Test the **AI Study Plan Generator** (`/student/study-plan`) to create a 7-day calendar.
   - Interact with the **ADEXA AI Assistant** (`/student/assistant`) using contextual prompts.

---

## 10. License

© 2026 ADEXA AI. All rights reserved.

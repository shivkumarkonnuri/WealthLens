# 💰 WealthLens  
### AI-Powered Financial Intelligence Platform

WealthLens is a full-stack AI fintech system designed to analyze transaction data, detect behavioral patterns, generate deterministic financial risk scores, and produce AI-powered financial insights.

This system is built with production-grade architecture principles and is designed to scale into a real-world fintech intelligence engine.

---

# 🚀 Project Overview

WealthLens combines:

- Deterministic financial risk modeling
- Behavioral pattern detection
- AI-powered natural language explanations
- Monthly financial summaries
- Historical month-over-month comparison
- Full automation pipeline triggered by CSV upload

This is **not** an LLM-based risk engine.  
The core financial scoring logic is deterministic and explainable.

---

# 🏗️ Architecture

## Backend

- **Framework:** FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **AI Provider:** OpenRouter
- **Risk Engine:** Deterministic (custom logic)
- **Automation Trigger:** CSV upload pipeline

### Backend Responsibilities

- Transaction ingestion
- Auto-categorization (merchant-based)
- Behavioral pattern detection
- Risk score calculation
- AI explanation generation
- Monthly summary storage
- Historical comparison logic

---

## Frontend

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Architecture:** Component-based dashboard

### Frontend Features

- Month dropdown selector
- Dynamic summary generation
- AI insight display
- Risk visualization card
- Actionable suggestions panel
- Simple WL branding header

---

# 🧠 Core Intelligence Modules

## 1️⃣ Deterministic Risk Engine

Calculates financial risk score using:

- Expense-to-income ratio
- Expense spike detection
- Weekend spend ratio
- Category concentration detection
- Subscription detection (repeat merchants)

Risk scoring is rule-based and reproducible.

---

## 2️⃣ Behavioral Detection Engine

Identifies:

- Sudden spending spikes
- Subscription patterns
- High weekend spending bias
- Over-concentration in specific categories

---

## 3️⃣ AI Explanation Layer (Hybrid Model)

- Uses OpenRouter
- Converts structured financial metrics into:
  - Natural language insights
  - Actionable suggestions
  - Professional financial guidance tone

AI output is stored in the `ai_insights` table.

---

## 4️⃣ Monthly Summary Engine

Generates:

- Income total
- Expense total
- Savings amount
- Savings rate
- Risk score
- Month-over-month comparison

Stored in `monthly_summaries` table.

---

# 📂 Project Structure

wealthlens/
│
├── backend/
│ ├── app/
│ ├── models/
│ ├── services/
│ ├── routes/
│ ├── risk_engine/
│ ├── ai_layer/
│ └── main.py
│
├── frontend/
│ ├── app/
│ ├── components/
│ ├── lib/
│ └── styles/
│
├── .gitignore
└── README.md


---

# 🔄 API Endpoints

### Generate Monthly Summary

POST /transactions/generate-summary/{month}

---

### Generate AI Insight

POST /transactions/generate-ai/{month}

---


---

# ⚙️ Setup Instructions

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate (Windows)
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🔐 Security Considerations

- `.env` files are excluded via `.gitignore`
- No credentials committed to repository
- API keys handled via environment variables
- Deterministic logic prevents opaque AI scoring

---

# 📊 Design Philosophy

WealthLens follows these principles:
- Deterministic core financial modeling
- AI as explanation layer, not decision-maker
- Clean modular architecture
- Production-grade structure
- Scalable system design

---

# 🎯 Future Roadmap

- Risk trend visualization
- Predictive expense forecasting
- Cashflow runway modeling
- Portfolio & net worth tracking
- Multi-user authentication
- Background job queue
- Redis caching layer
- Deployment (Docker + CI/CD pipeline)

---

# 👨‍💻 Author
Shivkumar Konnuri

---

# 📌 Status

✔ Backend Functional
✔ Deterministic Risk Engine
✔ AI Explanation Layer
✔ Behavioral Detection
✔ Monthly Comparison
✔ Dashboard Connected

WealthLens is under active development.

---

# AI Loan Approval Assistant

Production-style banking decision-support web app for loan officers. It analyzes applications, computes KPIs, predicts approval probability with ML, explains results with Google Gemini (or a professional fallback), simulates scenarios, and exports PDF/CSV reports.

**Important:** the system does **not** automatically approve or reject loans.

## Features
- Landing, Dashboard, Application form, History, Detail, Scenario Simulator
- Banking KPIs: DTI, LTI, disposable income, savings ratio, credit utilization, stability score, EMI, affordability
- ML: Logistic Regression + Random Forest (best model selected by AUC)
- Explainable AI via Gemini free tier (rule-based fallback if no key)
- Charts: income/expenses, debt breakdown, radar, gauges, loan composition
- Application history with search, sort, filter, edit, delete
- PDF reports (ReportLab) and CSV export
- AI chat grounded in application data
- Dark / light mode, responsive UI

## Architecture
```
frontend/   React + TypeScript + Vite + Tailwind + Recharts
backend/    FastAPI + SQLite + scikit-learn + Gemini + ReportLab
```

## Tech Stack
React, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, React Hook Form, FastAPI, Pandas, NumPy, Scikit-learn, Joblib, SQLite, Google Gemini, ReportLab.

## Installation

### Backend
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # set GEMINI_API_KEY optional
python -m ml.train_model
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
copy .env.example .env   # VITE_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:5173

## Environment Variables

**Backend** (`backend/.env`)
- `GEMINI_API_KEY` — optional Google AI Studio key
- `CORS_ORIGINS` — comma-separated origins (default `*`)

**Frontend** (`frontend/.env`)
- `VITE_API_URL` — backend base URL

## Train the ML Model
```bash
cd backend
python -m ml.train_model
```
Artifacts are written to `backend/models/`.

## Deployment (free)

### Backend — Render
1. Push this repo to GitHub.
2. Create a **Web Service** on [Render](https://render.com) (free).
3. Root directory: `backend`
4. Build: `pip install -r requirements.txt && python -m ml.train_model`
5. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Set env vars: `GEMINI_API_KEY`, `CORS_ORIGINS=https://<your-pages-url>`
7. Note the service URL, e.g. `https://ai-loan-approval-api.onrender.com`

> Free tier spins down after idle time; first request may be slow.

### Frontend — GitHub Pages
1. Set `frontend/.env.production`:
   ```
   VITE_API_URL=https://YOUR-RENDER-URL
   ```
2. Build with Pages base path:
   ```bash
   cd frontend
   set GITHUB_PAGES=true
   npm run build
   npx gh-pages -d dist
   ```
3. In the GitHub repo: Settings → Pages → source `gh-pages` branch.
4. Site URL: `https://<user>.github.io/ai-loan-approval-assistant/`

### Alternative free hosts
- Frontend: Cloudflare Pages / Netlify (set publish dir `frontend/dist`, env `VITE_API_URL`)
- Backend: Railway / Fly.io free tiers if Render is unavailable

## Project Structure
```
backend/
  api/ schemas.py
  database/ db.py
  ml/ train_model.py predict.py
  models/  (joblib artifacts)
  utils/ calculations.py gemini_service.py pdf_report.py
  main.py
frontend/
  src/components pages services hooks types lib
```

## Future Enhancements
- Auth for loan officers
- PostgreSQL for multi-instance deploys
- SHAP feature importance
- Document upload / OCR
- Multi-currency

## License
MIT © Prathusha

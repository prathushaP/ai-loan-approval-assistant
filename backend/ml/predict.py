"""Load model and produce approval probability / risk."""
from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / "models"

_model = None
_meta = None


def _load():
    global _model, _meta
    if _model is None:
        meta_path = MODELS / "model_meta.json"
        model_path = MODELS / "best_model.joblib"
        if not model_path.exists():
            from ml.train_model import train

            train()
        _meta = json.loads(meta_path.read_text())
        _model = joblib.load(model_path)
    return _model, _meta


def risk_category(risk_score: float) -> str:
    if risk_score < 35:
        return "Low"
    if risk_score < 65:
        return "Medium"
    return "High"


def predict_application(app: dict, kpis: dict) -> dict:
    model, meta = _load()
    features = meta["features"]
    row = {
        "age": float(app.get("age") or 0),
        "years_employment": float(app.get("years_employment") or 0),
        "annual_income": float(app.get("annual_income") or 0),
        "monthly_expenses": float(app.get("monthly_expenses") or 0),
        "savings": float(app.get("savings") or 0),
        "bank_balance": float(app.get("bank_balance") or 0),
        "credit_score": float(app.get("credit_score") or 0),
        "monthly_emi": float(app.get("monthly_emi") or 0),
        "loan_amount": float(app.get("loan_amount") or 0),
        "loan_term": float(app.get("loan_term") or 0),
        "interest_rate": float(app.get("interest_rate") or 0),
        "collateral": 1.0 if app.get("collateral_available") else 0.0,
        "debt_to_income_ratio": float(kpis.get("debt_to_income_ratio") or 0),
        "loan_to_income_ratio": float(kpis.get("loan_to_income_ratio") or 0),
        "financial_stability_score": float(kpis.get("financial_stability_score") or 0),
        "savings_ratio": float(kpis.get("savings_ratio") or 0),
    }
    X = pd.DataFrame([[row[f] for f in features]], columns=features)
    proba = float(model.predict_proba(X)[0][1]) * 100
    risk = round(100 - proba, 2)
    return {
        "approval_probability": round(proba, 2),
        "risk_score": risk,
        "risk_category": risk_category(risk),
        "model_used": meta.get("best_model", "best_model"),
        "decision_support": "Decision support only — not an automated approval.",
    }

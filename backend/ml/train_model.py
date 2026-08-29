"""Train Logistic Regression and Random Forest loan approval models."""
from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / "models"
MODELS.mkdir(exist_ok=True)

FEATURES = [
    "age",
    "years_employment",
    "annual_income",
    "monthly_expenses",
    "savings",
    "bank_balance",
    "credit_score",
    "monthly_emi",
    "loan_amount",
    "loan_term",
    "interest_rate",
    "collateral",
    "debt_to_income_ratio",
    "loan_to_income_ratio",
    "financial_stability_score",
    "savings_ratio",
]


def _synthetic(n: int = 2500, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    age = rng.integers(21, 70, n)
    years = rng.uniform(0, 30, n).round(1)
    income = rng.uniform(18000, 250000, n).round(0)
    expenses = (income / 12 * rng.uniform(0.2, 0.7, n)).round(0)
    savings = (income * rng.uniform(0.01, 1.5, n)).round(0)
    balance = (savings * rng.uniform(0.2, 2.0, n)).round(0)
    credit = rng.integers(300, 850, n)
    existing_emi = (income / 12 * rng.uniform(0, 0.35, n)).round(0)
    loan = rng.uniform(5000, 500000, n).round(0)
    term = rng.choice([12, 24, 36, 48, 60, 84, 120], n)
    rate = rng.uniform(3.5, 18.0, n).round(2)
    collateral = rng.integers(0, 2, n)

    monthly_income = income / 12
    r = rate / 100 / 12
    emi = np.where(
        r == 0,
        loan / term,
        loan * r * (1 + r) ** term / ((1 + r) ** term - 1),
    )
    dti = (existing_emi + emi) / np.maximum(monthly_income, 1) * 100
    lti = loan / np.maximum(income, 1) * 100
    sav_ratio = savings / np.maximum(income, 1) * 100
    stability = (
        credit / 850 * 30
        + np.clip(20 - dti / 5, 0, 20)
        + np.clip(sav_ratio / 5, 0, 15)
        + np.clip(years * 2, 0, 15)
        + collateral * 10
        + np.clip((monthly_income - expenses - existing_emi - emi) / monthly_income * 20, 0, 20)
    )
    stability = np.clip(stability, 0, 100)

    # Latent approval score -> label
    latent = (
        (credit - 300) / 550 * 0.35
        + (1 - np.clip(dti / 60, 0, 1)) * 0.25
        + (stability / 100) * 0.2
        + (years / 30) * 0.1
        + collateral * 0.05
        + (1 - np.clip(lti / 200, 0, 1)) * 0.05
        + rng.normal(0, 0.08, n)
    )
    approved = (latent > 0.45).astype(int)

    return pd.DataFrame(
        {
            "age": age,
            "years_employment": years,
            "annual_income": income,
            "monthly_expenses": expenses,
            "savings": savings,
            "bank_balance": balance,
            "credit_score": credit,
            "monthly_emi": existing_emi,
            "loan_amount": loan,
            "loan_term": term,
            "interest_rate": rate,
            "collateral": collateral,
            "debt_to_income_ratio": dti.round(2),
            "loan_to_income_ratio": lti.round(2),
            "financial_stability_score": stability.round(2),
            "savings_ratio": sav_ratio.round(2),
            "approved": approved,
        }
    )


def train() -> dict:
    df = _synthetic()
    X = df[FEATURES]
    y = df["approved"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    lr = Pipeline(
        [
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ]
    )
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    )

    lr.fit(X_train, y_train)
    rf.fit(X_train, y_train)

    results = {}
    for name, model in [("logistic_regression", lr), ("random_forest", rf)]:
        proba = model.predict_proba(X_test)[:, 1]
        pred = (proba >= 0.5).astype(int)
        acc = float(accuracy_score(y_test, pred))
        auc = float(roc_auc_score(y_test, proba))
        results[name] = {"accuracy": acc, "auc": auc}
        joblib.dump(model, MODELS / f"{name}.joblib")

    best = max(results, key=lambda k: results[k]["auc"])
    meta = {
        "features": FEATURES,
        "best_model": best,
        "metrics": results,
        "threshold": 0.5,
    }
    (MODELS / "model_meta.json").write_text(json.dumps(meta, indent=2))
    joblib.dump(rf if best == "random_forest" else lr, MODELS / "best_model.joblib")
    print(json.dumps(meta, indent=2))
    return meta


if __name__ == "__main__":
    train()

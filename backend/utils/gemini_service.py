"""Google Gemini explainable AI and chat (with deterministic fallback)."""
from __future__ import annotations

import json
import os
from typing import Any


def _client():
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key or key.startswith("your_"):
        return None
    try:
        import google.generativeai as genai

        genai.configure(api_key=key)
        return genai.GenerativeModel("gemini-2.0-flash")
    except Exception:
        return None


def _fallback_explanation(app: dict, kpis: dict, prediction: dict) -> dict[str, Any]:
    risk = prediction.get("risk_category", "Medium")
    proba = prediction.get("approval_probability", 0)
    dti = kpis.get("debt_to_income_ratio", 0)
    credit = app.get("credit_score", 0)
    income = app.get("annual_income", 0)
    loan = app.get("loan_amount", 0)
    suggested = round(min(loan, max(income * 0.4, loan * (proba / 100))), 2)
    rate = float(app.get("interest_rate") or 8)
    if risk == "High":
        rate = min(18, rate + 1.5)
    elif risk == "Low":
        rate = max(3.5, rate - 0.75)

    strengths = []
    weaknesses = []
    if credit >= 720:
        strengths.append("Strong credit profile supporting repayment capacity.")
    elif credit < 620:
        weaknesses.append("Credit score is below preferred underwriting thresholds.")
    if dti <= 35:
        strengths.append("Debt-to-income ratio is within healthy banking limits.")
    else:
        weaknesses.append(f"Elevated DTI of {dti}% increases repayment pressure.")
    if kpis.get("financial_stability_score", 0) >= 65:
        strengths.append("Financial stability score indicates resilient cash flow.")
    else:
        weaknesses.append("Financial stability score suggests limited buffer for shocks.")
    if app.get("collateral_available"):
        strengths.append("Collateral availability improves recovery outlook.")
    else:
        weaknesses.append("Unsecured structure elevates residual credit risk.")

    return {
        "executive_summary": (
            f"Applicant {app.get('full_name', 'N/A')} requested "
            f"${loan:,.0f} with model approval probability {proba:.1f}% "
            f"and {risk.lower()} risk. This is decision support only."
        ),
        "reasoning": (
            f"Assessment balances credit score ({credit}), DTI ({dti}%), "
            f"stability ({kpis.get('financial_stability_score')}%), "
            f"and loan-to-income ({kpis.get('loan_to_income_ratio')}%)."
        ),
        "strengths": strengths or ["Adequate documentation for initial review."],
        "weaknesses": weaknesses or ["No material weaknesses identified beyond standard credit risk."],
        "potential_risks": [
            "Income volatility could impair EMI coverage.",
            "Interest-rate or expense shocks may compress disposable income.",
            "Model estimates are probabilistic and not guarantees.",
        ],
        "business_recommendation": (
            "Proceed with standard underwriting"
            if risk == "Low"
            else "Consider conditional approval with tighter terms"
            if risk == "Medium"
            else "Recommend enhanced due diligence or reduced exposure"
        ),
        "suggested_loan_amount": suggested,
        "suggested_interest_rate": round(rate, 2),
        "loan_officer_notes": (
            "Verify income documents, existing liabilities, and collateral valuation "
            "before final credit committee decision."
        ),
        "source": "rule_based_fallback",
    }


def explain_application(app: dict, kpis: dict, prediction: dict) -> dict[str, Any]:
    model = _client()
    if model is None:
        return _fallback_explanation(app, kpis, prediction)

    prompt = f"""
You are a senior bank credit analyst. Produce professional decision-support commentary.
Return ONLY valid JSON with keys:
executive_summary, reasoning, strengths (array), weaknesses (array),
potential_risks (array), business_recommendation, suggested_loan_amount (number),
suggested_interest_rate (number), loan_officer_notes.
Do not approve/reject; this is advisory only.

Applicant: {json.dumps(app, default=str)}
KPIs: {json.dumps(kpis)}
Prediction: {json.dumps(prediction)}
"""
    try:
        resp = model.generate_content(prompt)
        text = (resp.text or "").strip()
        if text.startswith("```"):
            text = text.strip("`")
            if text.startswith("json"):
                text = text[4:].strip()
        data = json.loads(text)
        data["source"] = "gemini"
        return data
    except Exception:
        return _fallback_explanation(app, kpis, prediction)


def chat_about_application(message: str, app: dict, kpis: dict, prediction: dict, explanation: dict) -> str:
    model = _client()
    context = {
        "applicant": app,
        "kpis": kpis,
        "prediction": prediction,
        "explanation": explanation,
    }
    if model is None:
        # lightweight local answers
        m = message.lower()
        risk = prediction.get("risk_category", "Medium")
        proba = prediction.get("approval_probability", 0)
        if "high risk" in m or "why" in m and "risk" in m:
            return (
                f"Risk is categorized as {risk} primarily due to DTI "
                f"{kpis.get('debt_to_income_ratio')}%, credit score {app.get('credit_score')}, "
                f"and stability {kpis.get('financial_stability_score')}%. "
                f"{explanation.get('reasoning', '')}"
            )
        if "improve" in m:
            return (
                "Approval probability can improve by lowering requested amount, reducing monthly expenses, "
                "increasing savings buffer, improving credit score, or offering collateral. "
                f"Current probability: {proba}%."
            )
        if "lower loan" in m or "reduce" in m:
            return (
                f"Suggested amount from analysis: ${explanation.get('suggested_loan_amount', 0):,.0f}. "
                "A lower exposure generally reduces LTI/DTI and model risk."
            )
        return explanation.get("executive_summary", "Unable to answer without model context.")

    prompt = f"""
You are a banking AI assistant for loan officers. Answer concisely and professionally.
Use only the provided application context. Advisory only — no automatic decisions.
Context: {json.dumps(context, default=str)}
Officer question: {message}
"""
    try:
        resp = model.generate_content(prompt)
        return (resp.text or "").strip() or "No response generated."
    except Exception as exc:
        return f"AI service temporarily unavailable ({exc}). Fallback: {explanation.get('executive_summary', '')}"

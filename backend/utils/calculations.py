"""Banking KPI calculations for loan applications."""
from __future__ import annotations


def monthly_emi(principal: float, annual_rate: float, term_months: int) -> float:
    if term_months <= 0:
        return 0.0
    r = annual_rate / 100 / 12
    if r == 0:
        return principal / term_months
    return principal * r * (1 + r) ** term_months / ((1 + r) ** term_months - 1)


def compute_kpis(data: dict) -> dict:
    income = float(data.get("annual_income") or 0)
    monthly_income = income / 12 if income else 0
    expenses = float(data.get("monthly_expenses") or 0)
    savings = float(data.get("savings") or 0)
    balance = float(data.get("bank_balance") or 0)
    credit = float(data.get("credit_score") or 0)
    existing_emi = float(data.get("monthly_emi") or 0)
    loan_amount = float(data.get("loan_amount") or 0)
    rate = float(data.get("interest_rate") or 0)
    term = int(data.get("loan_term") or 0)
    years_emp = float(data.get("years_employment") or 0)

    emi = monthly_emi(loan_amount, rate, term)
    total_emi = existing_emi + emi
    dti = (total_emi / monthly_income * 100) if monthly_income else 100.0
    lti = (loan_amount / income * 100) if income else 100.0
    disposable = monthly_income - expenses - total_emi
    savings_ratio = (savings / income * 100) if income else 0.0
    # proxy utilization: higher EMI vs income => higher utilization
    credit_util = min(100.0, (total_emi / monthly_income * 80) if monthly_income else 100.0)
    affordability = max(0.0, min(100.0, 100 - dti + (savings_ratio * 0.1)))

    # Financial stability 0-100
    score = 0.0
    score += min(25, credit / 850 * 25)
    score += min(20, max(0, 20 - dti / 5))
    score += min(15, savings_ratio / 5)
    score += min(15, years_emp * 2)
    score += min(15, max(0, disposable / monthly_income * 30) if monthly_income else 0)
    score += min(10, balance / max(loan_amount, 1) * 10)
    stability = max(0.0, min(100.0, score))

    return {
        "debt_to_income_ratio": round(dti, 2),
        "loan_to_income_ratio": round(lti, 2),
        "disposable_income": round(disposable, 2),
        "savings_ratio": round(savings_ratio, 2),
        "credit_utilization": round(credit_util, 2),
        "financial_stability_score": round(stability, 2),
        "calculated_emi": round(emi, 2),
        "total_monthly_obligations": round(total_emi, 2),
        "loan_affordability_index": round(affordability, 2),
        "monthly_income": round(monthly_income, 2),
    }

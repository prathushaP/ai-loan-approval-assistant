from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class LoanApplicationIn(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    age: int = Field(..., ge=18, le=100)
    gender: str = "Prefer not to say"
    employment_type: str = "Salaried"
    years_employment: float = Field(0, ge=0, le=50)
    occupation: str = ""
    annual_income: float = Field(..., ge=0)
    monthly_expenses: float = Field(..., ge=0)
    savings: float = Field(0, ge=0)
    bank_balance: float = Field(0, ge=0)
    credit_score: float = Field(..., ge=300, le=850)
    existing_loans: float = Field(0, ge=0)
    monthly_emi: float = Field(0, ge=0)
    loan_amount: float = Field(..., ge=1000)
    loan_purpose: str = "Personal"
    loan_term: int = Field(36, ge=6, le=360)
    interest_rate: float = Field(8.5, ge=0, le=40)
    collateral_available: bool = False


class SimulateIn(BaseModel):
    annual_income: float
    loan_amount: float
    credit_score: float
    monthly_expenses: float
    savings: float
    bank_balance: float = 0
    monthly_emi: float = 0
    loan_term: int = 36
    interest_rate: float = 8.5
    years_employment: float = 5
    age: int = 35
    collateral_available: bool = False


class ChatIn(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    application_id: Optional[int] = None
    application: Optional[dict[str, Any]] = None


class AnalyzeIn(BaseModel):
    application: LoanApplicationIn
    persist: bool = True
    with_explanation: bool = True

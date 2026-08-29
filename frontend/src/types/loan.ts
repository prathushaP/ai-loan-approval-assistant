export interface LoanApplicationForm {
  full_name: string
  age: number
  gender: string
  employment_type: string
  years_employment: number
  occupation: string
  annual_income: number
  monthly_expenses: number
  savings: number
  bank_balance: number
  credit_score: number
  existing_loans: number
  monthly_emi: number
  loan_amount: number
  loan_purpose: string
  loan_term: number
  interest_rate: number
  collateral_available: boolean
}

export interface Kpis {
  debt_to_income_ratio: number
  loan_to_income_ratio: number
  disposable_income: number
  savings_ratio: number
  credit_utilization: number
  financial_stability_score: number
  calculated_emi: number
  total_monthly_obligations: number
  loan_affordability_index: number
  monthly_income: number
}

export interface Prediction {
  approval_probability: number
  risk_score: number
  risk_category: string
  model_used: string
  decision_support: string
}

export interface Explanation {
  executive_summary: string
  reasoning: string
  strengths: string[]
  weaknesses: string[]
  potential_risks: string[]
  business_recommendation: string
  suggested_loan_amount: number
  suggested_interest_rate: number
  loan_officer_notes: string
  source?: string
}

export interface LoanApplication extends LoanApplicationForm {
  id?: number | null
  kpis?: Kpis
  prediction?: Prediction
  explanation?: Explanation
  created_at?: string
  updated_at?: string
}

export interface DashboardStats {
  total_applications: number
  average_credit_score: number
  average_risk: number
  average_approval_probability: number
  average_debt_ratio: number
  recent: LoanApplication[]
}

export const defaultForm: LoanApplicationForm = {
  full_name: '',
  age: 35,
  gender: 'Prefer not to say',
  employment_type: 'Salaried',
  years_employment: 5,
  occupation: '',
  annual_income: 75000,
  monthly_expenses: 2500,
  savings: 20000,
  bank_balance: 12000,
  credit_score: 720,
  existing_loans: 0,
  monthly_emi: 0,
  loan_amount: 50000,
  loan_purpose: 'Home Improvement',
  loan_term: 36,
  interest_rate: 8.5,
  collateral_available: false,
}

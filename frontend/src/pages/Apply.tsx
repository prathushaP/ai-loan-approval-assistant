import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { defaultForm, type LoanApplicationForm } from '../types/loan'
import { Button, Card, Input, Label, Select, Spinner } from '../components/ui'
import { useToast } from '../hooks/useToast'

export default function Apply() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LoanApplicationForm>({ defaultValues: defaultForm })
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const nav = useNavigate()

  async function onSubmit(data: LoanApplicationForm) {
    setLoading(true)
    try {
      const payload = {
        ...data,
        age: Number(data.age),
        years_employment: Number(data.years_employment),
        annual_income: Number(data.annual_income),
        monthly_expenses: Number(data.monthly_expenses),
        savings: Number(data.savings),
        bank_balance: Number(data.bank_balance),
        credit_score: Number(data.credit_score),
        existing_loans: Number(data.existing_loans),
        monthly_emi: Number(data.monthly_emi),
        loan_amount: Number(data.loan_amount),
        loan_term: Number(data.loan_term),
        interest_rate: Number(data.interest_rate),
        collateral_available: Boolean(data.collateral_available),
      }
      const res = await api.analyze(payload, true)
      toast.push('Application analyzed and saved', 'ok')
      nav(`/applications/${res.id}`)
    } catch (e) {
      toast.push(e instanceof Error ? e.message : 'Submit failed', 'err')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Loan Application</h1>
        <p className="text-sm text-slate-500">Capture applicant, financial, and loan details for decision support.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="space-y-4 p-6">
          <h2 className="font-semibold text-blue-800 dark:text-blue-300">Applicant Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Full Name</Label><Input {...register('full_name', { required: true, minLength: 2 })} />{errors.full_name && <p className="text-xs text-red-600">Required</p>}</div>
            <div><Label>Age</Label><Input type="number" {...register('age', { required: true, min: 18, max: 100 })} /></div>
            <div><Label>Gender</Label><Select {...register('gender')}><option>Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option></Select></div>
            <div><Label>Employment Type</Label><Select {...register('employment_type')}><option>Salaried</option><option>Self-Employed</option><option>Business Owner</option><option>Contract</option><option>Unemployed</option></Select></div>
            <div><Label>Years of Employment</Label><Input type="number" step="0.1" {...register('years_employment', { min: 0 })} /></div>
            <div className="sm:col-span-2"><Label>Occupation</Label><Input {...register('occupation')} /></div>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-semibold text-blue-800 dark:text-blue-300">Financial Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Annual Income</Label><Input type="number" {...register('annual_income', { required: true, min: 0 })} /></div>
            <div><Label>Monthly Expenses</Label><Input type="number" {...register('monthly_expenses', { required: true, min: 0 })} /></div>
            <div><Label>Savings</Label><Input type="number" {...register('savings', { min: 0 })} /></div>
            <div><Label>Current Bank Balance</Label><Input type="number" {...register('bank_balance', { min: 0 })} /></div>
            <div><Label>Credit Score</Label><Input type="number" {...register('credit_score', { required: true, min: 300, max: 850 })} /></div>
            <div><Label>Existing Loans</Label><Input type="number" {...register('existing_loans', { min: 0 })} /></div>
            <div><Label>Monthly EMI (existing)</Label><Input type="number" {...register('monthly_emi', { min: 0 })} /></div>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-semibold text-blue-800 dark:text-blue-300">Loan Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Loan Amount</Label><Input type="number" {...register('loan_amount', { required: true, min: 1000 })} /></div>
            <div><Label>Loan Purpose</Label><Select {...register('loan_purpose')}><option>Home Improvement</option><option>Personal</option><option>Education</option><option>Vehicle</option><option>Business</option><option>Debt Consolidation</option><option>Medical</option></Select></div>
            <div><Label>Loan Term (months)</Label><Input type="number" {...register('loan_term', { min: 6, max: 360 })} /></div>
            <div><Label>Interest Rate (%)</Label><Input type="number" step="0.01" {...register('interest_rate', { min: 0, max: 40 })} /></div>
            <div className="flex items-center gap-2 pt-6">
              <input id="col" type="checkbox" className="h-4 w-4 rounded" {...register('collateral_available')} />
              <label htmlFor="col" className="text-sm font-medium">Collateral Available</label>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={loading}>{loading ? <Spinner /> : null} Submit for Analysis</Button>
          <Button type="button" variant="outline" onClick={() => reset(defaultForm)}>Reset</Button>
        </div>
      </form>
    </div>
  )
}

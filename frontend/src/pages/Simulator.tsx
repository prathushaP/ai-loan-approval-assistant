import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import type { Kpis, Prediction } from '../types/loan'
import { Card, Label, Progress, Badge, Spinner } from '../components/ui'
import { money, pct } from '../lib/utils'

type SimState = {
  annual_income: number
  loan_amount: number
  credit_score: number
  monthly_expenses: number
  savings: number
}

const defaults: SimState = {
  annual_income: 75000,
  loan_amount: 50000,
  credit_score: 720,
  monthly_expenses: 2500,
  savings: 20000,
}

export default function Simulator() {
  const [state, setState] = useState<SimState>(defaults)
  const [kpis, setKpis] = useState<Kpis | null>(null)
  const [pred, setPred] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      api.simulate({
        ...state,
        bank_balance: state.savings * 0.6,
        monthly_emi: 0,
        loan_term: 36,
        interest_rate: 8.5,
        years_employment: 5,
        age: 35,
        collateral_available: false,
      })
        .then((r) => { setKpis(r.kpis || null); setPred(r.prediction || null) })
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [state])

  const sliders: { key: keyof SimState; label: string; min: number; max: number; step: number }[] = [
    { key: 'annual_income', label: 'Annual Income', min: 15000, max: 300000, step: 1000 },
    { key: 'loan_amount', label: 'Loan Amount', min: 5000, max: 500000, step: 1000 },
    { key: 'credit_score', label: 'Credit Score', min: 300, max: 850, step: 5 },
    { key: 'monthly_expenses', label: 'Monthly Expenses', min: 500, max: 20000, step: 100 },
    { key: 'savings', label: 'Savings', min: 0, max: 500000, step: 1000 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scenario Simulator</h1>
        <p className="text-sm text-slate-500">Instantly recalculate approval probability, risk, EMI, and debt ratios.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-6">
          {sliders.map((s) => (
            <div key={s.key}>
              <div className="mb-2 flex items-center justify-between">
                <Label>{s.label}</Label>
                <span className="text-sm font-semibold">{s.key.includes('score') ? state[s.key] : money(state[s.key])}</span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={state[s.key]}
                onChange={(e) => setState({ ...state, [s.key]: Number(e.target.value) })}
                className="w-full accent-blue-700"
              />
            </div>
          ))}
        </Card>
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Live Outcomes</h2>
              {loading && <Spinner />}
            </div>
            {pred && kpis ? (
              <motion.div key={`${pred.approval_probability}-${kpis.debt_to_income_ratio}`} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="mt-4 space-y-4">
                <div>
                  <div className="text-xs uppercase text-slate-500">Approval Probability</div>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{pct(pred.approval_probability)}</div>
                  <div className="mt-2"><Progress value={pred.approval_probability} /></div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={pred.risk_category === 'Low' ? 'green' : pred.risk_category === 'High' ? 'red' : 'amber'}>{pred.risk_category} Risk</Badge>
                  <span className="text-sm text-slate-500">Score {pred.risk_score}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><div className="text-xs text-slate-500">EMI</div><div className="font-bold">{money(kpis.calculated_emi)}</div></div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><div className="text-xs text-slate-500">DTI</div><div className="font-bold">{pct(kpis.debt_to_income_ratio)}</div></div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><div className="text-xs text-slate-500">LTI</div><div className="font-bold">{pct(kpis.loan_to_income_ratio)}</div></div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><div className="text-xs text-slate-500">Stability</div><div className="font-bold">{kpis.financial_stability_score.toFixed(1)}</div></div>
                </div>
              </motion.div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Adjust sliders to simulate…</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

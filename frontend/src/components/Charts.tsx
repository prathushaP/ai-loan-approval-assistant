import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Kpis, LoanApplication, Prediction } from '../types/loan'
import { Card, Progress, Badge } from './ui'
import { money, pct } from '../lib/utils'

const COLORS = ['#1d4ed8', '#0f172a', '#64748b', '#38bdf8', '#22c55e', '#f59e0b']

export function KpiGrid({ kpis, prediction }: { kpis?: Kpis; prediction?: Prediction }) {
  if (!kpis) return null
  const items = [
    { label: 'DTI Ratio', value: pct(kpis.debt_to_income_ratio) },
    { label: 'LTI Ratio', value: pct(kpis.loan_to_income_ratio) },
    { label: 'Disposable Income', value: money(kpis.disposable_income) },
    { label: 'Savings Ratio', value: pct(kpis.savings_ratio) },
    { label: 'Credit Utilization', value: pct(kpis.credit_utilization) },
    { label: 'Stability Score', value: kpis.financial_stability_score.toFixed(1) },
    { label: 'Calculated EMI', value: money(kpis.calculated_emi) },
    { label: 'Affordability Index', value: kpis.loan_affordability_index.toFixed(1) },
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <Card key={i.label} className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{i.label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{i.value}</div>
        </Card>
      ))}
      {prediction && (
        <Card className="p-4 sm:col-span-2 lg:col-span-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approval Probability</div>
              <div className="mt-1 text-3xl font-bold text-blue-700 dark:text-blue-400">{pct(prediction.approval_probability)}</div>
            </div>
            <Badge tone={prediction.risk_category === 'Low' ? 'green' : prediction.risk_category === 'High' ? 'red' : 'amber'}>
              {prediction.risk_category} Risk · {prediction.risk_score}
            </Badge>
          </div>
          <div className="mt-3"><Progress value={prediction.approval_probability} /></div>
        </Card>
      )}
    </div>
  )
}

export function AnalysisCharts({ app }: { app: LoanApplication }) {
  const k = app.kpis
  const p = app.prediction
  if (!k || !p) return null
  const incomeExp = [
    { name: 'Monthly Income', value: k.monthly_income },
    { name: 'Expenses', value: app.monthly_expenses },
    { name: 'Total EMI', value: k.total_monthly_obligations },
  ]
  const debt = [
    { name: 'New EMI', value: k.calculated_emi },
    { name: 'Existing EMI', value: app.monthly_emi },
    { name: 'Residual', value: Math.max(0, k.monthly_income - k.total_monthly_obligations - app.monthly_expenses) },
  ]
  const radar = [
    { metric: 'Credit', value: (app.credit_score / 850) * 100 },
    { metric: 'Stability', value: k.financial_stability_score },
    { metric: 'Affordability', value: k.loan_affordability_index },
    { metric: 'Savings', value: Math.min(100, k.savings_ratio) },
    { metric: 'Approval', value: p.approval_probability },
    { metric: 'Low DTI', value: Math.max(0, 100 - k.debt_to_income_ratio) },
  ]
  const loanComp = [
    { name: 'Principal', value: app.loan_amount },
    { name: 'Savings', value: app.savings },
    { name: 'Balance', value: app.bank_balance },
  ]
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Income vs Expenses</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeExp}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {incomeExp.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Debt Breakdown</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={debt} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {debt.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Financial Radar</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radar}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <Radar dataKey="value" stroke="#1d4ed8" fill="#3b82f6" fillOpacity={0.35} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Loan Composition</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loanComp} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1e3a8a" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-3">
          <Meter label="Credit Score" value={(app.credit_score / 850) * 100} display={`${app.credit_score}`} />
          <Meter label="Stability Gauge" value={k.financial_stability_score} display={k.financial_stability_score.toFixed(0)} />
          <Meter label="Risk Indicator" value={p.risk_score} display={`${p.risk_category}`} inverse />
        </div>
      </Card>
    </div>
  )
}

function Meter({ label, value, display, inverse }: { label: string; value: number; display: string; inverse?: boolean }) {
  const tone = inverse ? (value < 35 ? 'text-emerald-600' : value < 65 ? 'text-amber-600' : 'text-red-600') : 'text-blue-700 dark:text-blue-400'
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${tone}`}>{display}</div>
      <div className="mt-2"><Progress value={value} /></div>
    </div>
  )
}

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

const COLORS = ['#60a5fa', '#93c5fd', '#38bdf8', '#34d399', '#fbbf24', '#a78bfa']
const tick = { fontSize: 11, fill: 'currentColor' }
const tooltipStyle = {
  backgroundColor: 'var(--tooltip-bg, #fff)',
  border: '1px solid var(--tooltip-border, #e2e8f0)',
  borderRadius: 12,
  color: 'var(--tooltip-fg, #0f172a)',
}

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
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{i.label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{i.value}</div>
        </Card>
      ))}
      {prediction && (
        <Card className="p-4 sm:col-span-2 lg:col-span-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Approval Probability</div>
              <div className="mt-1 text-3xl font-bold text-blue-700 dark:text-sky-300">{pct(prediction.approval_probability)}</div>
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
    <div className="grid gap-4 lg:grid-cols-2 text-slate-600 dark:text-slate-300 dark:[--tooltip-bg:#152033] dark:[--tooltip-border:#3b4b63] dark:[--tooltip-fg:#eef3fb]">
      <Card className="p-4">
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Income vs Expenses</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeExp}>
              <XAxis dataKey="name" tick={tick} />
              <YAxis tick={tick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {incomeExp.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Debt Breakdown</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={debt} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {debt.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Financial Radar</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radar}>
              <PolarGrid stroke="#64748b" />
              <PolarAngleAxis dataKey="metric" tick={tick} />
              <Radar dataKey="value" stroke="#60a5fa" fill="#3b82f6" fillOpacity={0.4} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Loan Composition</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loanComp} layout="vertical">
              <XAxis type="number" tick={tick} />
              <YAxis type="category" dataKey="name" width={70} tick={tick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#60a5fa" radius={[0, 8, 8, 0]} />
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
  const tone = inverse
    ? (value < 35 ? 'text-emerald-600 dark:text-emerald-400' : value < 65 ? 'text-amber-600 dark:text-amber-300' : 'text-red-600 dark:text-red-400')
    : 'text-blue-700 dark:text-sky-300'
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${tone}`}>{display}</div>
      <div className="mt-2"><Progress value={value} /></div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FilePlus2, History, Wand2 } from 'lucide-react'
import { api } from '../services/api'
import type { DashboardStats } from '../types/loan'
import { Badge, Button, Card, Spinner } from '../components/ui'
import { money, pct } from '../lib/utils'

export default function Dashboard() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error) return <Card className="p-6 text-red-600">Backend unreachable: {error}. Start the API on port 8000 or set VITE_API_URL.</Card>
  if (!data) return null

  const kpis = [
    { label: 'Total Applications', value: data.total_applications },
    { label: 'Avg Credit Score', value: data.average_credit_score.toFixed(0) },
    { label: 'Avg Risk', value: data.average_risk.toFixed(1) },
    { label: 'Avg Approval Prob.', value: pct(data.average_approval_probability) },
    { label: 'Avg Debt Ratio', value: pct(data.average_debt_ratio) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Credit Operations Dashboard</h1>
          <p className="text-sm text-slate-500">Portfolio snapshot for loan officers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/apply"><Button><FilePlus2 size={16} /> New Application</Button></Link>
          <Link to="/history"><Button variant="outline"><History size={16} /> History</Button></Link>
          <Link to="/simulator"><Button variant="ghost"><Wand2 size={16} /> Simulator</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k.label}</div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{k.value}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 font-semibold dark:border-slate-700">Recent Applications</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Loan</th>
                <th className="px-4 py-3">Credit</th>
                <th className="px-4 py-3">Approval</th>
                <th className="px-4 py-3">Risk</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No applications yet. Create one to populate KPIs.</td></tr>
              )}
              {data.recent.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium"><Link className="text-blue-700 hover:underline" to={`/applications/${r.id}`}>{r.full_name}</Link></td>
                  <td className="px-4 py-3">{money(r.loan_amount)}</td>
                  <td className="px-4 py-3">{r.credit_score}</td>
                  <td className="px-4 py-3">{pct(r.prediction?.approval_probability)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={r.prediction?.risk_category === 'Low' ? 'green' : r.prediction?.risk_category === 'High' ? 'red' : 'amber'}>
                      {r.prediction?.risk_category || '—'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

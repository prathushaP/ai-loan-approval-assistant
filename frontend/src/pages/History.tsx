import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import type { LoanApplication } from '../types/loan'
import { Badge, Button, Card, Input, Select, Spinner } from '../components/ui'
import { money, pct } from '../lib/utils'
import { useToast } from '../hooks/useToast'

export default function History() {
  const [rows, setRows] = useState<LoanApplication[]>([])
  const [q, setQ] = useState('')
  const [risk, setRisk] = useState('')
  const [sort, setSort] = useState('created_at')
  const [order, setOrder] = useState('desc')
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      setRows(await api.list({ q: q || undefined, risk: risk || undefined, sort, order }))
    } catch (e) {
      toast.push(e instanceof Error ? e.message : 'Load failed', 'err')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [sort, order, risk])

  async function remove(id?: number | null) {
    if (!id || !confirm('Delete this application?')) return
    await api.remove(id)
    toast.push('Deleted', 'ok')
    void load()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Application History</h1>
          <p className="text-sm text-slate-500">Search, filter, export, and manage cases</p>
        </div>
        <a href={api.csvUrl()} target="_blank" rel="noreferrer"><Button variant="outline"><Download size={16} /> Export CSV</Button></a>
      </div>
      <Card className="grid gap-3 p-4 md:grid-cols-4">
        <Input placeholder="Search name, occupation, purpose…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void load()} />
        <Select value={risk} onChange={(e) => setRisk(e.target.value)}>
          <option value="">All risk levels</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="created_at">Sort: Date</option>
          <option value="full_name">Sort: Name</option>
          <option value="credit_score">Sort: Credit</option>
          <option value="loan_amount">Sort: Loan</option>
          <option value="annual_income">Sort: Income</option>
        </Select>
        <div className="flex gap-2">
          <Select value={order} onChange={(e) => setOrder(e.target.value)}><option value="desc">Desc</option><option value="asc">Asc</option></Select>
          <Button onClick={() => void load()}>Apply</Button>
        </div>
      </Card>
      {loading ? <div className="flex justify-center py-16"><Spinner /></div> : (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Loan</th>
                <th className="px-4 py-3">Credit</th>
                <th className="px-4 py-3">Approval</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{r.id}</td>
                  <td className="px-4 py-3 font-medium"><Link className="text-blue-700 hover:underline" to={`/applications/${r.id}`}>{r.full_name}</Link></td>
                  <td className="px-4 py-3">{money(r.loan_amount)}</td>
                  <td className="px-4 py-3">{r.credit_score}</td>
                  <td className="px-4 py-3">{pct(r.prediction?.approval_probability)}</td>
                  <td className="px-4 py-3"><Badge tone={r.prediction?.risk_category === 'Low' ? 'green' : r.prediction?.risk_category === 'High' ? 'red' : 'amber'}>{r.prediction?.risk_category}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a href={api.pdfUrl(r.id!)} target="_blank" rel="noreferrer"><Button variant="ghost" className="px-2 py-1"><Download size={14} /></Button></a>
                      <Button variant="ghost" className="px-2 py-1 text-red-600" onClick={() => void remove(r.id)}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No applications found</td></tr>}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

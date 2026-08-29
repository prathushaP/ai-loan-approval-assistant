import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Download, Pencil, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import type { LoanApplication, LoanApplicationForm } from '../types/loan'
import { AnalysisCharts, KpiGrid } from '../components/Charts'
import ChatPanel from '../components/ChatPanel'
import { Button, Card, Input, Label, Spinner } from '../components/ui'
import { money } from '../lib/utils'
import { useToast } from '../hooks/useToast'

export default function Detail() {
  const { id } = useParams()
  const [app, setApp] = useState<LoanApplication | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<LoanApplicationForm | null>(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const nav = useNavigate()

  useEffect(() => {
    if (!id) return
    api.get(Number(id)).then((a) => { setApp(a); setForm(a) }).catch((e) => toast.push(e.message, 'err')).finally(() => setLoading(false))
  }, [id])

  async function save() {
    if (!form || !id) return
    try {
      const updated = await api.update(Number(id), {
        ...form,
        age: Number(form.age),
        years_employment: Number(form.years_employment),
        annual_income: Number(form.annual_income),
        monthly_expenses: Number(form.monthly_expenses),
        savings: Number(form.savings),
        bank_balance: Number(form.bank_balance),
        credit_score: Number(form.credit_score),
        existing_loans: Number(form.existing_loans),
        monthly_emi: Number(form.monthly_emi),
        loan_amount: Number(form.loan_amount),
        loan_term: Number(form.loan_term),
        interest_rate: Number(form.interest_rate),
      })
      setApp(updated)
      setEditing(false)
      toast.push('Updated', 'ok')
    } catch (e) {
      toast.push(e instanceof Error ? e.message : 'Update failed', 'err')
    }
  }

  async function remove() {
    if (!id || !confirm('Delete application?')) return
    await api.remove(Number(id))
    toast.push('Deleted', 'ok')
    nav('/history')
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!app) return <Card className="p-6">Not found</Card>
  const exp = app.explanation

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/history" className="text-xs font-semibold text-blue-700">← History</Link>
          <h1 className="text-2xl font-bold">{app.full_name}</h1>
          <p className="text-sm text-slate-500">{app.occupation || 'Applicant'} · {money(app.loan_amount)} · {app.loan_purpose}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={api.pdfUrl(app.id!)} target="_blank" rel="noreferrer"><Button variant="outline"><Download size={16} /> PDF</Button></a>
          <Button variant="ghost" onClick={() => setEditing((e) => !e)}><Pencil size={16} /> Edit</Button>
          <Button variant="danger" onClick={() => void remove()}><Trash2 size={16} /> Delete</Button>
        </div>
      </div>

      {editing && form && (
        <Card className="grid gap-3 p-4 sm:grid-cols-3">
          {(['full_name','annual_income','monthly_expenses','savings','bank_balance','credit_score','monthly_emi','loan_amount','interest_rate','loan_term'] as const).map((k) => (
            <div key={k}><Label>{k}</Label><Input value={String(form[k] ?? '')} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
          ))}
          <div className="sm:col-span-3 flex gap-2"><Button onClick={() => void save()}>Save & Re-analyze</Button><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button></div>
        </Card>
      )}

      <KpiGrid kpis={app.kpis} prediction={app.prediction} />
      <AnalysisCharts app={app} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">AI Explanation</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{exp?.executive_summary}</p>
          <p className="text-sm"><span className="font-semibold">Reasoning:</span> {exp?.reasoning}</p>
          <div><div className="text-xs font-semibold uppercase text-slate-500">Strengths</div><ul className="mt-1 list-disc pl-5 text-sm">{(exp?.strengths || []).map((s) => <li key={s}>{s}</li>)}</ul></div>
          <div><div className="text-xs font-semibold uppercase text-slate-500">Weaknesses</div><ul className="mt-1 list-disc pl-5 text-sm">{(exp?.weaknesses || []).map((s) => <li key={s}>{s}</li>)}</ul></div>
          <div><div className="text-xs font-semibold uppercase text-slate-500">Potential Risks</div><ul className="mt-1 list-disc pl-5 text-sm">{(exp?.potential_risks || []).map((s) => <li key={s}>{s}</li>)}</ul></div>
          <p className="text-sm"><span className="font-semibold">Recommendation:</span> {exp?.business_recommendation}</p>
          <p className="text-sm">Suggested amount {money(exp?.suggested_loan_amount)} @ {exp?.suggested_interest_rate}%</p>
          <p className="text-sm text-slate-500">{exp?.loan_officer_notes}</p>
        </Card>
        <ChatPanel app={app} />
      </div>
    </div>
  )
}

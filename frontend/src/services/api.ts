import type { DashboardStats, LoanApplication, LoanApplicationForm } from '../types/loan'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res as unknown as T
}

export const api = {
  base: API_BASE,
  health: () => request<{ status: string }>('/health'),
  dashboard: () => request<DashboardStats>('/api/dashboard'),
  analyze: (application: LoanApplicationForm, persist = true) =>
    request<LoanApplication>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ application, persist, with_explanation: true }),
    }),
  simulate: (body: Partial<LoanApplicationForm>) =>
    request<{ kpis: LoanApplication['kpis']; prediction: LoanApplication['prediction'] }>('/api/simulate', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  list: (params?: { q?: string; risk?: string; sort?: string; order?: string }) => {
    const sp = new URLSearchParams()
    if (params?.q) sp.set('q', params.q)
    if (params?.risk) sp.set('risk', params.risk)
    if (params?.sort) sp.set('sort', params.sort)
    if (params?.order) sp.set('order', params.order)
    const qs = sp.toString()
    return request<LoanApplication[]>(`/api/applications${qs ? `?${qs}` : ''}`)
  },
  get: (id: number) => request<LoanApplication>(`/api/applications/${id}`),
  update: (id: number, application: LoanApplicationForm) =>
    request<LoanApplication>(`/api/applications/${id}`, { method: 'PUT', body: JSON.stringify(application) }),
  remove: (id: number) => request<{ ok: boolean }>(`/api/applications/${id}`, { method: 'DELETE' }),
  chat: (message: string, application_id?: number, application?: LoanApplication) =>
    request<{ reply: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, application_id, application }),
    }),
  pdfUrl: (id: number) => `${API_BASE}/api/applications/${id}/pdf`,
  csvUrl: () => `${API_BASE}/api/export/csv`,
}

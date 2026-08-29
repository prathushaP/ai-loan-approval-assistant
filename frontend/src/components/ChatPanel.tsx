import { useState } from 'react'
import { Send } from 'lucide-react'
import { api } from '../services/api'
import type { LoanApplication } from '../types/loan'
import { Button, Card, Input, Spinner } from './ui'

const suggestions = [
  'Why is this application high risk?',
  'Explain the approval prediction.',
  'How can approval probability be improved?',
  'Should this customer receive a lower loan amount?',
]

export default function ChatPanel({ app }: { app: LoanApplication }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'I can explain risk, KPIs, and recommendations for this application. Ask anything.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send(text: string) {
    if (!text.trim() || loading) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const res = await api.chat(text, app.id ?? undefined, app)
      setMessages((m) => [...m, { role: 'ai', text: res.reply }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'ai', text: e instanceof Error ? e.message : 'Chat failed' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="flex h-[420px] flex-col overflow-hidden">
      <div className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900 dark:border-slate-600 dark:text-white">AI Loan Officer Assistant</div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-blue-700 text-white dark:bg-blue-600'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300"><Spinner /> Thinking…</div>}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-slate-200 p-3 dark:border-slate-600">
        {suggestions.map((s) => (
          <button key={s} onClick={() => send(s)} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
            {s}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-600"
        onSubmit={(e) => {
          e.preventDefault()
          void send(input)
        }}
      >
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this application…" />
        <Button type="submit" disabled={loading}><Send size={16} /></Button>
      </form>
    </Card>
  )
}

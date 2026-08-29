import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type Toast = { id: number; message: string; type?: 'ok' | 'err' | 'info' }

const Ctx = createContext<{ push: (message: string, type?: Toast['type']) => void } | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now()
    setItems((t) => [...t, { id, message, type }])
    setTimeout(() => setItems((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  const value = useMemo(() => ({ push }), [push])
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl px-4 py-3 text-sm shadow-lg border backdrop-blur ${
              t.type === 'err'
                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-700 dark:text-red-100'
                : t.type === 'ok'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-100'
                  : 'bg-white border-slate-200 text-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:border-slate-600'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast requires provider')
  return ctx
}

import { cn } from '../lib/utils'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:bg-[#121a2b] dark:border-slate-600/80 dark:text-slate-100 dark:shadow-black/30', className)}>
      {children}
    </div>
  )
}

export function Button({ className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'outline' | 'danger' }) {
  const styles = {
    primary: 'bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-700/20 dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-blue-900/40',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-100',
    outline: 'border border-slate-300 dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-500',
  }
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-50', styles[variant], className)}
      {...props}
    />
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/30 dark:bg-[#0d1524] dark:border-slate-500 dark:text-slate-50 dark:placeholder:text-slate-400 dark:focus:ring-blue-400/40', className)}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn('w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/30 dark:bg-[#0d1524] dark:border-slate-500 dark:text-slate-50 dark:focus:ring-blue-400/40', className)}
      {...props}
    >
      {children}
    </select>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{children}</label>
}

export function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'green' | 'amber' | 'red' | 'slate' }) {
  const map = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/70 dark:text-blue-100 dark:ring-1 dark:ring-blue-400/30',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-100 dark:ring-1 dark:ring-emerald-400/30',
    amber: 'bg-amber-50 text-amber-800 dark:bg-amber-900/70 dark:text-amber-100 dark:ring-1 dark:ring-amber-400/30',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/70 dark:text-red-100 dark:ring-1 dark:ring-red-400/30',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:ring-1 dark:ring-slate-400/20',
  }
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', map[tone])}>{children}</span>
}

export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
      <div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-500 dark:to-sky-400 transition-all duration-500" style={{ width: `${v}%` }} />
    </div>
  )
}

export function Spinner() {
  return <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent" />
}

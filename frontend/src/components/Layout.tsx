import { NavLink, Outlet } from 'react-router-dom'
import { Building2, FileText, Gauge, History, Home, MessageSquare, Moon, Sun, Wand2 } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'
import { Button } from './ui'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/apply', label: 'New Application', icon: FileText },
  { to: '/history', label: 'History', icon: History },
  { to: '/simulator', label: 'Simulator', icon: Wand2 },
]

export default function Layout() {
  const { dark, toggle } = useTheme()
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:bg-slate-950/80 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-800 to-blue-600 text-white shadow-lg shadow-blue-700/30">
              <Building2 size={20} />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">AI Loan Approval Assistant</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Banking decision support · not auto-approval</div>
            </div>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                  )
                }
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </nav>
          <Button variant="ghost" onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>
        <div className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => cn('whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold', isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800')}>
              {label}
            </NavLink>
          ))}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/70 py-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        © {new Date().getFullYear()} AI Loan Approval Assistant · Portfolio project by Prathusha · Decision support only
        <div className="mt-2 inline-flex items-center gap-1"><MessageSquare size={12} /> Gemini-powered explanations when API key is configured</div>
      </footer>
    </div>
  )
}

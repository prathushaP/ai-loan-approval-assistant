import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Brain, FileDown, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Button, Card } from '../components/ui'

const features = [
  { icon: Brain, title: 'ML Decision Support', desc: 'Logistic Regression & Random Forest predict approval probability and risk — never auto-approve.' },
  { icon: Sparkles, title: 'Explainable AI', desc: 'Google Gemini generates executive summaries, strengths, risks, and officer notes.' },
  { icon: BarChart3, title: 'Banking KPIs', desc: 'DTI, LTI, EMI, stability score, affordability index, and more in real time.' },
  { icon: slidersIcon, title: 'Scenario Simulator', desc: 'Tune income, loan amount, credit score, expenses, and savings with live updates.' },
  { icon: FileDown, title: 'PDF & CSV Export', desc: 'Professional credit reports and portfolio CSV exports for audit trails.' },
  { icon: ShieldCheck, title: 'Officer Workflow', desc: 'History, search, filter, edit, delete, and AI chat grounded in application data.' },
]

function slidersIcon(props: { size?: number }) {
  return <SlidersHorizontal {...props} />
}

export default function Landing() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-200">Modern banking analytics · Portfolio quality</div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            AI Loan Approval <span className="bg-gradient-to-r from-blue-800 to-blue-500 bg-clip-text text-transparent">Assistant</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Help loan officers evaluate applications with ML predictions, banking KPIs, Gemini explanations, scenario simulation, and professional PDF reports — without replacing human judgment.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/apply"><Button>Start Application</Button></Link>
            <Link to="/dashboard"><Button variant="outline">Open Dashboard</Button></Link>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="grid gap-4 sm:grid-cols-2">
          {['Approval Probability', 'Risk Category', 'Financial Stability', 'AI Recommendations'].map((t, i) => (
            <Card key={t} className="p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t}</div>
              <div className="mt-2 text-2xl font-bold text-blue-800 dark:text-blue-300">{['78.4%', 'Low', '82.1', 'Conditional'][i]}</div>
              <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${[78, 30, 82, 65][i]}%` }} /></div>
            </Card>
          ))}
        </motion.div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Features</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><Icon size={20} /></div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Product Screens</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {['Dashboard KPIs', 'Application Workspace', 'Scenario Simulator'].map((s) => (
            <Card key={s} className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-4 text-sm font-semibold text-slate-500 dark:from-slate-900 dark:to-slate-800">
              Screenshot placeholder · {s}
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Technology Stack</h2>
        <div className="flex flex-wrap gap-2">
          {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'FastAPI', 'Scikit-learn', 'SQLite', 'Gemini', 'ReportLab', 'Render', 'GitHub Pages'].map((t) => (
            <span key={t} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900">{t}</span>
          ))}
        </div>
      </section>

      <Card className="flex flex-col items-start justify-between gap-4 bg-gradient-to-r from-blue-900 to-blue-700 p-8 text-white md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Ready for credit committee review?</h2>
          <p className="mt-2 text-blue-100">Submit an application and generate a full decision-support pack in seconds.</p>
        </div>
        <Link to="/apply"><Button className="bg-white text-blue-900 hover:bg-blue-50">Launch Workspace</Button></Link>
      </Card>
    </div>
  )
}

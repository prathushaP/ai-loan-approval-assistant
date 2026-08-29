import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ToastProvider } from './hooks/useToast'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Apply from './pages/Apply'
import History from './pages/History'
import Detail from './pages/Detail'
import Simulator from './pages/Simulator'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="apply" element={<Apply />} />
            <Route path="history" element={<History />} />
            <Route path="applications/:id" element={<Detail />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

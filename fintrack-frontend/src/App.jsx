import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'

function AppContent() {
  const { loading } = useAuth()
  const [page, setPage] = useState('login')

  const handleNavigate = (newPage) => {
    setPage(newPage)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center
                      justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500
                        border-t-transparent rounded-full"/>
      </div>
    )
  }

  if (page === 'login') return <Login onNavigate={handleNavigate} />
  if (page === 'register') return <Register onNavigate={handleNavigate} />
  if (page === 'dashboard') return <Dashboard onNavigate={handleNavigate} />
  if (page === 'transactions') return <Transactions onNavigate={handleNavigate} />
  if (page === 'budgets') return <Budgets onNavigate={handleNavigate} />
  if (page === 'goals') return <Goals onNavigate={handleNavigate} />

  return (
    <div className="min-h-screen bg-slate-900 flex items-center
                    justify-center">
      <p className="text-white">Page coming soon...</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
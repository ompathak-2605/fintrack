import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'

function AppContent() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState(null)

  const handleNavigate = (newPage) => {
    setPage(newPage)
  }

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (page === null || page === 'login' || page === 'register') {
          setPage('dashboard')
        }
      } else {
        setPage('login')
      }
    }
  }, [loading, user])

  if (loading || page === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center
                      justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-2
                          border-indigo-500 border-t-transparent
                          rounded-full"/>
          <p className="text-slate-500 text-sm">Loading FinTrack...</p>
        </div>
      </div>
    )
  }

  if (page === 'login') return <Login onNavigate={handleNavigate} />
  if (page === 'register') return <Register onNavigate={handleNavigate} />
  if (page === 'dashboard') return <Dashboard onNavigate={handleNavigate} />
  if (page === 'transactions') return <Transactions onNavigate={handleNavigate} />
  if (page === 'budgets') return <Budgets onNavigate={handleNavigate} />
  if (page === 'goals') return <Goals onNavigate={handleNavigate} />

  return null
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
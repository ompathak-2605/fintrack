import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'

function AppContent() {
  const [page, setPage] = useState('login')

  const handleNavigate = (newPage) => {
    setPage(newPage)
  }

  if (page === 'login') {
    return <Login onNavigate={handleNavigate} />
  }

  if (page === 'register') {
    return <Register onNavigate={handleNavigate} />
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center
                    justify-center">
      <div className="text-center">
        <h1 className="text-white text-2xl font-bold mb-2">
          Welcome to FinTrack!
        </h1>
        <p className="text-slate-400">Dashboard coming next...</p>
      </div>
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
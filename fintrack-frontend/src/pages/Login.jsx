import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      const { data } = response.data
      login(data, data.token)
      onNavigate('dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong. Try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center 
                    justify-center p-4">

      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 
                        bg-indigo-500 rounded-full opacity-10 blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 
                        bg-purple-500 rounded-full opacity-10 blur-3xl"/>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl 
                          flex items-center justify-center shadow-lg
                          shadow-indigo-500/30">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">FinTrack</h1>
            <p className="text-xs text-slate-400">
              Smart Money Management
            </p>
          </div>
        </motion.div>

        {/* Card */}
        <div className="bg-slate-800 rounded-3xl p-8 border 
                        border-slate-700 shadow-2xl">

          <h2 className="text-xl font-semibold text-white mb-1">
            Welcome back
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Sign in to your account
          </p>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 
                         rounded-xl p-3 mb-4"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email input */}
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 
                                 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="om@fintrack.com"
                  required
                  className="w-full bg-slate-900 border border-slate-700 
                             rounded-xl py-3 pl-10 pr-4 text-white 
                             placeholder-slate-600 text-sm
                             focus:outline-none focus:border-indigo-500 
                             focus:ring-1 focus:ring-indigo-500
                             transition-all duration-200"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 
                                 text-slate-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-900 border border-slate-700 
                             rounded-xl py-3 pl-10 pr-10 text-white 
                             placeholder-slate-600 text-sm
                             focus:outline-none focus:border-indigo-500 
                             focus:ring-1 focus:ring-indigo-500
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 
                             text-slate-500 hover:text-slate-300 
                             transition-colors"
                >
                  {showPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-500 hover:bg-indigo-600 
                         disabled:bg-indigo-500/50 disabled:cursor-not-allowed
                         text-white font-semibold py-3 rounded-xl 
                         transition-all duration-200 mt-2
                         shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" 
                       viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" 
                            r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </motion.button>
          </form>

          {/* Register link */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-indigo-400 hover:text-indigo-300 
                         font-medium transition-colors"
            >
              Create one
            </button>
          </p>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Your financial data is encrypted and private
        </p>
      </motion.div>
    </div>
  )
}
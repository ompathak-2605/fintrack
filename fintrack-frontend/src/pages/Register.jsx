import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff,
  TrendingUp, User, Briefcase
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import MobileNav from '../components/layout/MobileNev'

const PERSONA_TYPES = [
  { value: 'STUDENT', label: '🎒 Student', desc: 'Managing pocket money' },
  { value: 'COLLEGE', label: '🎓 College', desc: 'Side hustle + allowance' },
  { value: 'BACHELOR', label: '💼 Working', desc: 'Full living expenses' },
  { value: 'FAMILY', label: '👨‍👩‍👧 Family', desc: 'Multiple incomes' },
  { value: 'PENSION', label: '🧓 Pension', desc: 'Fixed income planning' },
]

export default function Register({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    personaType: '',
    monthlyIncome: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePersonaSelect = (value) => {
    setFormData({ ...formData, personaType: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        personaType: formData.personaType || null,
        monthlyIncome: formData.monthlyIncome
          ? parseFloat(formData.monthlyIncome) : null,
      }

      const response = await api.post('/auth/register', payload)
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
    <div className="min-h-screen bg-slate-900 flex">
       <Sidebar currentPage="register" onNavigate={onNavigate} />
        <MobileNav currentPage="register" onNavigate={onNavigate} />
         <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-auto">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80
                        bg-indigo-500 rounded-full opacity-10 blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-80 h-80
                        bg-purple-500 rounded-full opacity-10 blur-3xl"/>
      </div>
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
            <p className="text-xs text-slate-400">Smart Money Management</p>
          </div>
        </motion.div>

        {/* Card */}
        <div className="bg-slate-800 rounded-3xl p-8 border
                        border-slate-700 shadow-2xl">

          <h2 className="text-xl font-semibold text-white mb-1">
            Create account
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Start tracking your finances today
          </p>

          {/* Error */}
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

            {/* Name */}
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2
                                 text-slate-500" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Om Pathak"
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

            {/* Email */}
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                                 text-slate-500" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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

            {/* Password */}
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                                 text-slate-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Persona selector */}
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                I am a... (optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERSONA_TYPES.map((persona) => (
                  <motion.button
                    key={persona.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePersonaSelect(persona.value)}
                    className={`p-3 rounded-xl border text-left
                      transition-all duration-200
                      ${formData.personaType === persona.value
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                      }`}
                  >
                    <div className="text-sm font-medium text-white">
                      {persona.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {persona.desc}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Monthly income */}
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Monthly income (optional)
              </label>
              <div className="relative">
                <Briefcase
                  className="absolute left-3 top-1/2 -translate-y-1/2
                             text-slate-500" size={18} />
                <span className="absolute left-10 top-1/2 -translate-y-1/2
                                 text-slate-500 text-sm">₹</span>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full bg-slate-900 border border-slate-700
                             rounded-xl py-3 pl-14 pr-4 text-white
                             placeholder-slate-600 text-sm
                             focus:outline-none focus:border-indigo-500
                             focus:ring-1 focus:ring-indigo-500
                             transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit */}
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
                  Creating account...
                </span>
              ) : 'Create account'}
            </motion.button>
          </form>

          {/* Login link */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-indigo-400 hover:text-indigo-300
                         font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Your financial data is encrypted and private
        </p>
      </motion.div>
    </div>
  )
}
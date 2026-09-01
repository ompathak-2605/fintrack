import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Save, ArrowLeft, Check } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import MobileNav from '../components/layout/MobileNav'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const PERSONA_TYPES = [
  { value: 'STUDENT', label: '🎒 Student' },
  { value: 'COLLEGE', label: '🎓 College' },
  { value: 'BACHELOR', label: '💼 Working' },
  { value: 'FAMILY', label: '👨‍👩‍👧 Family' },
  { value: 'PENSION', label: '🧓 Pension' },
]

export default function Profile({ onNavigate }) {
  const { user, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    personaType: user?.personaType || '',
    monthlyIncome: user?.monthlyIncome || '',
    currency: user?.currency || 'INR',
  })

  // Guard — if no user, redirect to login
  if (!user) {
    onNavigate('login')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.put('/users/profile', {
        name: formData.name,
        personaType: formData.personaType || null,
        monthlyIncome: formData.monthlyIncome
          ? parseFloat(formData.monthlyIncome) : null,
        currency: formData.currency,
      })

      const updatedUser = res.data.data
      const currentToken = localStorage.getItem('fintrack_token')
      login(updatedUser, currentToken)

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update profile'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar currentPage="profile" onNavigate={onNavigate} />
      <MobileNav currentPage="profile" onNavigate={onNavigate} />

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 flex items-center justify-center
                       rounded-xl bg-slate-800 border border-slate-700
                       text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Profile</h2>
            <p className="text-slate-400 text-sm mt-1">
              Manage your account settings
            </p>
          </div>
        </div>

        <div className="max-w-xl">

          {/* Avatar card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 rounded-2xl p-6 border
                       border-slate-700 mb-6 flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl
                            flex items-center justify-center
                            flex-shrink-0">
              <User size={28} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">
                {user?.name}
              </h3>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              {user?.personaType && (
                <span className="text-xs px-2 py-0.5 bg-indigo-500/20
                                 text-indigo-400 rounded-full mt-1
                                 inline-block">
                  {user.personaType}
                </span>
              )}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800 rounded-2xl p-6 border
                       border-slate-700"
          >
            <h3 className="text-white font-semibold mb-5">
              Edit Profile
            </h3>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30
                              rounded-xl p-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/10 border
                           border-emerald-500/30 rounded-xl p-3
                           mb-4 flex items-center gap-2"
              >
                <Check size={16} className="text-emerald-400" />
                <p className="text-emerald-400 text-sm">
                  Profile updated successfully
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label className="text-sm text-slate-400
                                  mb-1.5 block">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2
                                   -translate-y-1/2 text-slate-500"
                        size={18} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({
                      ...formData, name: e.target.value
                    })}
                    required
                    className="w-full bg-slate-900 border
                               border-slate-700 rounded-xl py-3
                               pl-10 pr-4 text-white text-sm
                               focus:outline-none
                               focus:border-indigo-500
                               focus:ring-1 focus:ring-indigo-500
                               transition-all"
                  />
                </div>
              </div>

              {/* Email — read only */}
              <div>
                <label className="text-sm text-slate-400
                                  mb-1.5 block">
                  Email address
                  <span className="text-slate-600 ml-2">
                    (cannot change)
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2
                                   -translate-y-1/2 text-slate-600"
                        size={18} />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-slate-900/50 border
                               border-slate-700/50 rounded-xl py-3
                               pl-10 pr-4 text-slate-500 text-sm
                               cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Persona type */}
              <div>
                <label className="text-sm text-slate-400
                                  mb-1.5 block">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PERSONA_TYPES.map((persona) => (
                    <motion.button
                      key={persona.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({
                        ...formData, personaType: persona.value
                      })}
                      className={`p-3 rounded-xl border text-left
                                 text-sm font-medium transition-all
                        ${formData.personaType === persona.value
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                        }`}
                    >
                      {persona.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Monthly income */}
              <div>
                <label className="text-sm text-slate-400
                                  mb-1.5 block">
                  Monthly income
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2
                                   -translate-y-1/2 text-slate-400
                                   text-sm">₹</span>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData({
                      ...formData, monthlyIncome: e.target.value
                    })}
                    placeholder="Your monthly income"
                    min="0"
                    className="w-full bg-slate-900 border
                               border-slate-700 rounded-xl py-3
                               pl-8 pr-4 text-white
                               placeholder-slate-600 text-sm
                               focus:outline-none
                               focus:border-indigo-500
                               focus:ring-1 focus:ring-indigo-500
                               transition-all"
                  />
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="text-sm text-slate-400
                                  mb-1.5 block">
                  Currency
                </label>
                <div className="flex gap-2">
                  {['INR', 'USD', 'EUR', 'GBP'].map((currency) => (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => setFormData({
                        ...formData, currency
                      })}
                      className={`px-4 py-2 rounded-xl text-sm
                                 font-medium transition-all border
                        ${formData.currency === currency
                          ? 'bg-indigo-500 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                        }`}
                    >
                      {currency}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-indigo-500 hover:bg-indigo-600
                           disabled:opacity-50 text-white font-semibold
                           py-3 rounded-xl transition-all duration-200
                           shadow-lg shadow-indigo-500/25 mt-2
                           flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4"
                       viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12"
                            r="10" stroke="currentColor"
                            strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
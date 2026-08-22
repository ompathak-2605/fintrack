import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Target, Trophy, Clock, TrendingUp } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import api from '../api/axios'
import { formatCurrency, formatDate } from '../utils/helpers'
import MobileNav from '../components/layout/MobileNev'

export default function Goals({ onNavigate }) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [contributeModal, setContributeModal] = useState(null)
  const [contributeAmount, setContributeAmount] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const res = await api.get('/goals')
      setGoals(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch goals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
      }
      await api.post('/goals', payload)
      fetchGoals()
      setModalOpen(false)
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create goal')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContribute = async () => {
    if (!contributeAmount || parseFloat(contributeAmount) <= 0) return
    setSubmitting(true)
    try {
      await api.patch(
        `/goals/${contributeModal.id}/contribute?amount=${contributeAmount}`
      )
      fetchGoals()
      setContributeModal(null)
      setContributeAmount('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to contribute')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/goals/${id}`)
      setGoals(prev => prev.filter(g => g.id !== id))
    } catch (err) {
      console.error('Failed to delete goal:', err)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', targetAmount: '', deadline: '', description: '' })
    setError('')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACHIEVED': return 'text-indigo-400'
      case 'AT_RISK': return 'text-amber-400'
      case 'OVERDUE': return 'text-red-400'
      default: return 'text-emerald-400'
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case 'ACHIEVED': return 'bg-indigo-500'
      case 'AT_RISK': return 'bg-amber-500'
      case 'OVERDUE': return 'bg-red-500'
      default: return 'bg-emerald-500'
    }
  }

  const activeGoals = goals.filter(g => !g.isAchieved)
  const achievedGoals = goals.filter(g => g.isAchieved)

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar currentPage="goals" onNavigate={onNavigate} />
      <MobileNav currentPage="goals" onNavigate={onNavigate} />

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Savings Goals
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {activeGoals.length} active •{' '}
              {achievedGoals.length} achieved
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5
                       bg-indigo-500 hover:bg-indigo-600
                       text-white font-medium rounded-xl
                       shadow-lg shadow-indigo-500/25
                       transition-all duration-200"
          >
            <Plus size={18} />
            New Goal
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i}
                   className="bg-slate-800 rounded-2xl p-6 border
                              border-slate-700 animate-pulse h-48"/>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-2xl
                            flex items-center justify-center
                            mx-auto mb-4">
              <Target size={24} className="text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No goals yet</p>
            <p className="text-slate-600 text-sm mt-1">
              Set a savings goal to get started
            </p>
          </motion.div>
        ) : (
          <>
            {/* Active goals */}
            {activeGoals.length > 0 && (
              <div className="mb-8">
                <h3 className="text-slate-400 text-sm font-medium
                               uppercase tracking-wider mb-4">
                  Active Goals
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <AnimatePresence>
                    {activeGoals.map((goal, index) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-slate-800 rounded-2xl p-6 border
                                   border-slate-700 hover:border-slate-600
                                   transition-all duration-200"
                      >
                        {/* Goal header */}
                        <div className="flex items-start
                                        justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">
                              {goal.name}
                            </h3>
                            {goal.description && (
                              <p className="text-slate-500 text-xs mt-0.5">
                                {goal.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <span className={`text-xs font-medium
                              ${getStatusColor(goal.status)}`}>
                              {goal.status}
                            </span>
                            <button
                              onClick={() => handleDelete(goal.id)}
                              className="w-7 h-7 flex items-center
                                         justify-center rounded-lg
                                         text-slate-600
                                         hover:text-red-400
                                         hover:bg-red-500/10
                                         transition-all ml-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Circular progress */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <svg className="w-16 h-16 -rotate-90"
                                 viewBox="0 0 64 64">
                              <circle
                                cx="32" cy="32" r="26"
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="6"
                              />
                              <motion.circle
                                cx="32" cy="32" r="26"
                                fill="none"
                                stroke={
                                  goal.status === 'AT_RISK'
                                    ? '#F59E0B'
                                    : goal.status === 'OVERDUE'
                                    ? '#EF4444'
                                    : '#10B981'
                                }
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 26}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                                animate={{
                                  strokeDashoffset: 2 * Math.PI * 26 *
                                    (1 - (goal.progressPercentage || 0) / 100)
                                }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center
                                            justify-center">
                              <span className="text-xs font-bold text-white">
                                {Math.round(goal.progressPercentage || 0)}%
                              </span>
                            </div>
                          </div>

                          <div className="flex-1">
                            <p className="text-slate-400 text-xs mb-1">
                              Saved
                            </p>
                            <p className="text-white font-bold text-lg">
                              {formatCurrency(goal.savedAmount)}
                            </p>
                            <p className="text-slate-500 text-xs">
                              of {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 bg-slate-700 rounded-full
                                        overflow-hidden mb-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(
                                goal.progressPercentage || 0, 100)}%`
                            }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full
                              ${getStatusBg(goal.status)}`}
                          />
                        </div>

                        {/* Info row */}
                        <div className="flex items-center justify-between
                                        mb-4">
                          <div className="flex items-center gap-1
                                          text-slate-500 text-xs">
                            <Clock size={12} />
                            <span>{goal.daysRemaining} days left</span>
                          </div>
                          <div className="flex items-center gap-1
                                          text-slate-500 text-xs">
                            <TrendingUp size={12} />
                            <span>
                              Save {formatCurrency(
                                goal.suggestedMonthlySaving)}/mo
                            </span>
                          </div>
                        </div>

                        {/* Contribute button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setContributeModal(goal)}
                          className="w-full py-2 bg-indigo-500/10
                                     hover:bg-indigo-500/20
                                     text-indigo-400 font-medium
                                     rounded-xl text-sm
                                     border border-indigo-500/20
                                     transition-all duration-200"
                        >
                          + Add Contribution
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Achieved goals */}
            {achievedGoals.length > 0 && (
              <div>
                <h3 className="text-slate-400 text-sm font-medium
                               uppercase tracking-wider mb-4">
                  Achieved 🎉
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {achievedGoals.map((goal) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-slate-800/50 rounded-2xl p-6 border
                                 border-indigo-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20
                                        rounded-xl flex items-center
                                        justify-center">
                          <Trophy size={18} className="text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">
                            {goal.name}
                          </h3>
                          <p className="text-indigo-400 text-xs mt-0.5">
                            {formatCurrency(goal.targetAmount)} achieved!
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="w-7 h-7 flex items-center
                                     justify-center rounded-lg
                                     text-slate-600 hover:text-red-400
                                     hover:bg-red-500/10 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center
                         justify-center p-4"
            >
              <div className="bg-slate-800 rounded-3xl border
                              border-slate-700 shadow-2xl w-full max-w-md">

                <div className="flex items-center justify-between p-6
                                border-b border-slate-700">
                  <h2 className="text-lg font-semibold text-white">
                    New Savings Goal
                  </h2>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center
                               rounded-lg text-slate-400
                               hover:text-white hover:bg-slate-700
                               transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30
                                    rounded-xl p-3">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-slate-400
                                      mb-1.5 block">
                      Goal name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({
                        ...formData, name: e.target.value
                      })}
                      placeholder="New laptop, Trip to Goa..."
                      required
                      className="w-full bg-slate-900 border border-slate-700
                                 rounded-xl py-3 px-4 text-white
                                 placeholder-slate-600 text-sm
                                 focus:outline-none focus:border-indigo-500
                                 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-400
                                      mb-1.5 block">
                      Target amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2
                                       -translate-y-1/2 text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({
                          ...formData, targetAmount: e.target.value
                        })}
                        placeholder="10000"
                        required
                        min="1"
                        className="w-full bg-slate-900 border border-slate-700
                                   rounded-xl py-3 pl-8 pr-4 text-white
                                   placeholder-slate-600 text-sm
                                   focus:outline-none focus:border-indigo-500
                                   transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400
                                      mb-1.5 block">
                      Target deadline
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({
                        ...formData, deadline: e.target.value
                      })}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-slate-900 border border-slate-700
                                 rounded-xl py-3 px-4 text-white text-sm
                                 focus:outline-none focus:border-indigo-500
                                 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-400
                                      mb-1.5 block">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({
                        ...formData, description: e.target.value
                      })}
                      placeholder="What is this goal for?"
                      className="w-full bg-slate-900 border border-slate-700
                                 rounded-xl py-3 px-4 text-white
                                 placeholder-slate-600 text-sm
                                 focus:outline-none focus:border-indigo-500
                                 transition-all"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-indigo-500 hover:bg-indigo-600
                               disabled:opacity-50 text-white font-semibold
                               py-3 rounded-xl transition-all
                               shadow-lg shadow-indigo-500/25"
                  >
                    {submitting ? 'Creating...' : 'Create Goal'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Contribute Modal */}
      <AnimatePresence>
        {contributeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContributeModal(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center
                         justify-center p-4"
            >
              <div className="bg-slate-800 rounded-3xl border
                              border-slate-700 shadow-2xl w-full max-w-sm">

                <div className="flex items-center justify-between p-6
                                border-b border-slate-700">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Add Contribution
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {contributeModal?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setContributeModal(null)}
                    className="w-8 h-8 flex items-center justify-center
                               rounded-lg text-slate-400
                               hover:text-white hover:bg-slate-700
                               transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-4">

                  {/* Progress reminder */}
                  <div className="bg-slate-900 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Current progress</span>
                      <span className="text-white font-medium">
                        {Math.round(
                          contributeModal?.progressPercentage || 0)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full
                                    overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            contributeModal?.progressPercentage || 0, 100)}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs
                                    text-slate-500 mt-2">
                      <span>
                        {formatCurrency(contributeModal?.savedAmount)}
                      </span>
                      <span>
                        {formatCurrency(contributeModal?.targetAmount)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">
                      Contribution amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2
                                       -translate-y-1/2 text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={contributeAmount}
                        onChange={(e) => setContributeAmount(e.target.value)}
                        placeholder="0.00"
                        min="1"
                        className="w-full bg-slate-900 border border-slate-700
                                   rounded-xl py-3 pl-8 pr-4 text-white
                                   placeholder-slate-600 text-sm
                                   focus:outline-none focus:border-indigo-500
                                   transition-all"
                      />
                    </div>
                    {contributeModal?.suggestedMonthlySaving > 0 && (
                      <p className="text-slate-500 text-xs mt-1.5">
                        Suggested: {formatCurrency(
                          contributeModal.suggestedMonthlySaving)}/month
                      </p>
                    )}
                  </div>

                  <motion.button
                    onClick={handleContribute}
                    disabled={submitting || !contributeAmount}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600
                               disabled:opacity-50 text-white font-semibold
                               py-3 rounded-xl transition-all
                               shadow-lg shadow-emerald-500/25"
                  >
                    {submitting ? 'Adding...' : 'Add Contribution'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
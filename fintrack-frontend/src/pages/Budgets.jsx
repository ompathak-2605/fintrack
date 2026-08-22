import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import api from '../api/axios'
import { formatCurrency } from '../utils/helpers'
import MobileNav from '../components/layout/MobileNev'

const PERIODS = ['DAILY', 'WEEKLY', 'MONTHLY']

export default function Budgets({ onNavigate }) {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    categoryId: '',
    limitAmount: '',
    period: 'MONTHLY',
    startDate: '',
    endDate: '',
    rolloverEnabled: false,
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchBudgets()
    fetchCategories()
    setDefaultDates()
  }, [])

  const setDefaultDates = () => {
    const now = new Date()
    const start = `${now.getFullYear()}-${String(
      now.getMonth() + 1).padStart(2, '0')}-01`
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString().split('T')[0]
    setFormData(prev => ({ ...prev, startDate: start, endDate: end }))
  }

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const res = await api.get('/budgets')
      setBudgets(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch budgets:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        categoryId: formData.categoryId
          ? parseInt(formData.categoryId) : null,
        limitAmount: parseFloat(formData.limitAmount),
      }
      await api.post('/budgets', payload)
      fetchBudgets()
      setModalOpen(false)
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create budget')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/budgets/${id}`)
      setBudgets(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      console.error('Failed to delete budget:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      categoryId: '',
      limitAmount: '',
      period: 'MONTHLY',
      startDate: '',
      endDate: '',
      rolloverEnabled: false,
    })
    setDefaultDates()
    setError('')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'EXCEEDED': return <AlertTriangle size={16}
                               className="text-red-400" />
      case 'WARNING': return <AlertTriangle size={16}
                              className="text-amber-400" />
      default: return <CheckCircle size={16}
                       className="text-emerald-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'EXCEEDED': return 'text-red-400'
      case 'WARNING': return 'text-amber-400'
      default: return 'text-emerald-400'
    }
  }

  const getProgressColor = (status) => {
    switch (status) {
      case 'EXCEEDED': return 'bg-red-500'
      case 'WARNING': return 'bg-amber-500'
      default: return 'bg-emerald-500'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar currentPage="budgets" onNavigate={onNavigate} />
       <MobileNav currentPage="budget" onNavigate={onNavigate} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Budgets</h2>
            <p className="text-slate-400 text-sm mt-1">
              Track your spending limits
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
            Add Budget
          </motion.button>
        </div>

        {/* Budget cards */}
        {loading ? (
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-800 rounded-2xl p-6
                                      border border-slate-700 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"/>
                <div className="h-8 bg-slate-700 rounded w-1/2 mb-4"/>
                <div className="h-2 bg-slate-700 rounded mb-2"/>
                <div className="h-3 bg-slate-700 rounded w-1/4"/>
              </div>
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-2xl
                            flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={24} className="text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No budgets yet</p>
            <p className="text-slate-600 text-sm mt-1">
              Create a budget to track your spending
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <AnimatePresence>
              {budgets.map((budget, index) => (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800 rounded-2xl p-6 border
                             border-slate-700 hover:border-slate-600
                             transition-all duration-200"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold">
                        {budget.categoryName}
                      </h3>
                      <span className="text-xs text-slate-500 mt-0.5">
                        {budget.period} •{' '}
                        {budget.startDate} to {budget.endDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 text-xs
                                      font-medium ${getStatusColor(budget.status)}`}>
                        {getStatusIcon(budget.status)}
                        {budget.status}
                      </div>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="w-7 h-7 flex items-center justify-center
                                   rounded-lg text-slate-600
                                   hover:text-red-400 hover:bg-red-500/10
                                   transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Amount info */}
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Spent</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(budget.spentAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs mb-1">Limit</p>
                      <p className="text-lg font-semibold text-slate-300">
                        {formatCurrency(budget.limitAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="h-2 bg-slate-700 rounded-full
                                    overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            budget.usagePercentage, 100)}%`
                        }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full
                          ${getProgressColor(budget.status)}`}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-xs">
                      {formatCurrency(budget.remainingAmount)} remaining
                    </p>
                    <p className={`text-xs font-medium
                                  ${getStatusColor(budget.status)}`}>
                      {budget.usagePercentage?.toFixed(1)}% used
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Budget Modal */}
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
                              border-slate-700 shadow-2xl w-full
                              max-w-md">

                {/* Modal header */}
                <div className="flex items-center justify-between p-6
                                border-b border-slate-700">
                  <h2 className="text-lg font-semibold text-white">
                    Create Budget
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

                  {/* Category */}
                  <div>
                    <label className="text-sm text-slate-400
                                      mb-1.5 block">
                      Category (leave empty for overall budget)
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({
                        ...formData, categoryId: e.target.value
                      })}
                      className="w-full bg-slate-900 border border-slate-700
                                 rounded-xl py-3 px-4 text-white text-sm
                                 focus:outline-none focus:border-indigo-500
                                 transition-all"
                    >
                      <option value="">Overall (all categories)</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Limit amount */}
                  <div>
                    <label className="text-sm text-slate-400
                                      mb-1.5 block">
                      Budget limit
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2
                                       -translate-y-1/2 text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={formData.limitAmount}
                        onChange={(e) => setFormData({
                          ...formData, limitAmount: e.target.value
                        })}
                        placeholder="0.00"
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

                  {/* Period */}
                  <div>
                    <label className="text-sm text-slate-400
                                      mb-1.5 block">
                      Period
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {PERIODS.map(period => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => setFormData({
                            ...formData, period
                          })}
                          className={`py-2 rounded-xl text-sm font-medium
                                     transition-all
                            ${formData.period === period
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-900 text-slate-400 border border-slate-700'
                            }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-slate-400
                                        mb-1.5 block">
                        Start date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({
                          ...formData, startDate: e.target.value
                        })}
                        required
                        className="w-full bg-slate-900 border border-slate-700
                                   rounded-xl py-3 px-4 text-white text-sm
                                   focus:outline-none focus:border-indigo-500
                                   transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400
                                        mb-1.5 block">
                        End date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({
                          ...formData, endDate: e.target.value
                        })}
                        required
                        className="w-full bg-slate-900 border border-slate-700
                                   rounded-xl py-3 px-4 text-white text-sm
                                   focus:outline-none focus:border-indigo-500
                                   transition-all"
                      />
                    </div>
                  </div>

                  {/* Rollover */}
                  <div className="flex items-center gap-3 p-4
                                  bg-slate-900 rounded-xl">
                    <input
                      type="checkbox"
                      id="rollover"
                      checked={formData.rolloverEnabled}
                      onChange={(e) => setFormData({
                        ...formData,
                        rolloverEnabled: e.target.checked
                      })}
                      className="w-4 h-4 accent-indigo-500"
                    />
                    <div>
                      <label htmlFor="rollover"
                             className="text-white text-sm font-medium
                                        cursor-pointer">
                        Enable rollover
                      </label>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Carry unspent amount to next period
                      </p>
                    </div>
                  </div>

                  {/* Submit */}
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
                    {submitting ? 'Creating...' : 'Create Budget'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
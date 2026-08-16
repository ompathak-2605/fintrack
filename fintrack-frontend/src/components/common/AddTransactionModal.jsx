import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import api from '../../api/axios'

const PAYMENT_METHODS = ['CASH', 'UPI', 'CARD', 'NETBANKING']
const NECESSITY_TYPES = ['NEED', 'WANT']

export default function AddTransactionModal({ isOpen, onClose, onSuccess }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    type: 'EXPENSE',
    description: '',
    merchant: '',
    transactionDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    necessityType: 'NEED',
    isRecurring: false,
  })

  useEffect(() => {
    if (isOpen) fetchCategories()
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
      }
      await api.post('/transactions', payload)
      onSuccess()
      onClose()
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      amount: '',
      categoryId: '',
      type: 'EXPENSE',
      description: '',
      merchant: '',
      transactionDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      necessityType: 'NEED',
      isRecurring: false,
    })
    setError('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center
                       justify-center p-4"
          >
            <div className="bg-slate-800 rounded-3xl border border-slate-700
                            shadow-2xl w-full max-w-md max-h-[90vh]
                            overflow-y-auto">

              {/* Header */}
              <div className="flex items-center justify-between p-6
                              border-b border-slate-700">
                <h2 className="text-lg font-semibold text-white">
                  Add Transaction
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center
                             rounded-lg text-slate-400 hover:text-white
                             hover:bg-slate-700 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">

                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30
                                  rounded-xl p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Type toggle */}
                <div className="flex bg-slate-900 rounded-xl p-1">
                  {['EXPENSE', 'INCOME'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium
                                 transition-all duration-200
                        ${formData.type === t
                          ? t === 'EXPENSE'
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'bg-emerald-500 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      {t === 'EXPENSE' ? '↓ Expense' : '↑ Income'}
                    </button>
                  ))}
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2
                                     text-slate-400 font-medium">₹</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                      min="0.01"
                      step="0.01"
                      className="w-full bg-slate-900 border border-slate-700
                                 rounded-xl py-3 pl-8 pr-4 text-white
                                 placeholder-slate-600 text-sm
                                 focus:outline-none focus:border-indigo-500
                                 focus:ring-1 focus:ring-indigo-500
                                 transition-all"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-900 border border-slate-700
                               rounded-xl py-3 px-4 text-white text-sm
                               focus:outline-none focus:border-indigo-500
                               focus:ring-1 focus:ring-indigo-500
                               transition-all"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="What was this for?"
                    className="w-full bg-slate-900 border border-slate-700
                               rounded-xl py-3 px-4 text-white
                               placeholder-slate-600 text-sm
                               focus:outline-none focus:border-indigo-500
                               focus:ring-1 focus:ring-indigo-500
                               transition-all"
                  />
                </div>

                {/* Merchant */}
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">
                    Merchant / Source
                  </label>
                  <input
                    type="text"
                    name="merchant"
                    value={formData.merchant}
                    onChange={handleChange}
                    placeholder="Where was this?"
                    className="w-full bg-slate-900 border border-slate-700
                               rounded-xl py-3 px-4 text-white
                               placeholder-slate-600 text-sm
                               focus:outline-none focus:border-indigo-500
                               focus:ring-1 focus:ring-indigo-500
                               transition-all"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">
                    Date
                  </label>
                  <input
                    type="date"
                    name="transactionDate"
                    value={formData.transactionDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-900 border border-slate-700
                               rounded-xl py-3 px-4 text-white text-sm
                               focus:outline-none focus:border-indigo-500
                               focus:ring-1 focus:ring-indigo-500
                               transition-all"
                  />
                </div>

                {/* Payment method */}
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFormData({
                          ...formData, paymentMethod: method
                        })}
                        className={`py-2 rounded-xl text-xs font-medium
                                   transition-all duration-200
                          ${formData.paymentMethod === method
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-600'
                          }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Necessity type — only for expenses */}
                {formData.type === 'EXPENSE' && (
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">
                      Is this a Need or Want?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {NECESSITY_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({
                            ...formData, necessityType: type
                          })}
                          className={`py-2.5 rounded-xl text-sm font-medium
                                     transition-all duration-200
                            ${formData.necessityType === type
                              ? type === 'NEED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                              : 'bg-slate-900 text-slate-400 border border-slate-700'
                            }`}
                        >
                          {type === 'NEED' ? '✓ Need' : '★ Want'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-indigo-500 hover:bg-indigo-600
                             disabled:opacity-50 text-white font-semibold
                             py-3 rounded-xl transition-all duration-200
                             shadow-lg shadow-indigo-500/25 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4"
                           viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12"
                                r="10" stroke="currentColor"
                                strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Plus size={18} />
                      Add Transaction
                    </span>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
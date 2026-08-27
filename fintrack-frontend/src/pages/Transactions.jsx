import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Filter, Edit2,
  ArrowUpRight, ArrowDownRight, Trash2
} from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import MobileNav from '../components/layout/MobileNav'
import AddTransactionModal from '../components/common/AddTransactionModal'
import api from '../api/axios'
import { formatCurrency, formatDate } from '../utils/helpers'

export default function Transactions({ onNavigate }) {
  const [transactions, setTransactions] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [deleting, setDeleting] = useState(null)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, search, typeFilter])

  const fetchTransactions = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/transactions')
      setTransactions(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      setError('Failed to load transactions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...transactions]
    if (typeFilter !== 'ALL') {
      result = result.filter(t => t.type === typeFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        t.merchant?.toLowerCase().includes(q) ||
        t.categoryName?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/transactions/${id}`)
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setDeleting(null)
    }
  }

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar currentPage="transactions" onNavigate={onNavigate} />
      <MobileNav currentPage="transactions" onNavigate={onNavigate} />

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Transactions
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {transactions.length} total transactions
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingTransaction(null)
              setModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 md:px-5 py-2.5
                       bg-indigo-500 hover:bg-indigo-600
                       text-white font-medium rounded-xl
                       shadow-lg shadow-indigo-500/25
                       transition-all duration-200 text-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </motion.button>
        </div>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30
                       rounded-xl p-4 mb-6"
          >
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={fetchTransactions}
              className="text-red-400 underline text-xs mt-1"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {[
            {
              label: 'Total Income',
              value: formatCurrency(totalIncome),
              color: 'emerald'
            },
            {
              label: 'Total Expenses',
              value: formatCurrency(totalExpense),
              color: 'red'
            },
            {
              label: 'Net Balance',
              value: formatCurrency(totalIncome - totalExpense),
              color: 'indigo'
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-slate-800 rounded-xl md:rounded-2xl
                         p-3 md:p-4 border
                ${stat.color === 'emerald'
                  ? 'border-emerald-500/20'
                  : stat.color === 'red'
                  ? 'border-red-500/20'
                  : 'border-indigo-500/20'}`}
            >
              <p className="text-slate-400 text-xs mb-1 truncate">
                {stat.label}
              </p>
              <p className={`text-sm md:text-xl font-bold
                ${stat.color === 'emerald'
                  ? 'text-emerald-400'
                  : stat.color === 'red'
                  ? 'text-red-400'
                  : 'text-indigo-400'}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch
                        sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2
                         text-slate-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full bg-slate-800 border border-slate-700
                         rounded-xl py-2.5 pl-10 pr-4 text-white
                         placeholder-slate-500 text-sm
                         focus:outline-none focus:border-indigo-500
                         transition-all"
            />
          </div>
          <div className="flex bg-slate-800 border border-slate-700
                          rounded-xl p-1 gap-1">
            {['ALL', 'EXPENSE', 'INCOME'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 md:px-4 py-1.5 rounded-lg text-xs
                           md:text-sm font-medium transition-all
                  ${typeFilter === type
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i}
                   className="bg-slate-800 rounded-2xl p-4 border
                              border-slate-700 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-xl
                                  flex-shrink-0"/>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"/>
                    <div className="h-3 bg-slate-700 rounded w-1/4"/>
                  </div>
                  <div className="h-5 bg-slate-700 rounded w-20"/>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-2xl
                            flex items-center justify-center mx-auto mb-4">
              <Filter size={24} className="text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">
              No transactions found
            </p>
            <p className="text-slate-600 text-sm mt-1">
              {search || typeFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Add your first transaction'}
            </p>
            {!search && typeFilter === 'ALL' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingTransaction(null)
                  setModalOpen(true)
                }}
                className="mt-4 px-5 py-2.5 bg-indigo-500
                           hover:bg-indigo-600 text-white text-sm
                           font-medium rounded-xl transition-all"
              >
                Add Transaction
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((txn, index) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-slate-800 rounded-2xl p-4 border
                             border-slate-700 hover:border-slate-600
                             transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 md:gap-4">

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex
                                    items-center justify-center
                                    flex-shrink-0
                      ${txn.type === 'INCOME'
                        ? 'bg-emerald-500/10'
                        : 'bg-red-500/10'}`}
                    >
                      {txn.type === 'INCOME'
                        ? <ArrowUpRight size={18}
                            className="text-emerald-400" />
                        : <ArrowDownRight size={18}
                            className="text-red-400" />
                      }
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium
                                    truncate">
                        {txn.description || txn.categoryName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5
                                      flex-wrap">
                        <span className="text-slate-500 text-xs">
                          {txn.categoryName}
                        </span>
                        <span className="text-slate-700 text-xs">•</span>
                        <span className="text-slate-500 text-xs">
                          {formatDate(txn.transactionDate)}
                        </span>
                        {txn.paymentMethod && (
                          <>
                            <span className="text-slate-700 text-xs">•</span>
                            <span className="text-slate-500 text-xs">
                              {txn.paymentMethod}
                            </span>
                          </>
                        )}
                        {txn.necessityType && (
                          <>
                            <span className="text-slate-700 text-xs">•</span>
                            <span className={`text-xs px-1.5 py-0.5
                                            rounded-full
                              ${txn.necessityType === 'NEED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'}`}
                            >
                              {txn.necessityType}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amount and actions */}
                    <div className="flex items-center gap-2 md:gap-3
                                    flex-shrink-0">
                      <p className={`text-sm font-semibold
                        ${txn.type === 'INCOME'
                          ? 'text-emerald-400'
                          : 'text-red-400'}`}
                      >
                        {txn.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(txn.amount)}
                      </p>

                      {/* Edit button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setEditingTransaction(txn)
                          setModalOpen(true)
                        }}
                        className="w-8 h-8 flex items-center
                                   justify-center rounded-lg
                                   text-slate-600
                                   hover:text-indigo-400
                                   hover:bg-indigo-500/10
                                   opacity-0 group-hover:opacity-100
                                   transition-all duration-200"
                      >
                        <Edit2 size={16} />
                      </motion.button>

                      {/* Delete button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(txn.id)}
                        disabled={deleting === txn.id}
                        className="w-8 h-8 flex items-center
                                   justify-center rounded-lg
                                   text-slate-600
                                   hover:text-red-400
                                   hover:bg-red-500/10
                                   opacity-0 group-hover:opacity-100
                                   transition-all duration-200"
                      >
                        {deleting === txn.id
                          ? <div className="w-4 h-4 border-2
                                           border-red-400/50
                                           border-t-transparent
                                           rounded-full animate-spin"/>
                          : <Trash2 size={16} />
                        }
                      </motion.button>
                    </div>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add/Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingTransaction(null)
        }}
        onSuccess={fetchTransactions}
        transaction={editingTransaction}
      />
    </div>
  )
}
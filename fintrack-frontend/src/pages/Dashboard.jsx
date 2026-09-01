import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, BarChart, Bar, XAxis, YAxis
} from 'recharts'
import Sidebar from '../components/layout/Sidebar'
import StatCard from '../components/common/StatCard'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import MobileNav from '../components/layout/MobileNav'
import { formatCurrency, formatDate } from '../utils/helpers'

const COLORS = [
  '#6366F1', '#10B981', '#F59E0B',
  '#EF4444', '#8B5CF6', '#06B6D4'
]

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  // Get first and last day of current month
  const now = new Date()
  const startDate = `${now.getFullYear()}-${String(
    now.getMonth() + 1).padStart(2, '0')}-01`
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString().split('T')[0]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
  setLoading(true)
  try {
    const [summaryRes, transactionsRes, budgetsRes] = await Promise.all([
      api.get(`/transactions/summary?start=${startDate}&end=${endDate}`),
      api.get('/transactions'),
      api.get('/budgets'),
    ])
    setSummary(summaryRes.data.data)
    setTransactions(transactionsRes.data.data || [])
    setBudgets(budgetsRes.data.data || [])
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
  } finally {
    setLoading(false)
  }
}

  // Prepare pie chart data from category breakdown
  const pieData = summary?.categoryBreakdown
    ? Object.entries(summary.categoryBreakdown).map(([name, value]) => ({
        name, value: parseFloat(value)
      }))
    : []

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/*Desktop sidebar */}
      <Sidebar currentPage="dashboard" onNavigate={onNavigate} />

      {/*Desktop sidebar */}
      <MobileNav currentPage="dashboard" onNavigate={onNavigate} />
      {/* Main content */}
      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-white"
            >
              Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
            </motion.h2>
            <p className="text-slate-400 text-sm mt-1">
              Here's your financial overview for this month
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800
                       border border-slate-700 rounded-xl text-slate-400
                       hover:text-white text-sm transition-all"
          >
            <RefreshCw size={16} />
            Refresh
          </motion.button>
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Net Balance"
                value={formatCurrency(summary?.netBalance || 0)}
                subtitle="Income minus expenses"
                icon={Wallet}
                color="indigo"
                delay={0}
              />
              <StatCard
                title="Total Income"
                value={formatCurrency(summary?.totalIncome || 0)}
                subtitle="This month"
                icon={TrendingUp}
                color="emerald"
                delay={0.1}
              />
              <StatCard
                title="Total Expenses"
                value={formatCurrency(summary?.totalExpense || 0)}
                subtitle="This month"
                icon={TrendingDown}
                color="red"
                delay={0.2}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-2 gap-6 mb-8">

              {/* Pie chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800 rounded-2xl p-6 border
                           border-slate-700"
              >
                <h3 className="text-white font-semibold mb-4">
                  Spending by Category
                </h3>
                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell
                              key={index}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pieData.map((item, index) => (
                        <div key={item.name}
                             className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background: COLORS[index % COLORS.length]
                            }}
                          />
                          <span className="text-xs text-slate-400">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyChart message="No expenses this month" />
                )}
              </motion.div>

              {/* Bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-800 rounded-2xl p-6 border
                           border-slate-700"
              >
                <h3 className="text-white font-semibold mb-4">
                  Income vs Expenses
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[{
                    name: 'This Month',
                    Income: parseFloat(summary?.totalIncome || 0),
                    Expenses: parseFloat(summary?.totalExpense || 0),
                  }]}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v/1000}k`}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="Income" fill="#10B981"
                         radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Expenses" fill="#EF4444"
                         radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Recent transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-800 rounded-2xl p-6 border
                         border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">
                  Recent Transactions
                </h3>
                <button
                  onClick={() => onNavigate('transactions')}
                  className="text-indigo-400 hover:text-indigo-300
                             text-sm transition-colors"
                >
                  View all
                </button>
              </div>

              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((txn, index) => (
                    <motion.div
                      key={txn.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center gap-4 p-3
                                 bg-slate-900 rounded-xl"
                    >
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
                        <p className="text-slate-500 text-xs mt-0.5">
                          {txn.categoryName} •{' '}
                          {formatDate(txn.transactionDate)}
                        </p>
                      </div>

                      {/* Amount */}
                      <p className={`text-sm font-semibold flex-shrink-0
                        ${txn.type === 'INCOME'
                          ? 'text-emerald-400'
                          : 'text-red-400'}`}
                      >
                        {txn.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(txn.amount)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">
                    No transactions yet
                  </p>
                  <button
                    onClick={() => onNavigate('transactions')}
                    className="text-indigo-400 hover:text-indigo-300
                               text-sm mt-2 transition-colors"
                  >
                    Add your first transaction
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

// Helper components
function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-800 rounded-2xl p-6
                                   border border-slate-700 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-3"/>
            <div className="h-8 bg-slate-700 rounded w-3/4"/>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-slate-800 rounded-2xl p-6
                                   border border-slate-700 animate-pulse
                                   h-64"/>
        ))}
      </div>
    </div>
  )
}

function EmptyChart({ message }) {
  return (
    <div className="h-48 flex items-center justify-center">
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
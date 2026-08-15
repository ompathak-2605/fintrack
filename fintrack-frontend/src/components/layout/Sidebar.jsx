import { motion } from 'framer-motion'
import {
  TrendingUp, LayoutDashboard, ArrowLeftRight,
  Target, PieChart, LogOut, User
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budgets', icon: PieChart },
  { id: 'goals', label: 'Goals', icon: Target },
]

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    onNavigate('login')
  }

  return (
    <div className="w-64 h-screen bg-slate-800 border-r border-slate-700
                    flex flex-col fixed left-0 top-0">

      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl
                          flex items-center justify-center
                          shadow-lg shadow-indigo-500/30">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">FinTrack</h1>
            <p className="text-xs text-slate-400">Money Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3
                         rounded-xl text-sm font-medium transition-all
                         duration-200 text-left
                         ${isActive
                           ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                           : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                         }`}
            >
              <Icon size={18} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3 mb-2
                        bg-slate-900 rounded-xl">
          <div className="w-8 h-8 bg-indigo-500/20 rounded-full
                          flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-4 py-3
                     rounded-xl text-sm font-medium text-slate-400
                     hover:bg-red-500/10 hover:text-red-400
                     transition-all duration-200"
        >
          <LogOut size={18} />
          Sign out
        </motion.button>
      </div>
    </div>
  )
}
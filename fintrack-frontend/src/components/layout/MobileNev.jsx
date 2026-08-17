import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, LayoutDashboard, ArrowLeftRight,
  PieChart, Target, LogOut, User, Menu, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budgets', icon: PieChart },
  { id: 'goals', label: 'Goals', icon: Target },
]

export default function MobileNav({ currentPage, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleNavigate = (page) => {
    onNavigate(page)
    setMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    onNavigate('login')
    setMenuOpen(false)
  }

  return (
    <>
      {/* Top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30
                      bg-slate-800 border-b border-slate-700
                      px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg
                          flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">FinTrack</span>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex items-center justify-center
                     rounded-lg text-slate-400 hover:text-white
                     hover:bg-slate-700 transition-all"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-20 top-14"
            />

            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="md:hidden fixed top-14 left-0 right-0 z-30
                         bg-slate-800 border-b border-slate-700
                         shadow-2xl"
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-700
                              flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-full
                                flex items-center justify-center">
                  <User size={16} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {user?.name}
                  </p>
                  <p className="text-slate-500 text-xs">{user?.email}</p>
                </div>
              </div>

              {/* Nav items */}
              <div className="p-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPage === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-3
                                 px-4 py-3 rounded-xl text-sm
                                 font-medium transition-all text-left
                        ${isActive
                          ? 'bg-indigo-500 text-white'
                          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  )
                })}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3
                             rounded-xl text-sm font-medium
                             text-slate-400 hover:bg-red-500/10
                             hover:text-red-400 transition-all mt-1"
                >
                  <LogOut size={18} />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
import { motion } from 'framer-motion'

export default function StatCard({
  title, value, subtitle, icon: Icon,
  color = 'indigo', delay = 0
}) {

  const colors = {
    indigo: {
      bg: 'bg-indigo-500/10',
      icon: 'text-indigo-400',
      border: 'border-indigo-500/20'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      icon: 'text-emerald-400',
      border: 'border-emerald-500/20'
    },
    red: {
      bg: 'bg-red-500/10',
      icon: 'text-red-400',
      border: 'border-red-500/20'
    },
    amber: {
      bg: 'bg-amber-500/10',
      icon: 'text-amber-400',
      border: 'border-amber-500/20'
    },
  }

  const c = colors[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`bg-slate-800 rounded-2xl p-6 border ${c.border}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 ${c.bg} rounded-xl
                         flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
      {subtitle && (
        <p className="text-slate-500 text-xs">{subtitle}</p>
      )}
    </motion.div>
  )
}
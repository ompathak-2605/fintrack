// Format currency in Indian Rupees
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date to readable string
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Get color based on transaction type
export const getTypeColor = (type) => {
  return type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'
}

// Get status color for budgets and goals
export const getStatusColor = (status) => {
  switch (status) {
    case 'ON_TRACK': return 'text-emerald-400'
    case 'WARNING': return 'text-amber-400'
    case 'EXCEEDED': return 'text-red-400'
    case 'ACHIEVED': return 'text-indigo-400'
    case 'AT_RISK': return 'text-amber-400'
    case 'OVERDUE': return 'text-red-400'
    default: return 'text-slate-400'
  }
}

// Calculate days ago
export const daysAgo = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return `${diff} days ago`
}
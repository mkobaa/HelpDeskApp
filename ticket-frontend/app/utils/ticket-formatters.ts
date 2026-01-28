// Memoized formatters for better performance
const priorityClassCache = new Map<string, string>()
const statusClassCache = new Map<string, string>()

const PRIORITY_CLASSES = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
} as const

const STATUS_CLASSES = {
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-orange-100 text-orange-800',
  resolved: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-600'
} as const

export function getPriorityClass(priority: string): string {
  if (priorityClassCache.has(priority)) {
    return priorityClassCache.get(priority)!
  }
  
  const className = PRIORITY_CLASSES[priority as keyof typeof PRIORITY_CLASSES] || 'bg-gray-50 text-gray-700'
  priorityClassCache.set(priority, className)
  return className
}

export function getStatusClass(status: string): string {
  if (statusClassCache.has(status)) {
    return statusClassCache.get(status)!
  }
  
  const className = STATUS_CLASSES[status as keyof typeof STATUS_CLASSES] || 'bg-gray-50 text-gray-700'
  statusClassCache.set(status, className)
  return className
}

export function formatStatusLabel(s: string): string {
  if (!s) return ''
  if (s === 'in_progress') return 'In Progress'
  return String(s).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Memoized date formatter
const dateFormatCache = new Map<string, string>()

export function formatTicketDate(val: string | Date): string {
  if (!val) return ''
  
  const key = typeof val === 'string' ? val : val.toISOString()
  if (dateFormatCache.has(key)) {
    return dateFormatCache.get(key)!
  }
  
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  
  const day = d.getDate()
  const month = d.toLocaleString('en-US', { month: 'short' })
  const year = d.getFullYear()
  let hour = d.getHours()
  const minute = d.getMinutes()
  const ampm = hour >= 12 ? 'pm' : 'am'
  hour = hour % 12 || 12
  const minutePart = minute ? `:${String(minute).padStart(2, '0')}` : ''
  
  const formatted = `${day} ${month} ${year} ${hour}${minutePart}${ampm}`
  
  // Only cache recent dates (last 7 days) to prevent memory issues
  const age = Date.now() - d.getTime()
  if (age < 7 * 24 * 60 * 60 * 1000) {
    dateFormatCache.set(key, formatted)
  }
  
  return formatted
}

// Clear caches periodically to prevent memory leaks
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (priorityClassCache.size > 100) priorityClassCache.clear()
    if (statusClassCache.size > 100) statusClassCache.clear()
    if (dateFormatCache.size > 500) dateFormatCache.clear()
  }, 5 * 60 * 1000) // Every 5 minutes
}

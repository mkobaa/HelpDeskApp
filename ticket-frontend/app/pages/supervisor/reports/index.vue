<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getTechnicians } from '~/api/users/users'
import { getAverageResolutionTime } from '~/api/reports/avgResolutionMs'
import { getTicketsResolved } from '~/api/reports/ticketsResolved'
import { getTicketsResolvedOverTime } from '~/api/reports/ticketsResolvedOverTime'
import { getSolutionTimeTrends } from '~/api/reports/solutionTimeTrends'
import { getCustomerSatisfaction } from '~/api/reports/customerSatisfaction'

const range = ref('7')
const customFrom = ref('')
const customTo = ref('')
const status = ref('')
const technician = ref('')
const priority = ref('')

const tickets = ref([])
const loading = ref(false)
const avgResolutionMinutes = ref<number | null>(null)
const resolvedCountApi = ref<number | null>(null)
const resolvedLabels = ref<string[]>([])
const resolvedValues = ref<number[]>([])
const solutionLabels = ref<string[]>([])
const solutionValues = ref<number[]>([])
const avgSatisfactionApi = ref<number | null>(null)

const technicians = ref([])

const fetchTechnicians = async () => {
  try {
    technicians.value = await getTechnicians()
  } catch (e) {
    technicians.value = []
  }
}

const buildParams = () => {
  const p = new URLSearchParams()
  if (status.value) p.append('status', status.value)
  if (priority.value) p.append('priority', priority.value)
  if (technician.value) p.append('technician', technician.value)
  if (range.value !== 'custom') {
    p.append('range', range.value)
  } else {
    if (customFrom.value) p.append('from', customFrom.value)
    if (customTo.value) p.append('to', customTo.value)
  }
  return p.toString()
}

const buildCriteria = () => {
  const c: any = {}
  if (status.value) c.status = status.value
  if (priority.value) c.priority = priority.value
  if (technician.value) {
    c.technician = technician.value
    c.technician_id = technician.value
  }
  if (range.value !== 'custom') c.range = range.value
  else {
    if (customFrom.value) c.from = customFrom.value
    if (customTo.value) c.to = customTo.value
  }
  return c
}

const fetchTickets = async () => {
  loading.value = true
  try {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try { bearer = decodeURIComponent(bearer) } catch {}
    const qs = buildParams()
    let url = 'http://localhost:8000/api/tickets'
    if (qs) url += `?${qs}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } })
    const raw = await res.json()
    // normalize to array
    if (Array.isArray(raw)) tickets.value = raw
    else if (Array.isArray(raw.data)) tickets.value = raw.data
    else if (Array.isArray(raw.tickets)) tickets.value = raw.tickets
    else tickets.value = []
    // also fetch avg resolution for current filters
    try {
      const criteria = buildCriteria()
      const avg = await getAverageResolutionTime(criteria)
      // helper returns raw.data or raw; API now includes hours. Keep KPI prop in minutes for backward compatibility.
      if (avg) {
        if (typeof avg.average_resolution_time_hours !== 'undefined' && avg.average_resolution_time_hours !== null) {
          avgResolutionMinutes.value = Number(avg.average_resolution_time_hours) * 60
        } else if (typeof avg.average_resolution_time_minutes !== 'undefined' && avg.average_resolution_time_minutes !== null) {
          avgResolutionMinutes.value = Number(avg.average_resolution_time_minutes)
        } else {
          avgResolutionMinutes.value = null
        }
      } else {
        avgResolutionMinutes.value = null
      }
    } catch (e) {
      avgResolutionMinutes.value = null
    }
    // fetch customer satisfaction average from API
    try {
      const csCriteria = buildCriteria()
      const cs = await getCustomerSatisfaction(csCriteria)
      if (cs && typeof cs.average_satisfaction_rating !== 'undefined') avgSatisfactionApi.value = Number(cs.average_satisfaction_rating)
      else avgSatisfactionApi.value = null
    } catch (e) {
      avgSatisfactionApi.value = null
    }
    // fetch resolved count from API
    try {
      const criteria2 = buildCriteria()
      const rc = await getTicketsResolved(criteria2)
      // normalize: rc may be object with count property or full data
      if (rc && typeof rc.total !== 'undefined') resolvedCountApi.value = Number(rc.total)
      else if (rc && typeof rc.count !== 'undefined') resolvedCountApi.value = Number(rc.count)
      else if (rc && typeof rc.tickets_resolved !== 'undefined') resolvedCountApi.value = Number(rc.tickets_resolved)
      else if (typeof rc === 'number') resolvedCountApi.value = rc
      else resolvedCountApi.value = null
    } catch (e) {
      resolvedCountApi.value = null
    }
    // fetch resolved-over-time chart data
    try {
      const criteria3 = buildCriteria()
      const over = await getTicketsResolvedOverTime(criteria3)
      resolvedLabels.value = Array.isArray(over.labels) ? over.labels : []
      resolvedValues.value = Array.isArray(over.values) ? over.values : []
    } catch (e) {
      resolvedLabels.value = []
      resolvedValues.value = []
    }
    // fetch solution-time-trends for average resolution time chart
    try {
      const criteria4 = buildCriteria()
      const sol = await getSolutionTimeTrends(criteria4)
      solutionLabels.value = Array.isArray(sol.labels) ? sol.labels : []
      solutionValues.value = Array.isArray(sol.values) ? sol.values : []
    } catch (e) {
      solutionLabels.value = []
      solutionValues.value = []
    }
  } catch (err) {
    console.error('fetchTickets', err)
    tickets.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTechnicians()
  fetchTickets()
})

const applyFilters = async () => {
  await fetchTickets()
}

const resolvedCount = computed(() => tickets.value.filter(t => t.status === 'resolved' || t.status === 'closed').length)

const avgResolutionMs = computed(() => {
  const resolved = tickets.value.filter(t => t.closed_at && t.created_at)
  if (!resolved.length) return 0
  const total = resolved.reduce((sum, r) => {
    const a = new Date(r.created_at).getTime()
    const b = new Date(r.closed_at).getTime()
    return sum + Math.max(0, b - a)
  }, 0)
  return total / resolved.length
})

const avgResolutionDisplay = computed(() => {
  const ms = Math.round(avgResolutionMs.value)
  if (!ms) return '-'
  const mins = Math.floor(ms / 60000)
  const hours = Math.floor(mins / 60)
  const remMin = mins % 60
  return `${hours}h ${remMin}m`
})

const avgSatisfaction = computed(() => {
  const vals = tickets.value.map(t => Number(t.satisfaction)).filter(n => !Number.isNaN(n))
  if (!vals.length) return '-' 
  const avg = vals.reduce((a,b)=>a+b,0)/vals.length
  return (Math.round(avg*10)/10)
})

// chart data: tickets resolved per day
const chartSeries = computed(() => {
  const map = new Map()
  tickets.value.forEach(t => {
    const d = t.closed_at ? new Date(t.closed_at) : null
    if (!d) return
    const key = d.toISOString().slice(0,10)
    map.set(key, (map.get(key)||0)+1)
  })
  const days = Array.from(map.keys()).sort()
  return { labels: days, data: days.map(d=>map.get(d)||0) }
})

const formatDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  return d.toLocaleString()
}

const downloadCSV = async () => {
  // Call backend export endpoint so server generates CSV with same filters
  try {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try { bearer = decodeURIComponent(bearer) } catch {}

    const qs = buildParams()
    const config = useRuntimeConfig()
    const API_BASE = config.public?.apiBase || 'http://localhost:8000'
    let url = `${API_BASE}/api/reports/export`
    if (qs) url += `?${qs}`

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/csv',
        Authorization: `Bearer ${bearer}`,
      }
    })

    if (!res.ok) {
      const txt = await res.text()
      console.error('Export CSV failed', res.status, txt)
      return
    }

    const blob = await res.blob()
    const dlUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = dlUrl
    a.download = `reports_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(dlUrl)
  } catch (err) {
    console.error('downloadCSV error', err)
  }
}

const exportPDF = () => {
  ;(async () => {
    try {
      const token = useCookie('auth_token')
      let bearer = token.value || ''
      try { bearer = decodeURIComponent(bearer) } catch {}

      const qs = buildParams()
      const config = useRuntimeConfig()
      const API_BASE = config.public?.apiBase || 'http://localhost:8000'
      let url = `${API_BASE}/api/reports/export-pdf`
      if (qs) url += `?${qs}`

      const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } })
      if (!res.ok) {
        const txt = await res.text()
        console.error('Export PDF failed', res.status, txt)
        return
      }

      const contentType = res.headers.get('content-type') || ''
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (err) {
      console.error('exportPDF error', err)
    }
  })()
}
</script>

<template>
  <UDashboardGroup>
    <Sidebar />
    <UDashboardPage class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <Navbar title="Reports" icon="i-lucide-file-chart-line" class="w-full" />
      <div class="flex flex-col flex-1 gap-6 p-6 overflow-auto">
        <div class="flex items-center justify-between gap-3">
          <UDashboardPageHeader title="Reports / Analytics" description="Key metrics and trends for tickets." />
          <reportsExportButtons @csv="downloadCSV" @pdf="exportPDF" />
        </div>

        <reportsFilterBar :initial="{ range: range, from: customFrom, to: customTo, status: status, technician: technician, priority: priority }" :technicians="technicians" @apply="(f)=>{ range.value=f.range; customFrom.value=f.from; customTo.value=f.to; status.value=f.status; technician.value=f.technician; priority.value=f.priority; applyFilters() }" />

        <reportsKPICards :tickets="tickets" :avg-resolution-minutes="avgResolutionMinutes" :resolved-count-override="resolvedCountApi" :avg-satisfaction-override="avgSatisfactionApi" />

        <reportsCharts :labels="resolvedLabels" :data="resolvedValues" :secondary-data="solutionValues" :secondary-label="'Avg solution time (hours)'" />
      </div>
    </UDashboardPage>
  </UDashboardGroup>
</template>

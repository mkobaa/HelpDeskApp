<script setup lang="ts">
import { getAssignedTickets } from '~/api/tickets/tickets'

const props = defineProps<{
  technicianId?: string
  filters?: {
    status?: string
    priority?: string
    category_id?: string
  }
}>()

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'priority', header: 'Priority' },
  { accessorKey: 'category.name', header: 'Category' },
  { accessorKey: 'created_at', header: 'Created At' },
  {
    accessorKey: 'actions',
    header: 'Actions',
    // cell: () => null
  }
]


const { data: tickets, status, refresh } = await useAsyncData(
  'tickets',
  () => props.technicianId ? getAssignedTickets(props.technicianId) : getAssignedTickets(''),
  {
    watch: [() => props.filters, () => props.technicianId],
    server: false,
    lazy: false,
    default: () => []
  }
)

const data = computed(() => {
  // Support paginated API: { data: { data: [...] } }
  if (!tickets.value) return []
  if (Array.isArray(tickets.value)) return tickets.value
  if (tickets.value.data && Array.isArray(tickets.value.data)) return tickets.value.data
  if (tickets.value.data && tickets.value.data.data && Array.isArray(tickets.value.data.data)) return tickets.value.data.data
  return []
})

const prioritiesClass = (s) => {
  const map = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  }
  return map[String(s)] || 'bg-gray-50 text-gray-700'
}

const statusClass = (s) => {
  const map = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-orange-100 text-orange-800',
    resolved: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-600'
  }
  return map[String(s)] || 'bg-gray-50 text-gray-700'
}

const statusLabel = (s) => {
  if (!s) return ''
  if (s === 'in_progress') return 'In Progress'
  return String(s).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatDate = (val) => {
  if (!val) return ''
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
  return `${day} ${month} ${year} ${hour}${minutePart}${ampm}`
}


const role = useCookie('role')
let link = ''
if (role.value === 'technician') {
  link = '/technician/tickets/'
}
else if (role.value === 'supervisor') {
  link = '/supervisor/tickets/'
}
else if (role.value === 'user') {
  link = '/user/tickets/'
}


onNuxtReady(() => {
  refresh()
})
</script>

<template>
  <UTable 
    :data="data" 
    :columns="columns"
    :loading="status === 'pending'"
  >
    <template #actions-cell="{ row }">
      <div class="flex gap-2">
        <UButton
          size="xs"
          color="primary"
          variant="soft"
          icon="i-lucide-eye"
          :to="`${link}${row.original.id}`"
        >
          View
        </UButton>
      </div>
    </template>
    <template #status-cell="{ row }">
        <div class="flex items-center">
          <UBadge color="neutral" variant="soft" :class="`${statusClass(row.original.status)} px-2 py-1 text-xs font-semibold`">
            {{ statusLabel(row.original.status) }}
          </UBadge>
        </div>
      </template>
      <template #priority-cell="{ row }">
        <div class="flex items-center">
          <UBadge color="neutral" variant="soft" :class="`${prioritiesClass(row.original.priority)} px-2 py-1 text-xs font-semibold`">
            {{ statusLabel(row.original.priority) }}
          </UBadge>
        </div>
      </template>
  </UTable>
</template>

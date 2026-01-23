<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getTickets } from '~/api/tickets/tickets'

const props = defineProps<{
  filters?: {
    status?: string
    priority?: string
    category_id?: string
  }
  forceStatus?: string
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
  }
]


const currentPage = ref(1)
const perPage = ref(20)

const { data: ticketsRaw, status, refresh } = await useAsyncData(
  () => `tickets-page-${currentPage.value}-${props.filters?.status || ''}-${props.filters?.priority || ''}-${props.filters?.category_id || ''}`,
  () => getTickets({ ...props.filters, status: (props.filters?.status ?? props.forceStatus), page: currentPage.value, per_page: perPage.value, _raw: true }),
  {
    watch: [() => props.filters?.status, () => props.filters?.priority, () => props.filters?.category_id, () => currentPage.value],
    server: false,
    lazy: false,
    default: () => null
  }
)

const data = computed(() => {
  if (!ticketsRaw.value) return []
  const raw = ticketsRaw.value
  if (Array.isArray(raw)) return raw
  if (raw?.data && Array.isArray(raw.data)) return raw.data
  if (raw?.data?.data && Array.isArray(raw.data.data)) return raw.data.data
  if (Array.isArray(raw.tickets)) return raw.tickets
  return []
})

const total = ref(0)
const lastPage = ref(1)

watch(ticketsRaw, (v) => {
  if (!v) {
    total.value = 0
    lastPage.value = 1
    return
  }
  const meta = v?.data?.meta || v?.meta || v?.pagination || v?.data || null
  if (meta && (meta.total || meta.last_page || meta.current_page || meta.per_page)) {
    total.value = meta.total ?? meta.total_items ?? total.value
    lastPage.value = meta.last_page ?? meta.lastPage ?? meta.total_pages ?? (meta.total && (meta.per_page ?? perPage.value) ? Math.ceil((meta.total)/(meta.per_page ?? perPage.value)) : lastPage.value)
    perPage.value = meta.per_page ?? meta.perPage ?? perPage.value
    if (meta.current_page && Number(meta.current_page) !== currentPage.value) {
      currentPage.value = Number(meta.current_page)
    }
  } else {
    if (Array.isArray(v) || Array.isArray(v?.data) || Array.isArray(v?.data?.data)) {
      total.value = (Array.isArray(v) ? v.length : (Array.isArray(v.data) ? v.data.length : (Array.isArray(v.data?.data) ? v.data.data.length : 0)))
      lastPage.value = 1
    }
  }
})

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < lastPage.value) currentPage.value++ }
const goToPage = (n) => { if (n >= 1 && n <= lastPage.value) currentPage.value = n }

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

const role = useCookie('user_role')

const link = computed(() => {
  if (role.value === 'technician') return '/technician/tickets/'
  if (role.value === 'supervisor') return '/supervisor/tickets/'
  if (role.value === 'user') return '/user/tickets/'
  return '/'
})


onNuxtReady(() => {
  refresh()
})

// reset to first page when filters change
watch([
  () => props.filters?.status,
  () => props.filters?.priority,
  () => props.filters?.category_id
], () => {
  currentPage.value = 1
})
</script>

<template>
  <UTable 
    :data="data" 
    :columns="columns"
    :loading="status === 'pending'"
  >
    <template #actions-cell="{ row }">
      <div class="flex justify-end gap-2">
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
      <template #priority-cell="{ row }">
        <div class="flex items-center">
          <UBadge color="neutral" variant="soft" :class="`${prioritiesClass(row.original.priority)} px-2 py-1 text-xs font-semibold`">
            {{ statusLabel(row.original.priority) }}
          </UBadge>
        </div>
      </template>
      <template #status-cell="{ row }">
        <div class="flex items-center">
          <UBadge color="neutral" variant="soft" :class="`${statusClass(row.original.status)} px-2 py-1 text-xs font-semibold`">
            {{ statusLabel(row.original.status) }}
          </UBadge>
        </div>
      </template>
  </UTable>
  <!-- Pagination controls -->
  <div class="mt-4 flex items-center justify-between">
    <div class="text-sm text-gray-600">
      Showing
      <span v-if="data.length">{{ ((currentPage-1)*perPage)+1 }}-{{ ((currentPage-1)*perPage) + data.length }}</span>
      <span v-else>0</span>
      of {{ total }}
    </div>
    <div class="flex items-center gap-2">
      <UButton size="sm" variant="ghost" :disabled="currentPage === 1" @click="prevPage">Prev</UButton>
      <div class="px-3 text-sm">Page {{ currentPage }} / {{ lastPage }}</div>
      <UButton size="sm" variant="ghost" :disabled="currentPage === lastPage" @click="nextPage">Next</UButton>
    </div>
  </div>
</template>

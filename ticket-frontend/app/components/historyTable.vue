<script setup lang="ts">
import { getHistory } from '~/api/history/history'
import { getUsers } from '~/api/users/users'
import { computed, ref, watch } from 'vue'

const currentPage = ref(1)
const perPage = ref(20)

const key = computed(() => `history-list-page-${currentPage.value}`)

const { data: historyRaw, status, refresh } = await useAsyncData(
  key,
  () => getHistory({ page: currentPage.value, per_page: perPage.value, _raw: true }),
  { server: false, watch: [currentPage, perPage] }
)

const historyEntries = computed(() => {
  const v = historyRaw.value
  if (!v) return []
  if (Array.isArray(v)) return v
  if (v?.data?.data && Array.isArray(v.data.data)) return v.data.data
  if (Array.isArray(v.data)) return v.data
  if (Array.isArray(v.logs)) return v.logs
  return []
})

const { data: users } = await useAsyncData('all-users', () => getUsers(), { server: false, lazy: false })

const usersMap = computed(() => {
  const map: Record<string, string> = {}
  const usersArr = (users.value && (Array.isArray(users.value) ? users.value : users.value.data)) || []
  ;(usersArr || []).forEach((u: any) => {
    if (u && u.id != null) map[String(u.id)] = u.username || u.name || u.email || `User ${u.id}`
  })
  return map
})

const getActorName = (row: any) => {
  const orig = row?.original || {}
  const id = orig.actor_id || orig.user_id || orig.causer_id || (orig.actor && orig.actor.id) || (orig.causer && orig.causer.id)
  if (id != null) return usersMap.value[String(id)] || `User ${id}`
  return orig.actor_username || orig.causer_username || orig.username || 'Unknown'
}

const extractMeta = (v: any) => {
  if (!v) return null
  if (v?.data?.meta) return v.data.meta
  if (v?.data && typeof v.data === 'object' && (v.data.total || v.data.last_page || v.data.current_page || v.data.per_page)) return v.data
  if (v?.meta) return v.meta
  if (v?.pagination) return v.pagination
  return null
}

const meta = computed(() => extractMeta(historyRaw.value))

const total = computed(() => {
  const m = meta.value
  if (m) return m.total ?? m.total_items ?? 0
  return historyEntries.value.length
})

const lastPage = computed(() => {
  const m = meta.value
  if (m) return Number(m.last_page ?? m.lastPage ?? m.total_pages ?? 1)
  return 1
})

const perPageDisplay = computed(() => {
  const m = meta.value
  if (m) return Number(m.per_page ?? m.perPage ?? perPage.value)
  return perPage.value
})

watch(historyRaw, (v) => {
  const m = extractMeta(v)
  if (m && m.current_page) {
    currentPage.value = Number(m.current_page)
  }
})

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < lastPage.value) currentPage.value++ }

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'ticket_id', header: 'Ticket ID' },
  { accessorKey: 'action', header: 'Action' },
  { accessorKey: 'actor_username', header: 'Actor Username' },
  { accessorKey: 'notes', header: 'Notes' },
]

onNuxtReady(() => {
  refresh()
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UTable
      :data="historyEntries"
      :columns="columns"
      :loading="status === 'pending'"
      class="flex-1"
    >
      <template #actor_username-cell="{ row }">
        <NuxtLink
          :to="`/admin/users/${row.original.id}`"
          class="text-primary underline hover:text-primary-600"
        >
          {{ getActorName(row) }}
        </NuxtLink>
      </template>
    </UTable>

    <div class="mt-2 flex items-center justify-between">
      <div class="text-sm text-gray-600">Showing <span v-if="historyEntries.length">{{ ((currentPage-1)*perPageDisplay)+1 }}-{{ ((currentPage-1)*perPageDisplay) + historyEntries.length }}</span><span v-else>0</span> of {{ total }}</div>
      <div class="flex items-center gap-2">
        <UButton size="sm" variant="ghost" :disabled="currentPage === 1" @click="prevPage">Prev</UButton>
        <div class="px-3 text-sm">Page {{ currentPage }} / {{ lastPage }}</div>
        <UButton size="sm" variant="ghost" :disabled="currentPage === lastPage" @click="nextPage">Next</UButton>
      </div>
    </div>
  </div>
</template>

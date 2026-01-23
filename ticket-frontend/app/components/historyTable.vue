<script setup lang="ts">
import { getHistory } from '~/api/history/history'
import { getUsers } from '~/api/users/users'
import { computed, watchEffect } from 'vue'

const { data: history, status, error, refresh } = await useAsyncData(
  'history-list',
  () => getHistory(),
  { server: false, lazy: false }
)

const data = computed(() => {
  if (!history.value) return []
  if (Array.isArray(history.value)) return history.value
  if (history.value.data && Array.isArray(history.value.data)) return history.value.data
  if (history.value.data && history.value.data.data && Array.isArray(history.value.data.data)) return history.value.data.data
  return []
})

const { data: users } = await useAsyncData('all-users', () => getUsers(), { server: false, lazy: false })

const usersMap = computed(() => {
  const map = {}
  const usersArr = (users.value && (Array.isArray(users.value) ? users.value : users.value.data)) || []
  ;(usersArr || []).forEach(u => {
    if (u && u.id != null) map[String(u.id)] = u.username || u.name || u.email || `User ${u.id}`
  })
  return map
})

const getActorName = (row) => {
  const orig = row?.original || {}
  const id = orig.actor_id || orig.user_id || orig.causer_id || (orig.actor && orig.actor.id) || (orig.causer && orig.causer.id)
  if (id != null) return usersMap.value[String(id)] || `User ${id}`
  return orig.actor_username || orig.causer_username || orig.username || 'Unknown'
}

watchEffect(() => {
  if (history.value) {
    // eslint-disable-next-line no-console
    // console.log('History payload sample:', history.value?.data || history.value)
  }
  if (users.value) {
    // eslint-disable-next-line no-console
    // console.log('Users payload sample:', users.value)
  }
})


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
  <UTable 
  :data="data" 
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

</template>

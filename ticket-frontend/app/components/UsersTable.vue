<script setup lang="ts">
import { getUsers } from '~/api/users/users'
import { computed, ref, watch } from 'vue'

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'username', header: 'Username' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  {
    id: 'actions',
    header: 'Actions'
  }
]

const currentPage = ref(1)
const perPage = ref(20)

const key = computed(() => `users-list-page-${currentPage.value}`)

const { data: usersRaw, status, refresh } = await useAsyncData(
  key,
  () => getUsers({ page: currentPage.value, per_page: perPage.value, _raw: true }),
  { server: false, watch: [currentPage, perPage] }
)

const users = computed(() => {
  const v = usersRaw.value
  if (!v) return []
  if (Array.isArray(v)) return v
  if (v?.data?.data && Array.isArray(v.data.data)) return v.data.data
  if (v?.data && Array.isArray(v.data)) return v.data
  if (Array.isArray(v.users)) return v.users
  return []
})

const extractMeta = (v: any) => {
  if (!v) return null
  if (v?.data?.meta) return v.data.meta
  if (v?.data && typeof v.data === 'object' && (v.data.total || v.data.last_page || v.data.current_page || v.data.per_page)) return v.data
  if (v?.meta) return v.meta
  if (v?.pagination) return v.pagination
  return null
}

const meta = computed(() => extractMeta(usersRaw.value))

const total = computed(() => {
  const m = meta.value
  if (m) return m.total ?? m.total_items ?? 0
  return users.value.length
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

watch(usersRaw, (v) => {
  const m = extractMeta(v)
  if (m && m.current_page) {
    currentPage.value = Number(m.current_page)
  }
})

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < lastPage.value) currentPage.value++ }

onNuxtReady(() => {
  refresh()
})
</script>

<template>
  <UTable 
  :data="users" 
  :columns="columns"
  :loading="status === 'pending'"
  class="flex-1"
>
  <template #cell-username="{ row }">
    <NuxtLink
      :to="`/admin/users/${row.original.id}`"
      class="text-primary underline hover:text-primary-600"
    >
      {{ row.original.username }}
    </NuxtLink>
  </template>

  <template #actions-cell="{ row }">
    <div class="flex justify-end gap-2">
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        :to="`/admin/users/${row.original.id}`"
      >
        Profile
      </UButton>

    </div>
  </template>
</UTable>

    <div class="mt-2 flex items-center justify-between">
      <div class="text-sm text-gray-600">Showing <span v-if="users.length">{{ ((currentPage-1)*perPageDisplay)+1 }}-{{ ((currentPage-1)*perPageDisplay) + users.length }}</span><span v-else>0</span> of {{ total }}</div>
      <div class="flex items-center gap-2">
        <UButton size="sm" variant="ghost" :disabled="currentPage === 1" @click="prevPage">Prev</UButton>
        <div class="px-3 text-sm">Page {{ currentPage }} / {{ lastPage }}</div>
        <UButton size="sm" variant="ghost" :disabled="currentPage === lastPage" @click="nextPage">Next</UButton>
      </div>
    </div>
</template>

<script setup lang="ts">
import { getUsers } from '~/api/users/users'

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


const { data: users, status, refresh } = await useAsyncData('users', () => getUsers(), {
  server: false,
  lazy: false,
  default: () => []
})

const data = computed(() => users.value || [])

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

</template>

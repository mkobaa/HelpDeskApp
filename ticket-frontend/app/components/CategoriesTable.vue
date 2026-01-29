<script setup lang="ts">
import { getCategories } from '~/api/categories/categories'




const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey : 'parent.name', header: 'Parent Category' },
]


const { data: categories, status, refresh } = await useAsyncData('categories', () => getCategories(), {
  server: false,
  lazy: false,
  default: () => []
})

const data = computed(() => categories.value || [])

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
      :to="`/admin/categories/${row.original.id}`"
      class="text-primary underline hover:text-primary-600"
    >
      {{ row.original.name }}
    </NuxtLink>
  </template>
  <template #description-cell="{ row }">
    <span>
      {{ (row.original.description || '').length > 50 ? (row.original.description || '').slice(0,50) + '...' : (row.original.description || '') }}
    </span>
  </template>
</UTable>

</template>

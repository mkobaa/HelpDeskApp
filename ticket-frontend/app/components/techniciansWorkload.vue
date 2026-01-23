<script setup lang="ts">
import { getTechniciansWorkload } from '~/api/tickets/tickets'

const props = defineProps<{
  filters?: {
    status?: string
    priority?: string
    category_id?: string
  }
}>()

const columns = [
    { accessorKey: 'technician.id', header: 'ID' },
    { accessorKey: 'technician.username', header: 'Username' },
    { accessorKey: 'technician.email', header: 'Email' },
    { accessorKey: 'open_count', header: 'Open' },
    { accessorKey: 'in_progress_count', header: 'In Progress' },
    { accessorKey: 'ticket_count', header: 'Total Tickets' },
    {
        accessorKey: 'actions',
        header: 'Actions',
    }
]


const { data: workload, status, refresh } = await useAsyncData(
  'workload', 
  () => getTechniciansWorkload(), 
  {
    watch: [() => props.filters],
    server: false,
    lazy: false,
    default: () => []
  }
)

const data = computed(() => workload.value || [])

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
      <div class="flex">
      
        <UButton
          size="xs"
          color="primary"
          variant="soft"
          icon="i-lucide-eye"
          :to="`/supervisor/technicians/${row.original.technician.id}`"
        >
          View
        </UButton>
       
      </div>
    </template>
  </UTable>
</template>

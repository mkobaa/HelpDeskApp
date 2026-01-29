<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ surveys?: any[]; loading?: boolean }>()

const surveys = computed(() => props.surveys || [])

const columns = [
  { accessorKey: 'ticket_id', header: 'Ticket' },
  { accessorKey: 'satisfaction_rating', header: 'Satisfaction' },
  { accessorKey: 'response_time_rating', header: 'Response Time' },
  { accessorKey: 'resolution_quality_rating', header: 'Resolution Quality' },
  { accessorKey: 'comments', header: 'Comments' },
  { accessorKey: 'created_at', header: 'Submitted At' },
  { accessorKey: 'actions', header: 'Actions' }
]

const role = useCookie('user_role')
const link = computed(() => {
  if (role.value === 'technician') return '/technician/tickets/'
  if (role.value === 'supervisor') return '/supervisor/tickets/'
  if (role.value === 'user') return '/user/tickets/'
  return '/'
})
</script>

<template>
  <div class="w-full max-h-[60vh] overflow-auto block">
    <div class="min-w-full">
      <UTable :data="surveys" :columns="columns" :loading="props.loading">
    <template #comments-cell="{ row }">
      <div class="text-sm">{{ row.original.comments || '—' }}</div>
    </template>

    <template #created_at-cell="{ row }">
      <div class="text-sm">{{ row.original.created_at ? new Date(row.original.created_at).toLocaleString() : '—' }}</div>
    </template>

    <template #actions-cell="{ row }">
      <div class="flex justify-end gap-2">
        <UButton size="xs" color="primary" variant="soft" icon="i-lucide-eye" :to="`${link}${row.original.ticket_id}`">View ticket</UButton>
      </div>
    </template>
      </UTable>
    </div>
  </div>
</template>

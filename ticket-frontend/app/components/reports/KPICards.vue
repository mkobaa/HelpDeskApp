<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  tickets: { type: Array, default: () => [] },
  avgResolutionMinutes: { type: Number, required: false },
  resolvedCountOverride: { type: Number, required: false },
  avgSatisfactionOverride: { type: Number, required: false }
})

const resolvedCount = computed(() => {
  if (typeof props.resolvedCountOverride === 'number') return props.resolvedCountOverride
  return props.tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
})

const avgResolutionMs = computed(() => {
  // if API-provided minutes are available, use them
  if (typeof props.avgResolutionMinutes === 'number') return props.avgResolutionMinutes * 60000
  const resolved = props.tickets.filter(t => t.closed_at && t.created_at)
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
  if (typeof props.avgSatisfactionOverride === 'number') return props.avgSatisfactionOverride
  const vals = props.tickets.map(t => Number(t.satisfaction)).filter(n => !Number.isNaN(n))
  if (!vals.length) return '-' 
  const avg = vals.reduce((a,b)=>a+b,0)/vals.length
  return (Math.round(avg*10)/10)
})
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <UCard class="h-full">
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted-500">Average resolution time</p>
        <p class="text-3xl font-semibold text-gray-900">{{ avgResolutionDisplay }}</p>
        <p class="text-sm text-muted-500">Selected period</p>
      </div>
    </UCard>

    <UCard class="h-full">
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted-500">Tickets resolved</p>
        <p class="text-3xl font-semibold text-gray-900">{{ resolvedCount }}</p>
        <p class="text-sm text-muted-500">Selected period</p>
      </div>
    </UCard>

    <UCard class="h-full">
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted-500">Customer satisfaction</p>
        <p class="text-3xl font-semibold text-gray-900">{{ avgSatisfaction }}</p>
        <p class="text-sm text-muted-500">Average (/5)</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRefs } from 'vue'
const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  technicians: { type: Array, default: () => [] }
})
const emit = defineEmits(['apply'])

const local = ref({
  range: props.initial.range || '7',
  from: props.initial.from || '',
  to: props.initial.to || '',
  status: props.initial.status || '',
  technician: props.initial.technician || '',
  priority: props.initial.priority || ''
})

watch(() => props.initial, (v) => {
  Object.assign(local.value, {
    range: v.range || '7',
    from: v.from || '',
    to: v.to || '',
    status: v.status || '',
    technician: v.technician || '',
    priority: v.priority || ''
  })
})

const apply = () => {
  emit('apply', { ...local.value })
}
</script>

<template>
  <UCard :ui="{ body: 'flex gap-3 flex-wrap items-center' }">
    <div class="flex items-center gap-2">
      <label class="text-sm text-muted-500">Date range</label>
      <select v-model="local.range" class="form-select">
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="custom">Custom range</option>
      </select>
    </div>

    <div v-if="local.range==='custom'" class="flex items-center gap-2">
      <input v-model="local.from" type="date" class="form-input" />
      <input v-model="local.to" type="date" class="form-input" />
    </div>

    <div class="flex items-center gap-2">
      <label class="text-sm text-muted-500">Status</label>
      <select v-model="local.status" class="form-select">
        <option value="">Any</option>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="pending">Pending</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>
    </div>

    <div class="flex items-center gap-2">
      <label class="text-sm text-muted-500">Technician</label>
      <select v-model="local.technician" class="form-select">
        <option value="">Any</option>
        <option v-for="t in technicians" :key="t.id" :value="t.id">{{ t.name || t.email }}</option>
      </select>
    </div>

    <div class="flex items-center gap-2">
      <label class="text-sm text-muted-500">Priority</label>
      <select v-model="local.priority" class="form-select">
        <option value="">Any</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
    </div>

    <div class="ml-auto">
      <UButton color="primary" @click="apply">Apply</UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  otherValue: { type: String, default: '' },
  tickets: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue','update:otherValue'])

const onSelect = (e) => emit('update:modelValue', e.target.value)
const onOther = (e) => emit('update:otherValue', e.target.value)
</script>

<template>
  <div class="space-y-2">
    <label class="text-sm font-semibold text-gray-700">Ticket</label>
    <div class="flex gap-3 items-center">
      <select :value="modelValue" @change="onSelect" class="form-select w-2/3">
        <option value="">-- Select ticket --</option>
        <option v-for="t in tickets" :key="t.id" :value="t.id">{{ t.id }} - {{ t.title || t.subject }}</option>
        <option value="other">Other</option>
      </select>
      <div class="text-sm text-muted-500">Select the ticket this feedback is about.</div>
    </div>

    <div v-if="modelValue === 'other'">
      <input :value="otherValue" @input="onOther" class="form-input w-full mt-1" placeholder="e.g. Ticket #12345 or brief description" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ label: { type: String, default: '' }, modelValue: { type: Number, default: 5 } })
const emit = defineEmits(['update:modelValue'])

const labels = ['Poor','Fair','Good','Very Good','Excellent']

const set = (n: number) => emit('update:modelValue', n)
</script>

<template>
  <div>
    <p class="text-sm font-semibold text-gray-700 mb-1">{{ label }}</p>
    <div class="flex gap-3">
      <button
        v-for="n in 5"
        :key="n"
        type="button"
        @click="set(n)"
        :aria-pressed="modelValue===n"
        :class="[
          'w-24 h-12 flex flex-col items-center justify-center rounded-md text-sm font-medium transition-colors',
          modelValue===n ? 'border border-sky-600 bg-sky-50 text-sky-700' : 'border border-transparent bg-white text-gray-800 hover:border-gray-200'
        ]"
      >
        <span class="text-lg font-semibold">{{ n }}</span>
        <span class="text-xs text-muted-500">{{ labels[n-1] }}</span>
      </button>
    </div>
  </div>
</template>

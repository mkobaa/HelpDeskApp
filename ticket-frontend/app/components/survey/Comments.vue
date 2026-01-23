<script setup lang="ts">
const props = defineProps({ modelValue: { type: String, default: '' }, maxLength: { type: Number, default: 1000 } })
const emit = defineEmits(['update:modelValue'])

const onInput = (e) => {
  const val = String(e.target.value).slice(0, props.maxLength)
  emit('update:modelValue', val)
}
</script>

<template>
  <div>
    <label class="text-sm font-semibold text-gray-700">Comments (optional)</label>
    <textarea :value="modelValue" @input="onInput" :rows="4" class="form-textarea w-full mt-1" placeholder="Anything else you'd like to tell us?"></textarea>
    <div class="text-xs text-muted-500 mt-1">Optional — helpful for context (max {{ maxLength }} chars).</div>
  </div>
</template>

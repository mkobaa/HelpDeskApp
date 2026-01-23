<script setup lang="ts">
const props = defineProps({ loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit','cancel'])
</script>

<template>
  <div class="flex items-center gap-3">
    <UButton :loading="loading" color="primary" @click.prevent="$emit('submit')">Submit feedback</UButton>
    <UButton color="neutral" variant="outline" @click.prevent="$emit('cancel')">Cancel</UButton>
  </div>
</template>

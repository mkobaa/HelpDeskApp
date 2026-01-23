<script setup lang="ts">
const emit = defineEmits(['csv','pdf'])
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton size="sm" color="primary" variant="soft" @click.prevent="$emit('csv')">Export CSV</UButton>
    <UButton size="sm" color="neutral" variant="soft" @click.prevent="$emit('pdf')">Export PDF</UButton>
  </div>
</template>

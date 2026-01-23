<script setup lang="ts">
const props = defineProps({ message: { type: String, default: '' } })
</script>

<template>
  <div v-if="message" class="my-2">
    <UBadge color="emerald" variant="soft">{{ message }}</UBadge>
  </div>
</template>

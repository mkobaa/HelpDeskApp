<script setup lang="ts">
import { user } from '#build/ui'

const authToken = useCookie('auth_token')
const toast = useToast()
const user_role = useCookie('user_role')

// Clear the auth cookie
authToken.value = null
user_role.value = null
toast.add({
  title: 'Logged out',
  description: 'You have been successfully logged out.'
})

// Redirect to login page
await navigateTo('/login')
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <p class="text-gray-500">Logging out...</p>
  </div>
</template>

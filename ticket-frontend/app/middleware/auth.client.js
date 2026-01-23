export default defineNuxtPlugin(async () => {
  const authToken = useCookie('auth_token')
  const userRole = useCookie('user_role')

  // No token → nothing to validate
  if (!authToken.value) return

  try {
    await $fetch('http://localhost:8000/api/auth/check', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        Accept: 'application/json'
      }
    })
    // Token is valid → do nothing
  } catch (error) {
    // Token exists but is invalid
    useCookie('auth_token', { path: '/' }).value = null
    useCookie('user_role', { path: '/' }).value = null
    await navigateTo('/login')
  }
})

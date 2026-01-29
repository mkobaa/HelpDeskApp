export default defineNuxtRouteMiddleware((to) => {
  const authToken = useCookie('auth_token')
  const userRole = useCookie('user_role')

  if (!authToken.value && to.path !== '/login') {
    return navigateTo('/login')
  }


  const redirects = {
    admin: '/admin',
    supervisor: '/supervisor',
    technician: '/technician',
    user: '/user'
  }

  if (authToken.value && to.path === '/login') {
    return navigateTo(redirects[userRole.value] || '/')
  }

  if (to.path === '/') {
    if (authToken.value)
      return navigateTo(redirects[userRole.value] || '/')
    return navigateTo('/login')
  }

  if (authToken.value) {
    const expectedBase = redirects[userRole.value] || null
    if (expectedBase && to.path !== '/' && !to.path.startsWith(expectedBase)) {
      const allowedPrefixes = ['/profile', '/logout', '/login']
      const isAllowed = allowedPrefixes.some(p => to.path.startsWith(p))
      if (!isAllowed) return navigateTo(expectedBase)
    }
  }
})

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

  if (authToken.value) {
    const expectedBase = redirects[userRole.value] || null
    if (expectedBase && to.path !== '/' && !to.path.startsWith(expectedBase)) {
      // Allow certain public-ish routes that are not dashboard-specific
      const allowedPrefixes = ['/api', '/_', '/logout', '/login']
      const isAllowed = allowedPrefixes.some(p => to.path.startsWith(p))
      if (!isAllowed) return navigateTo(expectedBase)
    }
  }
})

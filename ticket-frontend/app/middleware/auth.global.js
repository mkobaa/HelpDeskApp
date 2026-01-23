export default defineNuxtRouteMiddleware((to) => {
  const authToken = useCookie('auth_token')
  const userRole = useCookie('user_role')

  if (!authToken.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (authToken.value && to.path === '/login') {
    const redirects = {
      admin: '/admin',
      supervisor: '/supervisor',
      technician: '/technician',
      user: '/user'
    }

    return navigateTo(redirects[userRole.value] || '/')
  }
})

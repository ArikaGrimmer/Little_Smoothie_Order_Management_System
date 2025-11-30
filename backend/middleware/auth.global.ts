export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  // Check if the route requires authentication
  const requiresAuth = to.meta.auth !== false

  // Debug logging (only in development)
  if (process.dev && to.path === '/') {
    console.log('[Auth Middleware] Route:', to.path, 'loggedIn:', loggedIn.value, 'user:', user.value?.email)
  }

  // If route requires auth and user is not logged in, redirect to login
  if (requiresAuth && !loggedIn.value) {
    if (process.dev) {
      console.log('[Auth Middleware] Redirecting to login - not authenticated')
    }
    return navigateTo('/login')
  }

  // If user is logged in and trying to access login page, redirect to home
  if (loggedIn.value && to.path === '/login') {
    if (process.dev) {
      console.log('[Auth Middleware] Redirecting to home - already logged in')
    }
    return navigateTo('/')
  }
})


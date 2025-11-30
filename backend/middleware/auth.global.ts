export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, user, refresh } = useUserSession()

  // Refresh session to ensure we have the latest state (important after login redirect)
  // This is especially important when coming from a server-side redirect
  if (process.client) {
    try {
      await refresh()
    } catch (e) {
      // Ignore refresh errors - session might not be set yet
      if (process.dev) {
        console.log('[Auth Middleware] Session refresh failed (might be expected):', e)
      }
    }
  }

  // Check if the route requires authentication
  const requiresAuth = to.meta.auth !== false

  // Debug logging (only in development)
  if (process.dev) {
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


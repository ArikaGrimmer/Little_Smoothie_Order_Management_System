export default defineNuxtRouteMiddleware((to) => {
  const { user, loggedIn } = useUserSession()
  
  console.log('[Operator Middleware] Checking access for:', to.path)
  console.log('[Operator Middleware] Logged in:', loggedIn.value)
  console.log('[Operator Middleware] User:', user.value)
  
  // First check if user is logged in
  if (!loggedIn.value || !user.value) {
    console.log('[Operator Middleware] Not logged in, redirecting to login')
    return navigateTo('/login')
  }
  
  // Check if user has operator role
  const userRoles = (user.value as any)?.roles || []
  const hasOperatorRole = userRoles.includes('operator')
  
  console.log('[Operator Middleware] User roles:', userRoles)
  console.log('[Operator Middleware] Has operator role:', hasOperatorRole)
  
  if (!hasOperatorRole) {
    // Redirect to home if user doesn't have operator role
    console.warn('[Operator Middleware] Access denied - user does not have operator role')
    console.warn('[Operator Middleware] User data:', JSON.stringify(user.value, null, 2))
    return navigateTo('/?error=operator_access_required')
  }
  
  console.log('[Operator Middleware] Access granted')
})


export default defineEventHandler(async (event) => {
  // Read the request body to get role preference (if any)
  let requestedRole = 'customer'
  try {
    const body = await readBody(event)
    requestedRole = body?.role || 'customer'
  } catch {
    // No body or invalid body, use default
  }

  // Determine roles based on request
  const roles = ['customer']
  if (requestedRole === 'operator') {
    roles.push('operator')
  }

  await setUserSession(event, {
    user: {
      id: `demo-${requestedRole}-${Date.now()}`,
      name: `Demo ${requestedRole.charAt(0).toUpperCase() + requestedRole.slice(1)}`,
      email: `demo-${requestedRole}@smoothie.local`,
      avatar: `https://ui-avatars.com/api/?name=Demo+${requestedRole}&background=${requestedRole === 'operator' ? '00f2fe' : '667eea'}&color=fff`,
      provider: 'demo',
      roles
    },
    loggedInAt: Date.now()
  })

  return {
    success: true,
    message: 'Demo login successful'
  }
})


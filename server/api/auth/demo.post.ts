export default defineEventHandler(async (event) => {
  // Only allow demo login in development
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Demo login not available in production'
    })
  }

  await setUserSession(event, {
    user: {
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@smoothie.local',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=0ea5e9&color=fff',
      provider: 'demo',
      roles: ['customer', 'operator'] // Demo user has both roles for testing
    },
    loggedInAt: Date.now()
  })

  return {
    success: true,
    data: {
      message: 'Demo login successful'
    }
  }
})


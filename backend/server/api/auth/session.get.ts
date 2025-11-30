export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  // Debug: Log cookie information
  if (process.dev) {
    const cookies = getCookie(event, 'authjs.session-token') || getCookie(event, 'nuxt-session') || 'no cookie found'
    console.log('[Session API] Cookie check:', {
      hasCookie: cookies !== 'no cookie found',
      cookieLength: typeof cookies === 'string' ? cookies.length : 0,
      requestHost: event.node.req.headers.host,
      hasSession: !!session,
      hasUser: !!session?.user
    })
  }

  return {
    user: session.user || null,
    loggedIn: !!session.user
  }
})


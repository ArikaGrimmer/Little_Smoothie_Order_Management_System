import type { H3Event } from 'h3'

export async function requireAuth(event: H3Event) {
  const session = await getUserSession(event)
  
  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  return session
}

export async function requireRole(event: H3Event, role: string) {
  const session = await requireAuth(event)
  const userRoles = (session.user as any)?.roles || []
  
  if (!userRoles.includes(role)) {
    throw createError({
      statusCode: 403,
      statusMessage: `${role} role required`
    })
  }
  
  return session
}

export function getUserId(session: any): string {
  // Return the consistent user ID from database
  // This ID is set during login and persists across sessions
  return (session.user as any)?.id || (session.user as any)?.email
}


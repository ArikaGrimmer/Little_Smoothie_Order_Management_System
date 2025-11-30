import { findOrCreateUser } from '../../utils/userService'

export default defineEventHandler(async (event) => {
  // Read the request body to get role preference (if any)
  let requestedRole = 'customer'
  try {
    const body = await readBody(event)
    requestedRole = body?.role || 'customer'
  } catch {
    // No body or invalid body, use default
  }

  const userId = `demo-${requestedRole}`
  const email = `demo-${requestedRole}@smoothie.local`
  
  // Save or update demo user in database
  // Note: For demo users, we'll manually set roles to match request
  const dbUser = await findOrCreateUser({
    id: userId,
    email,
    name: `Demo ${requestedRole.charAt(0).toUpperCase() + requestedRole.slice(1)}`,
    avatar: `https://ui-avatars.com/api/?name=Demo+${requestedRole}&background=${requestedRole === 'operator' ? '00f2fe' : '667eea'}&color=fff`,
    provider: 'demo',
    organizations: []
  })

  // For demo users, override roles based on request
  if (requestedRole === 'operator' && !dbUser.roles.includes('operator')) {
    // Update roles in database for demo operator
    const { getDB } = await import('../../utils/mongo')
    const db = await getDB()
    await db.collection('users').updateOne(
      { id: userId },
      { $set: { roles: ['customer', 'operator'] } }
    )
    dbUser.roles = ['customer', 'operator']
  }

  console.log(`[Demo Login] User logged in: ${dbUser.email}, roles: ${dbUser.roles.join(', ')}`)

  await setUserSession(event, {
    user: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: dbUser.avatar,
      provider: 'demo',
      roles: dbUser.roles
    },
    loggedInAt: Date.now()
  })

  return {
    success: true,
    message: 'Demo login successful',
    user: {
      name: dbUser.name,
      email: dbUser.email,
      roles: dbUser.roles
    }
  }
})


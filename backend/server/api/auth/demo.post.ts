import { findOrCreateUser } from '../../utils/userService'
import { getDB } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const role = body?.role || 'customer' // Default to customer if not specified
  
  // Validate role
  if (role !== 'customer' && role !== 'operator') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid role. Must be "customer" or "operator"'
    })
  }

  // Create demo user data based on role
  const demoUserData = {
    id: `demo-${role}`,
    email: `demo-${role}@smoothie.local`,
    name: role === 'operator' ? 'Demo Operator' : 'Demo Customer',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(role === 'operator' ? 'Demo+Operator' : 'Demo+Customer')}&background=667eea&color=fff`,
    provider: 'demo',
    organizations: role === 'operator' ? ['demo-operator-org'] : []
  }

  console.log(`[Demo Login] Creating/updating demo ${role} user...`)
  
  // Find or create user in database
  const dbUser = await findOrCreateUser(demoUserData)
  
  // For demo operator, ensure they have operator role
  if (role === 'operator' && !dbUser.roles.includes('operator')) {
    const db = await getDB()
    const users = db.collection('users')
    await users.updateOne(
      { _id: dbUser._id },
      { $set: { roles: ['customer', 'operator'] } }
    )
    dbUser.roles = ['customer', 'operator']
  }

  console.log(`[Demo Login] Demo ${role} user logged in: ${dbUser.email}, roles: ${dbUser.roles.join(', ')}`)

  // Set session
  await setUserSession(event, {
    user: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: dbUser.avatar,
      provider: 'demo',
      organizations: dbUser.organizations,
      roles: dbUser.roles
    },
    loggedInAt: Date.now()
  })

  return {
    ok: true,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      roles: dbUser.roles
    }
  }
})


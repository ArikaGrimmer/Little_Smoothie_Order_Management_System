export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['openid', 'profile', 'email'],
  },
  async onSuccess(event, { user, tokens }) {
    try {
      // Google user object structure:
      // - sub: unique identifier
      // - name: full name
      // - email: email address
      // - picture: profile picture URL
      // - given_name, family_name: name parts

      // For Google, we can check email domain for role assignment
      const email = user.email
      const domain = email.split('@')[1]

      // Optionally fetch Google Workspace groups if you have admin SDK access
      // For now, we'll use email domain for role determination
      let groups: string[] = [domain]

      await setUserSession(event, {
        user: {
          id: user.sub || user.id.toString(),
          name: user.name || email,
          email: email,
          avatar: user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || email)}&background=4285f4&color=fff`,
          provider: 'google',
          domain: domain,
          groups: groups,
          roles: determineRoles(domain, email)
        },
        loggedInAt: Date.now()
      })

      return sendRedirect(event, '/')
    } catch (error) {
      console.error('Error processing Google user data:', error)
      
      // Fallback
      await setUserSession(event, {
        user: {
          id: user.sub || user.id.toString(),
          name: user.name || user.email,
          email: user.email,
          avatar: user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=4285f4&color=fff`,
          provider: 'google',
          roles: ['customer'] // Default role
        },
        loggedInAt: Date.now()
      })

      return sendRedirect(event, '/')
    }
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/login?error=google_auth_failed')
  }
})

function determineRoles(domain: string, email: string): string[] {
  const roles = ['customer'] // Default role

  // Grant operator role based on email domain
  // Customize this list with your organization's domains
  const operatorDomains = [
    'yourdomain.com',
    'smoothie-stand.com',
    // Add your domains here
  ]

  if (operatorDomains.some(d => domain.toLowerCase() === d.toLowerCase())) {
    roles.push('operator')
  }

  // Alternative: Check for specific email patterns
  if (email.toLowerCase().includes('operator') || 
      email.toLowerCase().includes('admin') ||
      email.toLowerCase().includes('staff')) {
    roles.push('operator')
  }

  return roles
}


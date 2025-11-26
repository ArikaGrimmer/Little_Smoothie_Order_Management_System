export default defineOAuthMicrosoftEventHandler({
  config: {
    scope: ['openid', 'profile', 'email', 'User.Read'],
  },
  async onSuccess(event, { user, tokens }) {
    try {
      // Microsoft user object structure:
      // - id: unique identifier
      // - displayName: user's display name
      // - mail or userPrincipalName: email
      // - givenName, surname: name parts
      
      const email = user.mail || user.userPrincipalName || user.email
      const displayName = user.displayName || `${user.givenName || ''} ${user.surname || ''}`.trim()

      // Fetch user's groups (for role assignment)
      let groups: string[] = []
      try {
        const groupsResponse = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          groups = groupsData.value?.map((group: any) => group.displayName || group.mail) || []
        }
      } catch (error) {
        console.warn('Failed to fetch Microsoft groups:', error)
      }

      await setUserSession(event, {
        user: {
          id: user.id.toString(),
          name: displayName || email,
          email: email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || email)}&background=0078d4&color=fff`,
          provider: 'microsoft',
          groups: groups,
          roles: determineRoles(groups, email)
        },
        loggedInAt: Date.now()
      })

      return sendRedirect(event, '/')
    } catch (error) {
      console.error('Error processing Microsoft user data:', error)
      
      // Fallback without groups
      const email = user.mail || user.userPrincipalName || user.email
      const displayName = user.displayName || email
      
      await setUserSession(event, {
        user: {
          id: user.id.toString(),
          name: displayName,
          email: email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0078d4&color=fff`,
          provider: 'microsoft',
          groups: [],
          roles: ['customer'] // Default role
        },
        loggedInAt: Date.now()
      })

      return sendRedirect(event, '/')
    }
  },
  onError(event, error) {
    console.error('Microsoft OAuth error:', error)
    return sendRedirect(event, '/login?error=microsoft_auth_failed')
  }
})

function determineRoles(groups: string[], email: string): string[] {
  const roles = ['customer'] // Default role

  // Grant operator role based on group membership or email domain
  if (groups.some(group => 
    group.toLowerCase().includes('smoothie') || 
    group.toLowerCase().includes('operator') ||
    group.toLowerCase().includes('admin')
  )) {
    roles.push('operator')
  }

  // Alternative: Grant operator role based on email domain
  // Uncomment and customize this if you want domain-based roles
  // if (email.endsWith('@yourdomain.com')) {
  //   roles.push('operator')
  // }

  return roles
}


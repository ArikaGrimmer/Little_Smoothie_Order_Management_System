export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['user', 'read:org']
  },
  async onSuccess(event, { user, tokens }) {
    try {
      // Fetch user's organization memberships from GitHub API
      const orgsResponse = await fetch('https://api.github.com/user/orgs', {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
          'Authorization': `Bearer ${tokens.access_token}`,
          'Accept': 'application/vnd.github+json',
        }
      })

      let organizations: string[] = []
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json()
        organizations = orgsData.map((org: any) => org.login)
      } else {
        console.warn('Failed to fetch GitHub organizations:', orgsResponse.status)
      }

      await setUserSession(event, {
        user: {
          id: user.id.toString(),
          name: user.name || user.login,
          email: user.email,
          avatar: user.avatar_url,
          provider: 'github',
          organizations,
          roles: determineRoles(organizations)
        },
        loggedInAt: Date.now()
      })

      return sendRedirect(event, '/')
    } catch (error) {
      console.error('Error fetching GitHub user data:', error)
      // Fallback without organizations
      await setUserSession(event, {
        user: {
          id: user.id.toString(),
          name: user.name || user.login,
          email: user.email,
          avatar: user.avatar_url,
          provider: 'github',
          organizations: [],
          roles: ['customer']
        },
        loggedInAt: Date.now()
      })

      return sendRedirect(event, '/')
    }
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?error=github_auth_failed')
  }
})

function determineRoles(organizations: string[]): string[] {
  const roles = ['customer'] // Default role

  // If user belongs to an organization with 'smoothie' or 'operator' in the name,
  // grant them operator role
  if (organizations.some(org => 
    org.toLowerCase().includes('smoothie') || 
    org.toLowerCase().includes('operator')
  )) {
    roles.push('operator')
  }

  return roles
}


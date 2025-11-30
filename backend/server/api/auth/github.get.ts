import { findOrCreateUser } from '../../utils/userService'

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['user', 'read:org', 'user:email']
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

      // Save or update user in database
      const dbUser = await findOrCreateUser({
        id: user.id.toString(),
        email: user.email,
        name: user.name || user.login,
        avatar: user.avatar_url,
        provider: 'github',
        githubId: user.id.toString(),
        organizations
      })

      console.log(`[GitHub OAuth] User logged in: ${dbUser.email}, roles: ${dbUser.roles.join(', ')}`)

      // Set session with database user info
      await setUserSession(event, {
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          avatar: dbUser.avatar,
          provider: 'github',
          organizations: dbUser.organizations,
          roles: dbUser.roles
        },
        loggedInAt: Date.now()
      })

      return sendRedirect(event, '/')
    } catch (error) {
      console.error('Error in GitHub OAuth:', error)
      
      // Try fallback without organizations
      try {
        const dbUser = await findOrCreateUser({
          id: user.id.toString(),
          email: user.email,
          name: user.name || user.login,
          avatar: user.avatar_url,
          provider: 'github',
          githubId: user.id.toString(),
          organizations: []
        })

        await setUserSession(event, {
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            avatar: dbUser.avatar,
            provider: 'github',
            organizations: [],
            roles: dbUser.roles
          },
          loggedInAt: Date.now()
        })

        return sendRedirect(event, '/')
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        return sendRedirect(event, '/login?error=github_auth_failed')
      }
    }
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?error=github_auth_failed')
  }
})


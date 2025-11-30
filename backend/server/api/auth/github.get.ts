import { findOrCreateUser } from '../../utils/userService'

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['user', 'read:org', 'user:email']
  },
  async onSuccess(event, { user, tokens }) {
    try {
      console.log('[GitHub OAuth] onSuccess called, user:', user?.email || user?.login)
      
      // Check if user email is available
      if (!user.email) {
        console.error('[GitHub OAuth] User email is missing!')
        throw new Error('User email is required but not provided by GitHub')
      }

      // Fetch user's organization memberships from GitHub API
      let organizations: string[] = []
      try {
        const orgsResponse = await fetch('https://api.github.com/user/orgs', {
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'Authorization': `Bearer ${tokens.access_token}`,
            'Accept': 'application/vnd.github+json',
          }
        })

        if (orgsResponse.ok) {
          const orgsData = await orgsResponse.json()
          organizations = orgsData.map((org: any) => org.login)
          console.log('[GitHub OAuth] Fetched organizations:', organizations)
        } else {
          console.warn('[GitHub OAuth] Failed to fetch organizations:', orgsResponse.status, orgsResponse.statusText)
        }
      } catch (orgError) {
        console.warn('[GitHub OAuth] Error fetching organizations (non-fatal):', orgError)
      }

      // Save or update user in database
      console.log('[GitHub OAuth] Saving user to database...')
      const dbUser = await findOrCreateUser({
        id: user.id.toString(),
        email: user.email,
        name: user.name || user.login,
        avatar: user.avatar_url,
        provider: 'github',
        githubId: user.id.toString(),
        organizations
      })

      console.log(`[GitHub OAuth] User saved: ${dbUser.email}, roles: ${dbUser.roles.join(', ')}`)

      // Set session with database user info
      console.log('[GitHub OAuth] Setting user session...')
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

      console.log('[GitHub OAuth] Session set, redirecting to home...')
      
      // Verify session was set
      const session = await getUserSession(event)
      console.log('[GitHub OAuth] Session verification:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email
      })
      
      // Check response headers to see if cookie is being set
      const headers = event.node.res.getHeaders()
      const setCookieHeaders = headers['set-cookie'] || []
      console.log('[GitHub OAuth] Set-Cookie headers:', setCookieHeaders)
      console.log('[GitHub OAuth] Request host:', event.node.req.headers.host)
      console.log('[GitHub OAuth] Request origin:', event.node.req.headers.origin)
      
      return sendRedirect(event, '/')
    } catch (error: any) {
      console.error('[GitHub OAuth] Error in onSuccess:', error)
      console.error('[GitHub OAuth] Error message:', error?.message)
      console.error('[GitHub OAuth] Error stack:', error?.stack)
      
      // Try fallback without organizations
      try {
        console.log('[GitHub OAuth] Trying fallback without organizations...')
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

        console.log('[GitHub OAuth] Fallback succeeded, redirecting...')
        return sendRedirect(event, '/')
      } catch (fallbackError: any) {
        console.error('[GitHub OAuth] Fallback also failed:', fallbackError)
        console.error('[GitHub OAuth] Fallback error message:', fallbackError?.message)
        console.error('[GitHub OAuth] Fallback error stack:', fallbackError?.stack)
        return sendRedirect(event, '/login?error=github_auth_failed')
      }
    }
  },
  onError(event, error: any) {
    console.error('[GitHub OAuth] onError called')
    console.error('[GitHub OAuth] Error:', error)
    console.error('[GitHub OAuth] Error type:', typeof error)
    console.error('[GitHub OAuth] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause
    })
    
    // Check if it's a configuration error
    const errorMessage = error?.message || String(error) || ''
    if (errorMessage.includes('client_id') || errorMessage.includes('CLIENT_ID') || errorMessage.includes('clientId')) {
      console.error('❌ GitHub OAuth Client ID is missing!')
      console.error('Please set NUXT_OAUTH_GITHUB_CLIENT_ID in your .env file')
      return sendRedirect(event, '/login?error=github_config_missing')
    }
    
    return sendRedirect(event, '/login?error=github_auth_failed')
  }
})


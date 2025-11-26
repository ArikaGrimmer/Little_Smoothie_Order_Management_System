// https://nuxt.com/docs/api/configuration/nuxt-config

// Build OAuth config dynamically - only include providers with credentials
const oauthConfig: any = {}

// GitHub OAuth (optional)
if (process.env.NUXT_OAUTH_GITHUB_CLIENT_ID && process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET) {
  oauthConfig.github = {
    clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID,
    clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
  }
}

// GitLab OAuth (optional)
if (process.env.NUXT_OAUTH_GITLAB_CLIENT_ID && process.env.NUXT_OAUTH_GITLAB_CLIENT_SECRET) {
  oauthConfig.gitlab = {
    clientId: process.env.NUXT_OAUTH_GITLAB_CLIENT_ID,
    clientSecret: process.env.NUXT_OAUTH_GITLAB_CLIENT_SECRET,
    redirectURL: process.env.NUXT_OAUTH_GITLAB_REDIRECT_URL || 'http://localhost:3000/api/auth/gitlab',
  }
}

// Microsoft OAuth (optional)
if (process.env.NUXT_OAUTH_MICROSOFT_CLIENT_ID && process.env.NUXT_OAUTH_MICROSOFT_CLIENT_SECRET) {
  oauthConfig.microsoft = {
    clientId: process.env.NUXT_OAUTH_MICROSOFT_CLIENT_ID,
    clientSecret: process.env.NUXT_OAUTH_MICROSOFT_CLIENT_SECRET,
    redirectURL: process.env.NUXT_OAUTH_MICROSOFT_REDIRECT_URL || 'http://localhost:3000/api/auth/microsoft',
  }
}

// Google OAuth (optional)
if (process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID && process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET) {
  oauthConfig.google = {
    clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
    clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,
    redirectURL: process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL || 'http://localhost:3000/api/auth/google',
  }
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'nuxt-auth-utils'],
  css: ['~/main.css'],
  
  // Color mode configuration for dark/light mode
  colorMode: {
    preference: 'system', // Automatically follow system preference
    fallback: 'light',    // Fallback if system preference unavailable
    classSuffix: '',      // Remove 'mode' suffix from class names
  },
  
  runtimeConfig: {
    mongoUrl: process.env.MONGO_URL,
    
    // OAuth configurations (only includes providers with credentials)
    oauth: oauthConfig,
    
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  // Session configuration for nuxt-auth-utils
  session: {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  }
})

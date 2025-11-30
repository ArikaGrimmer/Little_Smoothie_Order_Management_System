// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-auth-utils'],
  runtimeConfig: {
    mongoUrl: process.env.MONGO_URL, 
    redisUrl: process.env.REDIS_URL,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },
  app: {
    head: {
      title: 'Little Smoothie Order System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  // Session configuration for nuxt-auth-utils
  session: {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    cookie: {
      // In development, allow cookies over HTTP for local network access
      secure: false, // Must be false for HTTP (IP addresses)
      // For IP addresses, try 'lax' - some browsers may still block it
      // If this doesn't work, the browser might be blocking cookies for IP addresses entirely
      sameSite: 'lax',
      httpOnly: true,
      path: '/',
      // Don't set domain - this allows cookies to work with both localhost and IP addresses
      // Setting domain would restrict cookies to that specific domain
    },
    // Add session secret for better state management
    password: process.env.NUXT_SESSION_PASSWORD || 'dev-session-secret-change-in-production-min-32-chars'
  }
})

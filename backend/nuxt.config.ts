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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  }
})

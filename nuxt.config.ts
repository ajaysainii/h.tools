export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  css: [
    '@/assets/css/vendors.css',
    '@/assets/css/main.css',
    '@/assets/css/theme.css',
  ],
  vite: {
    define: {
      'window.global': {},
    },
  },
  app: {
    head: {
      title: 'Text Converter',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    },
  },
  runtimeConfig: {
    public: {
      FB_API_KEY: process.env.NUXT_PUBLIC_FB_API_KEY,
      FB_AUTH_DOMAIN: process.env.NUXT_PUBLIC_FB_AUTH_DOMAIN,
      FB_PROJECT_ID: process.env.NUXT_PUBLIC_FB_PROJECT_ID,
      FB_APP_ID: process.env.NUXT_PUBLIC_FB_APP_ID,
    },
  },
})

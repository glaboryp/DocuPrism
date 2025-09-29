// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  
  // PWA Configuration
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      // Configuración simplificada para evitar warnings
      globPatterns: ['**/*.{js,css,html}'],
      globIgnores: [
        '**/node_modules/**/*',
        'sw.js',
        'workbox-*.js'
      ],
      // Configuración avanzada para offline
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /\/_nuxt\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'nuxt-assets-cache',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true,
      // Permitir instalación inmediata
      periodicSyncForUpdates: 20
    },
    devOptions: {
      enabled: true,
      type: 'module'
    },
    manifest: {
      name: 'DocuPrism - Document Analysis',
      short_name: 'DocuPrism',
      description: 'Privacy-first, offline-capable PWA for on-device document analysis using Chrome Built-in AI',
      theme_color: '#2563eb',
      background_color: '#1f2937',
      display: 'standalone',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/',
      categories: ['productivity', 'utilities', 'education'],
      lang: 'en',
      dir: 'ltr',
      icons: [
        {
          src: 'icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      shortcuts: [
        {
          name: 'New Analysis',
          short_name: 'Analyze',
          description: 'Start a new document analysis',
          url: '/',
          icons: [
            {
              src: 'icon.png',
              sizes: '192x192'
            }
          ]
        }
      ]
    }
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true
  },

  // Vite configuration with aliases
  vite: {
    resolve: {
      alias: {
        '@assets': './assets',
        '@styles': './assets/css'
      }
    }
  },

  // CSS configuration - Will be handled directly in app.vue
  // css: ['@styles/main.css'],

  // App configuration
  app: {
    head: {
      title: 'DocuPrism - On-Device Document Analysis',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Privacy-first, offline-capable PWA for on-device document analysis using Chrome Built-in AI' 
        },
        { name: 'theme-color', content: '#6366f1' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icon.png' }
      ]
    }
  }
})
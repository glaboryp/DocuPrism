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
      navigateFallbackDenylist: [/^\/api\//, /^\/admin\//],
      // Configuración agresiva para true offline-first
      globPatterns: [
        '**/*.{js,css,html}',
        '**/*.{png,jpg,jpeg,gif,svg,ico,webp}',
        '**/*.{woff,woff2,ttf,eot}'
      ],
      globIgnores: [
        '**/node_modules/**/*',
        'sw.js',
        'workbox-*.js'
      ],
      // Configuración avanzada para offline-first
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      // Precache más agresivo
      modifyURLPrefix: {
        '': '/'
      },
      runtimeCaching: [
        // Cache de la página principal - CRUCIAL para offline-first
        {
          urlPattern: /^https:\/\/localhost:\d+\/$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'main-page-cache',
            expiration: {
              maxEntries: 5,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 1 semana
            },
            networkTimeoutSeconds: 3
          }
        },
        // Cache para cualquier dominio de la app
        {
          urlPattern: ({ request, url }) => {
            return request.destination === 'document' && url.pathname === '/'
          },
          handler: 'NetworkFirst',
          options: {
            cacheName: 'main-page-cache',
            expiration: {
              maxEntries: 5,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 1 semana
            },
            networkTimeoutSeconds: 3
          }
        },
        // Assets de Nuxt - Cache First para máximo rendimiento offline
        {
          urlPattern: /\/_nuxt\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'nuxt-assets-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Imágenes y assets estáticos
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Google Fonts
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
      type: 'module',
      suppressWarnings: true
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

  // Development configuration
  devServer: {
    port: 3000,
    host: 'localhost'
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
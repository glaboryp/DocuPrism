// Plugin para mejorar el cache offline
export default function () {
  // Solo ejecutar en el cliente
  if (typeof window === 'undefined') return

  // Silenciar errores de WebSocket en desarrollo cuando está offline
  if (import.meta.dev) {
    const originalConsoleError = console.error
    console.error = (...args) => {
      // Filtrar errores conocidos de desarrollo offline
      const errorMessage = args.join(' ')
      
      // Errores de WebSocket/HMR que son normales offline
      const devOfflineErrors = [
        'WebSocket connection',
        'failed to connect to websocket',
        'Cannot read properties of undefined (reading \'send\')',
        'was preloaded using link preload but not used'
      ]
      
      const shouldSilence = devOfflineErrors.some(error => 
        errorMessage.includes(error)
      )
      
      if (!shouldSilence) {
        originalConsoleError.apply(console, args)
      }
    }

    // También silenciar algunos warnings de desarrollo
    const originalConsoleWarn = console.warn
    console.warn = (...args) => {
      const warningMessage = args.join(' ')
      
      const devOfflineWarnings = [
        'vite',
        'WebSocket',
        'HMR'
      ]
      
      const shouldSilence = devOfflineWarnings.some(warning => 
        warningMessage.includes(warning) && !navigator.onLine
      )
      
      if (!shouldSilence) {
        originalConsoleWarn.apply(console, args)
      }
    }
  }

  // Registrar el service worker tan pronto como sea posible
  if ('serviceWorker' in navigator) {
    // Precargar recursos críticos
    const preloadCriticalResources = async () => {
      try {
        // Precargar la página principal
        await fetch('/', { 
          method: 'GET',
          cache: 'force-cache' 
        })

        // Precargar assets críticos si existen
        const criticalAssets = [
          '/icon.png',
          '/_nuxt/entry.js', // Puede variar según el build
        ]

        for (const asset of criticalAssets) {
          try {
            await fetch(asset, { 
              method: 'GET',
              cache: 'force-cache' 
            })
          } catch (error) {
            // No es crítico si falla
            console.debug(`Could not preload ${asset}:`, error)
          }
        }
      } catch (error) {
        console.debug('Preload failed:', error)
      }
    }

    // Ejecutar precarga después de que la página se haya cargado
    if (document.readyState === 'complete') {
      setTimeout(preloadCriticalResources, 1000)
    } else {
      window.addEventListener('load', () => {
        setTimeout(preloadCriticalResources, 1000)
      })
    }

    // Manejar actualizaciones del service worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Nuevo service worker activo - la app puede necesitar recarga
      console.log('Service Worker updated')
      
      // Opcional: Mostrar notificación de actualización
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('DocuPrism actualizado', {
          body: 'La aplicación se ha actualizado con nuevas funcionalidades.',
          icon: '/icon.png'
        })
      }
    })

    // Detectar cuando la app va offline/online
    const updateOnlineStatus = () => {
      if (navigator.onLine) {
        console.log('App back online - syncing if needed')
        // Aquí podrías sincronizar datos si fuera necesario
      } else {
        console.log('App now offline - using cached resources')
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  }

  // Cache adicional usando la Cache API directamente
  const cacheEssentialResources = async () => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('docuprism-essential-v1')
        
        // Recursos esenciales que SIEMPRE deben estar disponibles offline
        const essentialResources = [
          '/',
          '/icon.png',
        ]

        // Solo cachear si no están ya cacheados
        for (const resource of essentialResources) {
          const cachedResponse = await cache.match(resource)
          if (!cachedResponse) {
            try {
              await cache.add(resource)
            } catch (error) {
              console.debug(`Could not cache ${resource}:`, error)
            }
          }
        }
      } catch (error) {
        console.debug('Essential cache failed:', error)
      }
    }
  }

  // Ejecutar cache esencial
  if (document.readyState === 'complete') {
    cacheEssentialResources()
  } else {
    window.addEventListener('load', cacheEssentialResources)
  }
}
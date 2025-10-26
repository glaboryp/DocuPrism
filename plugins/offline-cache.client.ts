// Plugin to improve offline cache
export default defineNuxtPlugin(() => {
  // Only execute on the client
  if (typeof window === 'undefined') return

  // Register the service worker as soon as possible
  if ('serviceWorker' in navigator) {
    // Preload critical resources
    const preloadCriticalResources = async () => {
      try {
        // Preload the main page
        await fetch('/', { 
          method: 'GET',
          cache: 'force-cache' 
        })

        // Preload critical assets if they exist
        const criticalAssets = [
          '/icon.png',
          '/_nuxt/entry.js', // May vary depending on build
        ]

        for (const asset of criticalAssets) {
          try {
            await fetch(asset, { 
              method: 'GET',
              cache: 'force-cache' 
            })
          } catch (error) {
            // Not critical if it fails
            console.debug(`Could not preload ${asset}:`, error)
          }
        }
      } catch (error) {
        console.debug('Preload failed:', error)
      }
    }

    // Execute preload after the page has loaded
    if (document.readyState === 'complete') {
      setTimeout(preloadCriticalResources, 1000)
    } else {
      window.addEventListener('load', () => {
        setTimeout(preloadCriticalResources, 1000)
      })
    }

    // Handle service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // New service worker active - the app may need reload
      console.log('Service Worker updated')
      
      // Optional: Show update notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('DocuPrism updated', {
          body: 'The application has been updated with new features.',
          icon: '/icon.png'
        })
      }
    })

    // Detect when the app goes offline/online
    const updateOnlineStatus = () => {
      if (navigator.onLine) {
        console.log('App back online - syncing if needed')
        // Here you could sync data if necessary
      } else {
        console.log('App now offline - using cached resources')
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  }

  // Additional cache using the Cache API directly - DISABLED
  // The Workbox precache is handling this now
  const cacheEssentialResources = async () => {
    if ('caches' in window) {
      try {
        // Just verify that the precache exists
        const cacheNames = await caches.keys()
        const workboxCache = cacheNames.find(name => name.includes('workbox-precache'))
        
        if (workboxCache) {
          const cache = await caches.open(workboxCache)
          const cachedUrls = await cache.keys()
          console.log('Workbox precache contains:', cachedUrls.length, 'resources')
          
          // Check if root is cached
          const rootCached = cachedUrls.some(req => 
            req.url.includes('/?__WB_REVISION__') || req.url.endsWith('/')
          )
          console.log('Root page cached:', rootCached)
        } else {
          console.warn('Workbox precache not found')
        }
      } catch (error) {
        console.debug('Cache verification failed:', error)
      }
    }
  }

  // Execute essential cache
  if (document.readyState === 'complete') {
    cacheEssentialResources()
  } else {
    window.addEventListener('load', cacheEssentialResources)
  }
})
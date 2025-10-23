// Middleware to silently ignore service worker requests in development
export default defineNuxtRouteMiddleware((to) => {
  // Ignore service worker routes
  if (to.path.includes('sw.js') || to.path.includes('workbox')) {
    return abortNavigation()
  }
})

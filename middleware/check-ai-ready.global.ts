// Middleware to prevent navigation while AI is being checked
export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (import.meta.server) return

  // Get the AI checking state
  const { isCheckingSupport } = useChromeAI()
  
  // If AI is still being checked and user is trying to navigate
  if (isCheckingSupport.value && from.path !== to.path) {
    // Prevent navigation
    return abortNavigation()
  }
})

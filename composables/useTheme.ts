import { ref, onMounted, readonly } from 'vue'

export type Theme = 'light' | 'dark'

export const useTheme = () => {
  // Reactive state for theme preference (default to dark)
  const isDark = ref<boolean>(true)
  
  // Toggle between light and dark
  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateDocumentClass()
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-preference', isDark.value ? 'dark' : 'light')
    }
  }
  
  // Set specific theme
  const setTheme = (theme: Theme) => {
    isDark.value = theme === 'dark'
    updateDocumentClass()
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-preference', theme)
    }
  }
  
  // Update document class
  const updateDocumentClass = () => {
    if (typeof document !== 'undefined') {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
  
  // Initialize theme from localStorage
  const initializeTheme = () => {
    if (typeof window !== 'undefined') {
      // Check current state from DOM (may have been set by inline script)
      const currentlyDark = document.documentElement.classList.contains('dark')
      
      const stored = localStorage.getItem('theme-preference') as Theme | null
      if (stored) {
        isDark.value = stored === 'dark'
      } else {
        // Use current DOM state if no stored preference
        isDark.value = currentlyDark || window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      
      // Only update DOM if there's a mismatch
      if (isDark.value !== currentlyDark) {
        updateDocumentClass()
      }
    }
  }
  
  // Initialize on mount
  onMounted(() => {
    initializeTheme()
  })
  
  return {
    isDark: readonly(isDark),
    toggleTheme,
    setTheme
  }
}
import { ref, readonly } from 'vue'

export type Theme = 'light' | 'dark'

// One theme state for the entire app. The header toggle, the mobile menu label and
// the menu's own toggle must all read and write the same ref, or they disagree
// about which mode is on.
const isDark = ref<boolean>(true)
let initialized = false

const updateDocumentClass = () => {
  if (typeof document === 'undefined') return

  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const writePreference = () => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('theme-preference', isDark.value ? 'dark' : 'light')
}

// Initialize from the class the inline script already set, or from storage.
const initializeTheme = () => {
  if (typeof window === 'undefined') return

  const currentlyDark = document.documentElement.classList.contains('dark')
  const stored = window.localStorage.getItem('theme-preference') as Theme | null

  isDark.value = stored
    ? stored === 'dark'
    : currentlyDark || window.matchMedia('(prefers-color-scheme: dark)').matches

  if (isDark.value !== currentlyDark) {
    updateDocumentClass()
  }

  initialized = true
}

export const useTheme = () => {
  if (!initialized) {
    initializeTheme()
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateDocumentClass()
    writePreference()
  }

  // Set specific theme
  const setTheme = (theme: Theme) => {
    isDark.value = theme === 'dark'
    updateDocumentClass()
    writePreference()
  }

  return {
    isDark: readonly(isDark),
    toggleTheme,
    setTheme
  }
}

import { describe, it, expect, beforeEach, vi } from 'vitest'

const loadTheme = async () => {
  vi.resetModules()
  return await import('../../composables/useTheme')
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('shares one state between every caller', async () => {
    const { useTheme } = await loadTheme()
    const header = useTheme()
    const menu = useTheme()

    expect(header.isDark.value).toBe(false)
    expect(menu.isDark.value).toBe(false)

    header.toggleTheme()

    expect(menu.isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme-preference')).toBe('dark')
  })

  it('initializes from the stored preference', async () => {
    localStorage.setItem('theme-preference', 'dark')

    const { useTheme } = await loadTheme()
    const theme = useTheme()

    expect(theme.isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})

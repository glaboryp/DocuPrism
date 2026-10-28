import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useI18n, detectBrowserLanguage } from '../../composables/useI18n'

describe('useI18n', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    document.documentElement.removeAttribute('lang')
  })

  describe('detectBrowserLanguage', () => {
    it('detects Spanish from navigator.language when no stored preference exists', () => {
      Object.defineProperty(navigator, 'language', { value: 'es-ES', configurable: true })
      Object.defineProperty(navigator, 'languages', { value: ['es-ES', 'es', 'en'], configurable: true })

      expect(detectBrowserLanguage()).toBe('es')
    })

    it('detects Spanish from navigator.languages Latin America variant', () => {
      Object.defineProperty(navigator, 'language', { value: 'es-419', configurable: true })
      Object.defineProperty(navigator, 'languages', { value: ['es-419', 'es'], configurable: true })

      expect(detectBrowserLanguage()).toBe('es')
    })

    it('falls back to English when browser language is unsupported', () => {
      Object.defineProperty(navigator, 'language', { value: 'fr-FR', configurable: true })
      Object.defineProperty(navigator, 'languages', { value: ['fr-FR', 'fr', 'de'], configurable: true })

      expect(detectBrowserLanguage()).toBe('en')
    })

    it('falls back to English when browser language is Japanese', () => {
      Object.defineProperty(navigator, 'language', { value: 'ja-JP', configurable: true })
      Object.defineProperty(navigator, 'languages', { value: ['ja-JP'], configurable: true })

      expect(detectBrowserLanguage()).toBe('en')
    })

    it('honors user localStorage preference over navigator.language', () => {
      localStorage.setItem('docuprism-locale', 'en')
      Object.defineProperty(navigator, 'language', { value: 'es-ES', configurable: true })
      Object.defineProperty(navigator, 'languages', { value: ['es-ES'], configurable: true })

      expect(detectBrowserLanguage()).toBe('en')
    })
  })

  describe('translation and locale switching', () => {
    it('provides translation in active locale', () => {
      const { setLocale, t } = useI18n()

      setLocale('en')
      expect(t('desk.title')).toBe('What does this document say?')

      setLocale('es')
      expect(t('desk.title')).toBe('¿Qué dice este documento?')
    })

    it('interpolates parameters correctly', () => {
      const { setLocale, t } = useI18n()

      setLocale('en')
      expect(t('history.charactersCount', { count: 42 })).toBe('42 characters')

      setLocale('es')
      expect(t('history.charactersCount', { count: 42 })).toBe('42 caracteres')
    })

    it('falls back to English when key is missing or undefined', () => {
      const { setLocale, t } = useI18n()
      setLocale('es')

      // Should return path if key doesn't exist in either
      expect(t('nonexistent.key')).toBe('nonexistent.key')
    })

    it('updates document html lang attribute on setLocale', () => {
      const { setLocale } = useI18n()

      setLocale('es')
      expect(document.documentElement.getAttribute('lang')).toBe('es')

      setLocale('en')
      expect(document.documentElement.getAttribute('lang')).toBe('en')
    })

    it('persists language selection to localStorage', () => {
      const { setLocale } = useI18n()

      setLocale('es')
      expect(localStorage.getItem('docuprism-locale')).toBe('es')

      setLocale('en')
      expect(localStorage.getItem('docuprism-locale')).toBe('en')
    })

    it('formats relative time in active language', () => {
      const { setLocale, formatRelativeTime } = useI18n()
      const now = Date.now()

      setLocale('en')
      expect(formatRelativeTime(now)).toBe('just now')
      expect(formatRelativeTime(now - 60000)).toBe('1 minute ago')
      expect(formatRelativeTime(now - 120000)).toBe('2 minutes ago')

      setLocale('es')
      expect(formatRelativeTime(now)).toBe('hace un momento')
      expect(formatRelativeTime(now - 60000)).toBe('hace 1 minuto')
      expect(formatRelativeTime(now - 120000)).toBe('hace 2 minutos')
    })
  })
})

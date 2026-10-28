import { ref, readonly, computed } from 'vue'
import {
  translations,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  type SupportedLocale,
  type LocaleInfo
} from '../locales'

const STORAGE_KEY = 'docuprism-locale'

// Singleton state shared across all components and callers
const currentLocale = ref<SupportedLocale>(DEFAULT_LOCALE)
let initialized = false

/**
 * Detects the user's preferred language.
 * 1. Stored user preference in localStorage
 * 2. Browser navigator.languages / navigator.language
 * 3. Fallback to English ('en') if not supported
 */
export function detectBrowserLanguage(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as SupportedLocale | null
    if (stored && stored in SUPPORTED_LOCALES) {
      return stored
    }
  } catch {
    // localStorage might fail in restricted sandboxes
  }

  try {
    const languages = window.navigator.languages && window.navigator.languages.length > 0
      ? window.navigator.languages
      : [window.navigator.language || '']

    for (const lang of languages) {
      if (!lang) continue
      const prefix = lang.toLowerCase().split('-')[0]
      if (prefix && prefix in SUPPORTED_LOCALES) {
        return prefix as SupportedLocale
      }
    }
  } catch {
    // navigator might fail in non-standard test runners
  }

  return DEFAULT_LOCALE
}

const updateHtmlLang = (code: SupportedLocale) => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('lang', code)
  document.documentElement.setAttribute('dir', SUPPORTED_LOCALES[code]?.dir || 'ltr')
}

const initializeI18n = () => {
  if (typeof window === 'undefined') return
  currentLocale.value = detectBrowserLanguage()
  updateHtmlLang(currentLocale.value)
  initialized = true
}

export function useI18n() {
  if (!initialized) {
    initializeI18n()
  }

  const setLocale = (locale: SupportedLocale) => {
    if (!(locale in SUPPORTED_LOCALES)) return
    currentLocale.value = locale
    updateHtmlLang(locale)
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, locale)
      }
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Resolve a nested property path from a dictionary.
   */
  const getNestedValue = (obj: unknown, path: string): string | undefined => {
    const parts = path.split('.')
    let current: unknown = obj

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined
      }
      current = (current as Record<string, unknown>)[part]
    }

    return typeof current === 'string' ? current : undefined
  }

  /**
   * Translate a key into the active locale text with optional parameter substitution.
   */
  const t = (path: string, params?: Record<string, string | number>): string => {
    const localeDict = translations[currentLocale.value]
    const fallbackDict = translations[DEFAULT_LOCALE]

    let message = getNestedValue(localeDict, path)

    if (message === undefined) {
      message = getNestedValue(fallbackDict, path)
    }

    if (message === undefined) {
      return path
    }

    if (params) {
      return message.replace(/\{(\w+)\}/g, (match, key) => {
        return key in params ? String(params[key]) : match
      })
    }

    return message
  }

  const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
    const localeCode = currentLocale.value === 'es' ? 'es-ES' : 'en-US'
    try {
      return new Intl.NumberFormat(localeCode, options).format(num)
    } catch {
      return num.toLocaleString()
    }
  }

  const formatDate = (dateInput: Date | number, options?: Intl.DateTimeFormatOptions): string => {
    const date = typeof dateInput === 'number' ? new Date(dateInput) : dateInput
    const localeCode = currentLocale.value === 'es' ? 'es-ES' : 'en-US'
    try {
      return date.toLocaleDateString(localeCode, options)
    } catch {
      return date.toLocaleDateString()
    }
  }

  const formatRelativeTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      if (diffMinutes <= 0) return t('time.justNow')
      return diffMinutes === 1
        ? t('time.minuteAgo')
        : t('time.minutesAgo', { count: diffMinutes })
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours)
      return hours === 1
        ? t('time.hourAgo')
        : t('time.hoursAgo', { count: hours })
    } else if (diffDays < 7) {
      const days = Math.floor(diffDays)
      return days === 1
        ? t('time.dayAgo')
        : t('time.daysAgo', { count: days })
    } else {
      return formatDate(date)
    }
  }

  const currentLocaleInfo = computed<LocaleInfo>(() => {
    return SUPPORTED_LOCALES[currentLocale.value] || SUPPORTED_LOCALES[DEFAULT_LOCALE]
  })

  const availableLocales = computed<LocaleInfo[]>(() => {
    return Object.values(SUPPORTED_LOCALES)
  })

  return {
    locale: readonly(currentLocale),
    currentLocaleInfo,
    availableLocales,
    setLocale,
    t,
    formatNumber,
    formatDate,
    formatRelativeTime
  }
}

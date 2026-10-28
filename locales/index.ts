import { en, type TranslationSchema } from './en'
import { es } from './es'

export type SupportedLocale = 'en' | 'es'

export interface LocaleInfo {
  code: SupportedLocale
  name: string
  shortLabel: string
  dir: 'ltr' | 'rtl'
}

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleInfo> = {
  en: {
    code: 'en',
    name: 'English',
    shortLabel: 'EN',
    dir: 'ltr'
  },
  es: {
    code: 'es',
    name: 'Español',
    shortLabel: 'ES',
    dir: 'ltr'
  }
}

export const DEFAULT_LOCALE: SupportedLocale = 'en'

export const translations: Record<SupportedLocale, TranslationSchema> = {
  en,
  es
}

export { en, es }
export type { TranslationSchema }

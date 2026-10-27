import { useI18n } from '../composables/useI18n'

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = useI18n()

  // Make $t and $locale available in all templates
  nuxtApp.provide('t', i18n.t)
  nuxtApp.provide('locale', i18n.locale)
  nuxtApp.provide('setLocale', i18n.setLocale)
})

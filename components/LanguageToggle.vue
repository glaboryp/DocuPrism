<template>
  <button
    type="button"
    class="inline-flex h-11 items-center justify-center px-2.5 text-ui text-ink transition-colors hover:bg-inset"
    :title="nextLocale === 'es' ? t('language.switchToSpanish') : t('language.switchToEnglish')"
    :aria-label="t('language.changeLanguage')"
    @click="toggleLanguage"
  >
    <span class="text-meta font-medium tracking-wider uppercase">
      {{ nextLocale.toUpperCase() }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../composables/useI18n'

const { locale, setLocale, t } = useI18n()

const nextLocale = computed(() => (locale.value === 'es' ? 'en' : 'es'))

const toggleLanguage = () => {
  setLocale(nextLocale.value)
}
</script>

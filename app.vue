<script setup lang="ts">
import '../assets/css/main.css'
import { computed, onMounted } from 'vue'
import { useChromeAI } from './composables/useChromeAI'
import { useI18n } from './composables/useI18n'

const { initialize } = useChromeAI()
const { locale, t } = useI18n()

onMounted(async () => {
  await initialize()
})

useHead({
  title: computed(() => `DocuPrism - ${t('common.appName')}`),
  htmlAttrs: { lang: computed(() => locale.value) },
  meta: [
    { name: 'description', content: computed(() => t('footer.tagline')) }
  ],
  script: [
    {
      innerHTML: `
        (function() {
          document.documentElement.classList.add('no-transitions');

          try {
            var storedLocale = localStorage.getItem('docuprism-locale');
            var isSpanish = (navigator.languages && navigator.languages[0] ? navigator.languages[0] : navigator.language || '').toLowerCase().startsWith('es');
            var detected = storedLocale || (isSpanish ? 'es' : 'en');
            document.documentElement.setAttribute('lang', detected);
          } catch (e) {}

          try {
            const stored = localStorage.getItem('theme-preference');
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const shouldBeDark = stored ? stored === 'dark' : systemDark;

            if (shouldBeDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (e) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.classList.add('dark');
            }
          }

          setTimeout(function() {
            document.documentElement.classList.remove('no-transitions');
          }, 100);
        })();
      `,
      type: 'text/javascript'
    }
  ]
})
</script>

<template>
  <div>
    <a href="#main-content" class="skip-link">{{ t('common.skipToMain') }}</a>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

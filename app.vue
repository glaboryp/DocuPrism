<script setup lang="ts">
import '../assets/css/main.css'
import { useChromeAI } from './composables/useChromeAI'

const { initialize } = useChromeAI()

onMounted(async () => {
  await initialize()
})

useHead({
  title: 'DocuPrism - On-Device Document Analysis',
  htmlAttrs: { lang: 'en' },
  meta: [
    { name: 'description', content: 'Privacy-first, offline-capable PWA for on-device document analysis using Chrome Built-in AI' }
  ],
  script: [
    {
      innerHTML: `
        (function() {
          document.documentElement.classList.add('no-transitions');

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
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

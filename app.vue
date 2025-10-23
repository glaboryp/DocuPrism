<script setup lang="ts">
import '../assets/css/main.css'
import { useChromeAI } from './composables/useChromeAI'

// Get checking state from Chrome AI
const { isCheckingSupport } = useChromeAI()

// Meta and head configuration
useHead({
  title: 'DocuPrism - On-Device Document Analysis',
  meta: [
    { name: 'description', content: 'Privacy-first, offline-capable PWA for on-device document analysis using Chrome Built-in AI' }
  ],
  script: [
    {
      innerHTML: `
        (function() {
          // Prevent transitions during initial theme application
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
            // Fallback to system preference if localStorage fails
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.classList.add('dark');
            }
          }
          
          // Re-enable transitions after a brief delay
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
    <!-- Loading Overlay during AI checking -->
    <Transition name="fade">
      <div
        v-if="isCheckingSupport"
        class="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
      >
        <div class="text-center">
          <Icon name="heroicons:arrow-path" class="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Initializing AI
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Checking Chrome Built-in AI availability...
          </p>
        </div>
      </div>
    </Transition>

    <!-- Main App -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>



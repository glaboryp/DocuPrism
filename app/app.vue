<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-colors duration-300 flex flex-col">
    <NuxtRouteAnnouncer />
    
    <HeaderView />

    <div class="flex-1">
      <SummaryView />
    </div>
    
    <FooterView />
    
    <!-- PWA Components -->
    <PWAInstallPrompt />
    
    <!-- Development Info (solo en modo dev) -->
    <DevOfflineInfo />
  </div>
</template><script setup lang="ts">
import '../assets/css/main.css'
import HeaderView from '../sections/HeaderView.vue'
import SummaryView from '../sections/SummaryView.vue'
import FooterView from '../sections/FooterView.vue'
import PWAInstallPrompt from '../components/PWAInstallPrompt.vue'
import DevOfflineInfo from '../components/DevOfflineInfo.vue'

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

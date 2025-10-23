<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template><script setup lang="ts">
import '../assets/css/main.css'

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

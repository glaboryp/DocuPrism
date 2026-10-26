<template>
  <div
    v-if="showDevInfo && !isOnline"
    class="fixed bottom-6 left-4 z-[85] max-w-xs bg-ink px-4 py-3 text-meta text-sheet"
  >
    <div class="flex items-start gap-3">
      <p class="flex-1">
        Development mode, offline. Console network errors are expected.
      </p>
      <button
        type="button"
        class="-mr-1 inline-flex h-5 w-5 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss development notice"
        @click="dismissDevInfo"
      >
        <Icon name="heroicons:x-mark" class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(true)
const showDevInfo = ref(false)

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine

  if (import.meta.dev && !navigator.onLine) {
    setTimeout(() => {
      const dismissed = sessionStorage.getItem('dev-info-dismissed')
      if (!dismissed) {
        showDevInfo.value = true
      }
    }, 5000)
  } else {
    showDevInfo.value = false
  }
}

const dismissDevInfo = () => {
  showDevInfo.value = false
  sessionStorage.setItem('dev-info-dismissed', 'true')
}

onMounted(() => {
  updateOnlineStatus()
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

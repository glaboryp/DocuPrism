<template>
  <div 
    v-if="showDevInfo && !isOnline"
    class="fixed bottom-4 right-4 bg-yellow-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-50 max-w-sm"
  >
    <div class="flex items-center space-x-2">
      <Icon name="heroicons:information-circle" class="w-4 h-4" />
      <div>
        <div class="font-semibold">Development Mode - Offline</div>
        <div class="text-yellow-100">Console errors are normal (HMR/WebSocket)</div>
      </div>
      <button 
        class="text-yellow-200 hover:text-white"
        @click="dismissDevInfo"
      >
        <Icon name="heroicons:x-mark" class="w-4 h-4" />
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
  
  // Solo mostrar info de desarrollo si está offline y es desarrollo
  if (import.meta.dev && !navigator.onLine) {
    // Mostrar después de un delay para no ser intrusivo
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
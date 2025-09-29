<template>
  <div>
    <!-- Install Prompt -->
    <div 
      v-if="showInstallPrompt && canInstall" 
      class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50"
    >
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <Icon name="heroicons:arrow-down-tray" class="w-6 h-6 text-primary" />
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">
            Install DocuPrism
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Install the app for faster access and offline capabilities
          </p>
          <div class="flex space-x-2 mt-3">
            <button
              class="btn-primary text-sm px-3 py-1"
              @click="installPWA"
            >
              Install
            </button>
            <button
              class="btn-secondary text-sm px-3 py-1"
              @click="dismissInstallPrompt"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          class="flex-shrink-0 text-gray-400 hover:text-gray-500"
          @click="dismissInstallPrompt"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Offline Indicator -->
    <div 
      v-if="!isOnline" 
      class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2"
    >
      <Icon name="heroicons:wifi-slash" class="w-4 h-4" />
      <span class="text-sm font-medium">Working Offline</span>
    </div>

    <!-- Update Available -->
    <div 
      v-if="updateAvailable" 
      class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2 cursor-pointer"
      @click="refreshApp"
    >
      <Icon name="heroicons:arrow-path" class="w-4 h-4" />
      <span class="text-sm font-medium">Update Available - Click to refresh</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Types for PWA
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

// PWA Install states
const canInstall = ref(false)
const showInstallPrompt = ref(false)
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const isOnline = ref(true)
const updateAvailable = ref(false)
const refreshSW = ref<(() => Promise<void>) | null>(null)

// Check if PWA is already installed
const isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as NavigatorWithStandalone).standalone === true ||
         document.referrer.includes('android-app://')
}

// Handle PWA install prompt
const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault()
  deferredPrompt.value = e as BeforeInstallPromptEvent
  
  // Don't show prompt if already installed
  if (!isPWAInstalled()) {
    canInstall.value = true
    // Show prompt after a delay to not be intrusive
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 3000)
  }
}

const installPWA = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA installed successfully')
    }
    
    deferredPrompt.value = null
    canInstall.value = false
    showInstallPrompt.value = false
  }
}

const dismissInstallPrompt = () => {
  showInstallPrompt.value = false
  // Don't show again for this session
  sessionStorage.setItem('pwa-install-dismissed', 'true')
}

// Handle online/offline status
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

// Handle service worker updates
const handleSWUpdate = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload page when new service worker takes control
      window.location.reload()
    })
  }
}

const refreshApp = async () => {
  if (refreshSW.value) {
    await refreshSW.value()
  } else {
    window.location.reload()
  }
}

onMounted(() => {
  // Check if install prompt was already dismissed
  const dismissed = sessionStorage.getItem('pwa-install-dismissed')
  if (dismissed) {
    showInstallPrompt.value = false
  }

  // Listen for PWA install prompt
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  
  // Listen for online/offline events
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  updateOnlineStatus()
  
  // Handle service worker updates
  handleSWUpdate()
  
  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    canInstall.value = false
    showInstallPrompt.value = false
  })

  // Check for VitePWA plugin methods
  if (typeof window !== 'undefined' && 'workbox' in window) {
    const wb = (window as unknown as { workbox: { 
      addEventListener: (event: string, callback: () => void) => void;
      register: () => void;
    }}).workbox
    if (wb) {
      wb.addEventListener('waiting', () => {
        updateAvailable.value = true
      })

      wb.addEventListener('controlling', () => {
        window.location.reload()
      })

      // Register the service worker
      if ('serviceWorker' in navigator) {
        wb.register()
      }
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>
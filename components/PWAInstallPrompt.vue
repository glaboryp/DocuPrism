<template>
  <div>
    <!-- Offline -->
    <div
      v-if="!isOnline"
      class="fixed inset-x-0 bottom-0 z-[75] bg-ink text-sheet"
      role="status"
      aria-live="polite"
    >
      <div class="frame flex items-center justify-between gap-4 py-3">
        <p class="text-ui">
          Working offline. Readings and history stay on this device.
        </p>
      </div>
    </div>

    <!-- Update available -->
    <div
      v-else-if="updateAvailable"
      class="fixed inset-x-0 bottom-0 z-[75] bg-ink text-sheet"
      role="status"
      aria-live="polite"
    >
      <div class="frame flex flex-wrap items-center justify-between gap-3 py-3">
        <p class="text-ui">A new version of DocuPrism is ready.</p>
        <button
          type="button"
          class="h-10 bg-sheet px-4 text-ui font-medium text-ink"
          @click="refreshApp"
        >
          Refresh
        </button>
      </div>
    </div>

    <!-- Install -->
    <div
      v-else-if="showInstallPrompt && canInstall"
      class="fixed inset-x-0 bottom-0 z-[70] bg-ink text-sheet"
    >
      <div class="frame flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-ui font-medium">Install DocuPrism</p>
          <p class="text-meta opacity-80">
            Opens like an app and keeps working without a connection.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="h-10 bg-sheet px-4 text-ui font-medium text-ink"
            @click="installPWA"
          >
            Install
          </button>
          <button
            type="button"
            class="h-10 px-3 text-ui text-sheet opacity-80 transition-opacity hover:opacity-100"
            @click="dismissInstallPrompt"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

const canInstall = ref(false)
const showInstallPrompt = ref(false)
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const isOnline = ref(true)
const updateAvailable = ref(false)
const refreshSW = ref<(() => Promise<void>) | null>(null)

const isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as NavigatorWithStandalone).standalone === true ||
         document.referrer.includes('android-app://')
}

const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault()
  deferredPrompt.value = e as BeforeInstallPromptEvent

  if (!isPWAInstalled()) {
    canInstall.value = true
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
  sessionStorage.setItem('pwa-install-dismissed', 'true')
}

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

const handleSWUpdate = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
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
  const dismissed = sessionStorage.getItem('pwa-install-dismissed')
  if (dismissed) {
    showInstallPrompt.value = false
  }

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  updateOnlineStatus()
  handleSWUpdate()

  window.addEventListener('appinstalled', () => {
    canInstall.value = false
    showInstallPrompt.value = false
  })

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

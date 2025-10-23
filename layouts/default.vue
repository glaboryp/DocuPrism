<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-colors duration-300 flex flex-col">
    <NuxtRouteAnnouncer />
    
    <HeaderView />

    <div class="flex-1">
      <slot />
    </div>
    
    <FooterView />
    
    <!-- PWA Components -->
    <PWAInstallPrompt />
    
    <!-- Development Info (solo en modo dev) -->
    <DevOfflineInfo />
    
    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import HeaderView from '../sections/HeaderView.vue'
import FooterView from '../sections/FooterView.vue'
import PWAInstallPrompt from '../components/PWAInstallPrompt.vue'
import DevOfflineInfo from '../components/DevOfflineInfo.vue'
import ToastContainer from '../components/ToastContainer.vue'
</script>

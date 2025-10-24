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
import { defineAsyncComponent } from 'vue'
import HeaderView from '../sections/HeaderView.vue'
import FooterView from '../sections/FooterView.vue'
import ToastContainer from '../components/ToastContainer.vue'

// Lazy load components that are not immediately critical
const PWAInstallPrompt = defineAsyncComponent(() => import('../components/PWAInstallPrompt.vue'))
const DevOfflineInfo = defineAsyncComponent(() => import('../components/DevOfflineInfo.vue'))
</script>

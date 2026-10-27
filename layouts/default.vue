<template>
  <div class="flex min-h-screen flex-col bg-ground text-ink">
    <NuxtRouteAnnouncer />

    <HeaderView @toggle-mobile-menu="toggleMobileMenu" />

    <div class="relative z-0 flex-1">
      <slot />
    </div>

    <FooterView />

    <PWAInstallPrompt />
    <DevOfflineInfo />
    <ToastContainer />
    <MobileMenu :is-open="isMobileMenuOpen" @close="closeMobileMenu" />
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import HeaderView from '../sections/HeaderView.vue'
import FooterView from '../sections/FooterView.vue'
import ToastContainer from '../components/ToastContainer.vue'
import MobileMenu from '../components/MobileMenu.vue'

const PWAInstallPrompt = defineAsyncComponent(() => import('../components/PWAInstallPrompt.vue'))
const DevOfflineInfo = defineAsyncComponent(() => import('../components/DevOfflineInfo.vue'))

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <Transition name="menu">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] bg-ground lg:hidden"
      role="dialog"
      aria-modal="true"
      :aria-label="t('menu.ariaLabel')"
      @keydown.esc="closeMenu"
    >
      <div class="frame flex h-[72px] items-center justify-between">
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5 text-ink"
          :aria-label="t('header.homeAria')"
          @click="closeMenu"
        >
          <BrandMark class="h-6 w-6" />
          <span class="text-[17px] font-semibold tracking-[-0.01em]">DocuPrism</span>
        </NuxtLink>
        <button
          ref="closeButton"
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center text-ink transition-colors hover:bg-inset"
          :aria-label="t('menu.closeAria')"
          @click="closeMenu"
        >
          <Icon name="heroicons:x-mark" class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav class="frame mt-6" :aria-label="t('menu.ariaLabel')">
        <NuxtLink
          to="/"
          class="flex items-baseline justify-between border-t border-rule py-5 font-read text-[28px] leading-none"
          @click="closeMenu"
        >
          {{ t('menu.readDocument') }}
        </NuxtLink>
        <NuxtLink
          to="/history"
          class="flex items-baseline justify-between border-t border-rule py-5 font-read text-[28px] leading-none"
          @click="closeMenu"
        >
          {{ t('menu.history') }}
        </NuxtLink>
        <a
          href="https://github.com/glaboryp/DocuPrism"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-baseline justify-between border-y border-rule py-5 font-read text-[28px] leading-none"
          @click="closeMenu"
        >
          {{ t('menu.github') }}
        </a>
      </nav>

      <div class="frame mt-10 space-y-4">
        <div class="flex items-center justify-between border-b border-rule pb-4">
          <span class="text-ui">{{ t('language.selectLanguage') }}</span>
          <LanguageToggle />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-ui">{{ isDark ? t('theme.lightMode') : t('theme.darkMode') }}</span>
          <ThemeToggle />
        </div>
      </div>

      <p class="frame meta mt-6">{{ statusLabel }}</p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useChromeAI } from '../composables/useChromeAI'
import { useI18n } from '../composables/useI18n'
import BrandMark from './BrandMark.vue'
import ThemeToggle from './ThemeToggle.vue'
import LanguageToggle from './LanguageToggle.vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const route = useRoute()
const { isDark } = useTheme()
const { isSupported, isCheckingSupport } = useChromeAI()
const { t } = useI18n()

const closeButton = ref<HTMLButtonElement | null>(null)

const statusLabel = computed(() => {
  if (isCheckingSupport.value) return t('menu.statusChecking')
  return isSupported.value
    ? t('menu.statusReady')
    : t('menu.statusUnavailable')
})

const closeMenu = () => {
  emit('close')
  document.body.style.overflow = ''
}

watch(() => props.isOpen, async (open) => {
  if (typeof document === 'undefined') return

  if (open) {
    document.body.style.overflow = 'hidden'
    await nextTick()
    closeButton.value?.focus()
  } else {
    document.body.style.overflow = ''
  }
})

watch(() => route.path, () => {
  if (props.isOpen) closeMenu()
})

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = ''
})
</script>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity 180ms ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
</style>

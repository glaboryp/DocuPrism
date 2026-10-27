<template>
  <header class="relative z-30">
    <div class="frame flex h-[72px] items-center justify-between gap-6">
      <NuxtLink
        to="/"
        class="reveal flex items-center gap-2.5 text-ink"
        :aria-label="t('header.homeAria')"
      >
        <BrandMark class="h-6 w-6" />
        <span class="text-[17px] font-semibold tracking-[-0.01em]">DocuPrism</span>
      </NuxtLink>

      <div class="flex items-center gap-1 sm:gap-2">
        <div class="mr-1 hidden items-center gap-2 sm:flex" aria-live="polite">
          <span
            v-if="isCheckingSupport"
            class="h-1.5 w-1.5 bg-ink-muted"
            aria-hidden="true"
          />
          <span
            v-else-if="isSupported"
            class="h-1.5 w-1.5 bg-success"
            aria-hidden="true"
          />
          <span v-else class="h-1.5 w-1.5 bg-danger" aria-hidden="true" />
          <span
            class="text-meta"
            :class="{ 'text-danger': !isSupported && !isCheckingSupport }"
          >
            {{ statusLabel }}
          </span>
          <button
            v-if="!isSupported && !isCheckingSupport"
            type="button"
            class="text-meta text-ink underline decoration-1 underline-offset-2"
            @click="showModal = true"
          >
            {{ t('header.requirements') }}
          </button>
        </div>

        <nav class="hidden items-center gap-1 lg:flex" :aria-label="t('header.primaryNav')">
          <NuxtLink
            to="/history"
            class="inline-flex h-11 items-center px-2 text-ui text-ink transition-colors hover:text-ink-muted"
          >
            {{ t('common.history') }}
          </NuxtLink>
          <a
            href="https://github.com/glaboryp/DocuPrism"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-11 items-center px-2 text-ui text-ink transition-colors hover:text-ink-muted"
          >
            {{ t('common.github') }}
          </a>
          <LanguageToggle />
          <ThemeToggle />
        </nav>

        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center text-ink transition-colors hover:bg-inset lg:hidden"
          :aria-label="t('header.openMenu')"
          @click="$emit('toggle-mobile-menu')"
        >
          <Icon name="heroicons:bars-3" class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  </header>

  <AIRequirementsModal
    :is-open="showModal"
    @close="showModal = false"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch, defineAsyncComponent } from 'vue'
import { useChromeAI } from '../composables/useChromeAI'
import { useI18n } from '../composables/useI18n'
import { detectAIBrowser } from '../utils/browser'
import ThemeToggle from '../components/ThemeToggle.vue'
import LanguageToggle from '../components/LanguageToggle.vue'
import BrandMark from '../components/BrandMark.vue'

const AIRequirementsModal = defineAsyncComponent(() => import('../components/AIRequirementsModal.vue'))

defineEmits(['toggle-mobile-menu'])

const { isSupported, isCheckingSupport } = useChromeAI()
const { t } = useI18n()

const showModal = ref(false)

// The browser cannot host the model at all (Brave and friends, or a Chromium
// without the API): open the requirements sheet as soon as the check settles.
const browserCanRunModel = () =>
  detectAIBrowser() !== 'unsupported' &&
  typeof window !== 'undefined' &&
  'Summarizer' in window

watch(isCheckingSupport, (checking) => {
  if (checking || browserCanRunModel()) return
  showModal.value = true
})

const statusLabel = computed(() => {
  if (isCheckingSupport.value) return t('header.checkingModel')
  return isSupported.value ? t('header.modelReady') : t('header.modelUnavailable')
})
</script>

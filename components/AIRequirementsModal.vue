<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[120] flex items-end justify-center sm:items-stretch sm:justify-end"
  >
    <div
      class="absolute inset-0 bg-black/40"
      aria-hidden="true"
      @click="closeModal"
    />

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-requirements-title"
      class="relative flex max-h-[90vh] w-full flex-col overflow-y-auto bg-sheet p-6 sm:h-full sm:max-h-none sm:w-[560px] sm:p-10"
      @click.stop
    >
      <div class="flex items-start justify-between gap-6">
        <h2 id="ai-requirements-title" class="font-read text-title">
          {{ t('requirements.title') }}
        </h2>
        <button
          ref="closeButton"
          type="button"
          class="-mr-2 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center text-ink transition-colors hover:bg-inset"
          :aria-label="t('common.close')"
          @click="closeModal"
        >
          <Icon name="heroicons:x-mark" class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <p class="mt-4 text-ui text-ink">
        {{ t('requirements.desc') }}
      </p>

      <div v-if="browser === 'unsupported'" class="mt-8 space-y-3 text-ui">
        <p class="font-medium">{{ t('requirements.unsupportedTitle') }}</p>
        <p class="text-ink">
          {{ t('requirements.unsupportedDesc') }}
        </p>
      </div>

      <div v-else-if="browser === 'edge'" class="mt-8 space-y-4 text-ui">
        <p class="font-medium">{{ t('requirements.edgeTitle') }}</p>
        <p class="text-ink">
          {{ t('requirements.edgeDesc') }}
        </p>
        <p class="text-ink">
          {{ t('requirements.edgeInternals', { code: 'edge://on-device-internals' }) }}
        </p>
      </div>

      <div v-else class="mt-8 space-y-4 text-ui">
        <p class="font-medium">{{ t('requirements.chromeTitle') }}</p>
        <p class="text-ink">
          {{ t('requirements.chromeDesc') }}
        </p>
        <p class="text-ink">
          {{ t('requirements.chromeInternals', { code: 'chrome://on-device-internals' }) }}
        </p>
      </div>

      <h3 class="mt-8 text-ui font-medium">{{ t('requirements.needsHeading') }}</h3>
      <dl class="mt-3 space-y-3 text-ui">
        <div class="flex gap-4">
          <dt class="w-24 flex-shrink-0 text-ink-muted">{{ t('requirements.diskLabel') }}</dt>
          <dd>{{ t('requirements.diskDesc') }}</dd>
        </div>
        <div class="flex gap-4">
          <dt class="w-24 flex-shrink-0 text-ink-muted">{{ t('requirements.graphicsLabel') }}</dt>
          <dd>{{ t('requirements.graphicsDesc') }}</dd>
        </div>
        <div class="flex gap-4">
          <dt class="w-24 flex-shrink-0 text-ink-muted">{{ t('requirements.connectionLabel') }}</dt>
          <dd>{{ t('requirements.connectionDesc') }}</dd>
        </div>
      </dl>

      <div class="mt-8 flex flex-col gap-2 text-ui">
        <a
          href="https://developer.chrome.com/docs/ai/built-in"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2"
        >
          {{ t('requirements.chromeDocs') }}
        </a>
        <a
          href="https://developer.chrome.com/docs/ai/prompt-api"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2"
        >
          {{ t('requirements.promptApiDocs') }}
        </a>
      </div>

      <div class="mt-auto pt-10">
        <button type="button" class="btn btn-primary w-full sm:w-auto" @click="closeModal">
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { detectAIBrowser, type AIBrowser } from '../utils/browser'
import { useI18n } from '../composables/useI18n'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const closeButton = ref<HTMLButtonElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)
const browser = ref<AIBrowser>('chrome')

const closeModal = () => {
  emit('close')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeModal()
}

watch(() => props.isOpen, (open) => {
  if (typeof document === 'undefined') return

  if (open) {
    previouslyFocused.value = document.activeElement as HTMLElement | null
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
    nextTick(() => closeButton.value?.focus())
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
    previouslyFocused.value?.focus()
  }
}, { immediate: true })

onMounted(() => {
  browser.value = detectAIBrowser()
})

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

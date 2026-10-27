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
          This browser cannot run the model.
        </h2>
        <button
          ref="closeButton"
          type="button"
          class="-mr-2 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center text-ink transition-colors hover:bg-inset"
          aria-label="Close"
          @click="closeModal"
        >
          <Icon name="heroicons:x-mark" class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <p class="mt-4 text-ui text-ink">
        DocuPrism uses the language model built into Chrome. There is no server to fall back to,
        so the browser has to bring its own.
      </p>

      <div v-if="browser === 'unsupported'" class="mt-8 space-y-3 text-ui">
        <p class="font-medium">Open this page in desktop Chrome or Edge.</p>
        <p class="text-ink">
          This browser does not include a built-in on-device model. Open DocuPrism in
          <strong class="text-ink">Chrome 148 or newer</strong>, or a recent
          <strong class="text-ink">Microsoft Edge</strong> on Windows or macOS.
        </p>
      </div>

      <div v-else-if="browser === 'edge'" class="mt-8 space-y-4 text-ui">
        <p class="font-medium">Microsoft Edge Stable, Windows or macOS</p>
        <p class="text-ink">
          No flags are needed. The Summarizer and the Prompt API are enabled by default.
          If the model is missing, Edge downloads it on first use.
        </p>
        <p class="text-ink">
          Check the model and the device performance class at
          <code class="bg-inset px-1 py-0.5">edge://on-device-internals</code>.
          The class must be <strong class="text-ink">High</strong> or greater.
        </p>
      </div>

      <div v-else class="mt-8 space-y-4 text-ui">
        <p class="font-medium">Chrome 148 or newer, on desktop</p>
        <p class="text-ink">
          No flags are needed. The Summarizer, Language Detector and Prompt APIs are enabled
          by default. If the model is missing, Chrome downloads it on first use.
        </p>
        <p class="text-ink">
          Check model status at
          <code class="bg-inset px-1 py-0.5">chrome://on-device-internals</code>.
        </p>
      </div>

      <h3 class="mt-8 text-ui font-medium">What the model needs</h3>
      <dl class="mt-3 space-y-3 text-ui">
        <div class="flex gap-4">
          <dt class="w-24 flex-shrink-0 text-ink-muted">Disk</dt>
          <dd>About 22 GB free for the model.</dd>
        </div>
        <div class="flex gap-4">
          <dt class="w-24 flex-shrink-0 text-ink-muted">Graphics</dt>
          <dd>A GPU with more than 4 GB of VRAM, or 16 GB of RAM and 4+ CPU cores.</dd>
        </div>
        <div class="flex gap-4">
          <dt class="w-24 flex-shrink-0 text-ink-muted">Connection</dt>
          <dd>Only for the one-time model download. Readings work offline afterwards.</dd>
        </div>
      </dl>

      <div class="mt-8 flex flex-col gap-2 text-ui">
        <a
          href="https://developer.chrome.com/docs/ai/built-in"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2"
        >
          Chrome Built-in AI documentation
        </a>
        <a
          href="https://developer.chrome.com/docs/ai/prompt-api"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2"
        >
          Prompt API guide
        </a>
      </div>

      <div class="mt-auto pt-10">
        <button type="button" class="btn btn-primary w-full sm:w-auto" @click="closeModal">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { detectAIBrowser, type AIBrowser } from '../utils/browser'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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

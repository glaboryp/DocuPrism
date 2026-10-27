<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[120] flex items-end justify-center sm:items-stretch sm:justify-end"
    >
      <div
        class="absolute inset-0 bg-black/40"
        aria-hidden="true"
        @click="cancel"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="sensitive-dialog-title"
        aria-describedby="sensitive-dialog-description"
        class="relative flex max-h-[90vh] w-full flex-col overflow-y-auto bg-sheet p-6 sm:h-full sm:max-h-none sm:w-[560px] sm:p-10"
        @click.stop
      >
        <div class="flex items-start justify-between gap-6">
          <h2 id="sensitive-dialog-title" class="font-read text-title">
            Sensitive data found.
          </h2>
          <button
            type="button"
            class="-mr-2 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center text-ink transition-colors hover:bg-inset"
            aria-label="Close"
            @click="cancel"
          >
            <Icon name="heroicons:x-mark" class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p id="sensitive-dialog-description" class="mt-4 text-ui text-ink">
          This document contains things you may not want written to the history in this browser.
          The summary stays on screen either way.
        </p>

        <ul class="mt-8 space-y-6" aria-label="Detected sensitive data">
          <li v-for="group in groups" :key="group.kind">
            <p class="text-ui font-medium">
              {{ SENSITIVE_KIND_LABELS[group.kind] }}
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <code
                v-for="(preview, index) in group.previews"
                :key="`${group.kind}-${index}`"
                class="bg-inset px-2 py-1 text-meta"
              >{{ preview }}</code>
            </div>
          </li>
        </ul>

        <div class="mt-8 bg-inset p-4">
          <p class="text-ui font-medium">What gets saved</p>
          <p class="mt-2 text-meta">
            The full document text and this summary, in this browser's local storage. No server
            receives either. You can delete the entry from History at any time.
          </p>
        </div>

        <p class="meta mt-4">
          History stays on this device until you delete it. The summary stays on screen either way.
        </p>

        <div class="mt-auto flex flex-col-reverse gap-2 pt-10 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            class="btn-text justify-center"
            @click="confirm"
          >
            Save anyway
          </button>
          <button
            ref="cancelButton"
            type="button"
            class="btn btn-primary w-full sm:w-auto"
            @click="cancel"
          >
            Keep on screen
          </button>
        </div>
      </div>
    </div>
</Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import {
  SENSITIVE_KIND_LABELS,
  groupSensitiveFindings,
  type SensitiveFinding
} from '../utils/semanticChecks'

interface Props {
  isOpen: boolean
  findings: SensitiveFinding[]
}

interface Emits {
  (e: 'confirm' | 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const cancelButton = ref<HTMLButtonElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

const groups = computed(() => groupSensitiveFindings(props.findings))

const cancel = () => {
  emit('cancel')
}

const confirm = () => {
  emit('confirm')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') cancel()
}

watch(() => props.isOpen, (open) => {
  if (typeof document === 'undefined') return

  if (open) {
    previouslyFocused.value = document.activeElement as HTMLElement | null
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
    nextTick(() => cancelButton.value?.focus())
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
    previouslyFocused.value?.focus()
  }
}, { immediate: true })

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="cancel"
  >
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity" />

    <!-- Dialog -->
    <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="sensitive-dialog-title"
        aria-describedby="sensitive-dialog-description"
        class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center space-x-2 mb-3">
          <Icon name="heroicons:shield-exclamation" class="w-6 h-6 text-amber-500" aria-hidden="true" />
          <h3 id="sensitive-dialog-title" class="text-lg font-semibold text-gray-900 dark:text-white">
            Sensitive data detected
          </h3>
        </div>

        <p id="sensitive-dialog-description" class="text-sm text-gray-600 dark:text-gray-300">
          The document you are about to save to history contains:
        </p>

        <ul class="mt-3 space-y-3" aria-label="Detected sensitive data">
          <li v-for="group in groups" :key="group.kind">
            <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
              {{ SENSITIVE_KIND_LABELS[group.kind] }}
            </p>
            <div class="mt-1 flex flex-wrap gap-1.5">
              <code
                v-for="(preview, index) in group.previews"
                :key="`${group.kind}-${index}`"
                class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded"
              >{{ preview }}</code>
            </div>
          </li>
        </ul>

        <p class="mt-4 text-xs text-gray-500 dark:text-gray-400">
          History is stored only in this browser's local storage, and it stays there until you delete it.
          The summary stays on screen either way.
        </p>

        <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-5">
          <button
            ref="cancelButton"
            class="btn-secondary px-4 py-2 text-sm"
            @click="cancel"
          >
            Don't save
          </button>
          <button
            class="btn-primary px-4 py-2 text-sm"
            @click="confirm"
          >
            Save anyway
          </button>
        </div>
      </div>
    </div>
  </div>
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

const groups = computed(() => groupSensitiveFindings(props.findings))

const cancel = () => {
  emit('cancel')
}

const confirm = () => {
  emit('confirm')
}

// Escape cancels: the safe option is always the default
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') cancel()
}

watch(() => props.isOpen, (open) => {
  // The watcher runs immediately, including during SSR where there is no document
  if (typeof document === 'undefined') return

  if (open) {
    document.addEventListener('keydown', handleKeydown)
    nextTick(() => cancelButton.value?.focus())
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', handleKeydown)
})
</script>

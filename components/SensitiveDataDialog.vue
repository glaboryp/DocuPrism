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
            {{ t('sensitive.title') }}
          </h2>
          <button
            type="button"
            class="-mr-2 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center text-ink transition-colors hover:bg-inset"
            :aria-label="t('common.close')"
            @click="cancel"
          >
            <Icon name="heroicons:x-mark" class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p id="sensitive-dialog-description" class="mt-4 text-ui text-ink">
          {{ t('sensitive.desc') }}
        </p>

        <ul class="mt-8 space-y-6" :aria-label="t('sensitive.detectedAria')">
          <li v-for="group in groups" :key="group.kind">
            <p class="text-ui font-medium">
              {{ getKindLabel(group.kind) }}
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
          <p class="text-ui font-medium">{{ t('sensitive.whatGetsSavedTitle') }}</p>
          <p class="mt-2 text-meta">
            {{ t('sensitive.whatGetsSavedDesc') }}
          </p>
        </div>

        <p class="meta mt-4">
          {{ t('sensitive.persistentNote') }}
        </p>

        <div class="mt-auto flex flex-col-reverse gap-2 pt-10 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            class="btn-text justify-center"
            @click="confirm"
          >
            {{ t('sensitive.saveAnyway') }}
          </button>
          <button
            ref="cancelButton"
            type="button"
            class="btn btn-primary w-full sm:w-auto"
            @click="cancel"
          >
            {{ t('sensitive.keepOnScreen') }}
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
  type SensitiveFinding,
  type SensitiveKind
} from '../utils/semanticChecks'
import { useI18n } from '../composables/useI18n'

interface Props {
  isOpen: boolean
  findings: SensitiveFinding[]
}

interface Emits {
  (e: 'confirm' | 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const cancelButton = ref<HTMLButtonElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

const groups = computed(() => groupSensitiveFindings(props.findings))

const getKindLabel = (kind: SensitiveKind): string => {
  const map: Record<SensitiveKind, string> = {
    email: t('sensitive.kinds.email'),
    'credit-card': t('sensitive.kinds.creditCard'),
    'api-key': t('sensitive.kinds.apiKey'),
    'private-key': t('sensitive.kinds.privateKey'),
    password: t('sensitive.kinds.credentials'),
    'personal-data': t('sensitive.kinds.credentials')
  }
  return map[kind] || SENSITIVE_KIND_LABELS[kind] || kind
}

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

<template>
  <main id="main-content" class="frame pb-16 pt-8 sm:pt-10 lg:pt-12">
    <div class="grid gap-8 lg:grid-cols-12 lg:items-end">
      <div class="lg:col-span-8">
        <h1 class="reveal font-read text-display">{{ t('history.title') }}</h1>
        <p class="reveal reveal-1 mt-4 max-w-[46ch] text-ui text-ink">
          {{ t('history.subtitle') }}
        </p>
      </div>

      <div
        v-if="isStorageAvailable && analyses.length > 0"
        class="reveal reveal-2 lg:col-span-4 lg:justify-self-end lg:text-right"
      >
        <p class="meta tabular">
          {{ t('history.storageMeter', {
            count: analyses.length,
            used: formatBytes(storageInfo.used),
            available: formatBytes(storageInfo.available)
          }) }}
        </p>
        <div class="meter mt-2 w-full sm:w-56">
          <span :style="{ width: `${Math.min(storageInfo.percentage, 100)}%` }" />
        </div>
      </div>
    </div>

    <section class="mt-10" :aria-label="t('history.ariaSavedAnalyses')">
      <div v-if="!isStorageAvailable" class="notice">
        <span class="font-medium">{{ t('history.storageUnavailableTitle') }} </span>
        {{ t('history.storageUnavailableDesc') }}
      </div>

      <div v-else-if="analyses.length === 0" class="sheet p-8 sm:p-12">
        <p class="font-read text-[24px] leading-tight">{{ t('history.emptyTitle') }}</p>
        <p class="mt-3 max-w-[40ch] text-ui text-ink">
          {{ t('history.emptyDesc') }}
        </p>

        <dl class="mt-8 grid gap-5 sm:grid-cols-3">
          <div>
            <dt class="text-ui font-medium">{{ t('history.features.savedTitle') }}</dt>
            <dd class="meta mt-1">{{ t('history.features.savedDesc') }}</dd>
          </div>
          <div>
            <dt class="text-ui font-medium">{{ t('history.features.locationTitle') }}</dt>
            <dd class="meta mt-1">{{ t('history.features.locationDesc') }}</dd>
          </div>
          <div>
            <dt class="text-ui font-medium">{{ t('history.features.limitTitle') }}</dt>
            <dd class="meta mt-1">{{ t('history.features.limitDesc') }}</dd>
          </div>
        </dl>

        <NuxtLink to="/" class="btn btn-primary mt-8">
          {{ t('history.readDocumentBtn') }}
        </NuxtLink>
      </div>

      <template v-else>
        <ul>
          <li
            v-for="analysis in analyses"
            :key="analysis.id"
            class="group flex flex-wrap items-start gap-x-4 gap-y-2 border-t border-rule py-5 sm:flex-nowrap sm:gap-6"
          >
            <p class="meta tabular hidden w-40 flex-shrink-0 pt-0.5 sm:block">
              {{ formatTimestamp(analysis.timestamp) }}
            </p>

            <button
              type="button"
              class="min-w-0 flex-1 basis-full text-left sm:basis-0"
              @click="viewAnalysis(analysis)"
            >
              <span class="block truncate text-ui font-medium">
                {{ analysis.inputText }}
              </span>
              <span class="mt-1 block truncate text-ui text-ink-muted">
                {{ analysis.summary }}
              </span>
              <span class="meta mt-2 flex flex-wrap gap-x-2 tabular sm:hidden">
                <span>{{ formatTimestamp(analysis.timestamp) }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ formatAnalysisType(analysis.options.type) }}</span>
              </span>
              <span class="meta mt-2 hidden gap-x-2 tabular sm:flex">
                <span>{{ formatAnalysisType(analysis.options.type) }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ formatAnalysisLength(analysis.options.length) }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ t('history.charactersCount', { count: formatNumber(analysis.inputText.length) }) }}</span>
              </span>
            </button>

            <div class="flex w-full flex-shrink-0 items-center justify-end gap-1 sm:w-auto sm:invisible sm:group-hover:visible sm:group-focus-within:visible">
              <button
                type="button"
                class="btn-quiet"
                :aria-label="t('history.copyAria', { date: formatTimestamp(analysis.timestamp) })"
                @click="copySummary(analysis)"
              >
                {{ t('common.copy') }}
              </button>
              <button
                type="button"
                class="btn-danger"
                :aria-label="t('history.deleteAria', { date: formatTimestamp(analysis.timestamp) })"
                @click="deleteAnalysisItem(analysis.id)"
              >
                {{ t('common.delete') }}
              </button>
            </div>
          </li>
        </ul>

        <button
          type="button"
          class="btn-danger mt-6"
          @click="handleClearAll"
        >
          {{ t('history.clearAll') }}
        </button>
      </template>
    </section>

    <!-- Detail sheet, teleported so the header and footer cannot paint over it -->
    <Teleport to="body">
      <div
        v-if="selectedAnalysis"
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
          aria-labelledby="history-detail-title"
          class="relative flex max-h-[90vh] w-full flex-col overflow-y-auto bg-sheet p-6 sm:h-full sm:max-h-none sm:w-[640px] sm:p-10"
          @click.stop
        >
          <div class="flex items-start justify-between gap-6">
            <div>
              <h2 id="history-detail-title" class="font-read text-title">
                {{ t('history.detailTitle') }}
              </h2>
              <p class="meta mt-2">
                {{ formatTimestamp(selectedAnalysis.timestamp) }} ·
                {{ formatAnalysisType(selectedAnalysis.options.type) }} ·
                {{ formatAnalysisLength(selectedAnalysis.options.length) }}
              </p>
            </div>
            <button
              ref="detailCloseButton"
              type="button"
              class="-mr-2 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center text-ink transition-colors hover:bg-inset"
              :aria-label="t('common.close')"
              @click="closeModal"
            >
              <Icon name="heroicons:x-mark" class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div class="mt-8">
            <h3 class="meta">{{ t('history.originalHeading') }}</h3>
            <div class="mt-2 max-h-56 overflow-y-auto bg-inset p-4 whitespace-pre-wrap text-ui text-ink-muted">
              {{ selectedAnalysis.inputText }}
            </div>
          </div>

          <div class="mt-8">
            <h3 class="meta">{{ t('desk.tabs.summary') }}</h3>
            <div class="mt-2 whitespace-pre-wrap font-read text-[17px] leading-[1.65]">
              {{ selectedAnalysis.summary }}
            </div>
          </div>

          <div class="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-10">
            <button
              type="button"
              class="btn btn-primary"
              @click="copySummary(selectedAnalysis)"
            >
              {{ t('common.copy') }}
            </button>
            <button
              type="button"
              class="btn-danger"
              @click="deleteSelected"
            >
              {{ t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useOfflineStorage } from '../composables/useOfflineStorage'
import { useToast } from '../composables/useToast'
import { useI18n } from '../composables/useI18n'
import type { StoredAnalysis } from '../types/storage'

definePageMeta({
  name: 'history'
})

const { t, formatNumber } = useI18n()

useHead({
  title: computed(() => `${t('history.title')} - DocuPrism`),
  meta: [{ name: 'description', content: computed(() => t('history.subtitle')) }]
})

const {
  isStorageAvailable,
  storedAnalyses,
  getStoredAnalyses,
  deleteAnalysis,
  clearAllAnalyses,
  getStorageInfo,
  formatTimestamp
} = useOfflineStorage()

const toast = useToast()
const selectedAnalysis = ref<StoredAnalysis | null>(null)
const detailCloseButton = ref<HTMLButtonElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

const analyses = computed(() => storedAnalyses.value)
const storageInfo = computed(() => {
  // Read the list so the meter updates when a reading is deleted.
  void analyses.value.length
  void analyses.value[0]?.id
  return getStorageInfo()
})

const formatAnalysisType = (type: string) => {
  const map: Record<string, string> = {
    tldr: t('desk.types.tldr'),
    'key-points': t('desk.types.keyPoints'),
    teaser: t('desk.types.teaser'),
    headline: t('desk.types.headline')
  }
  return map[type] || type
}

const formatAnalysisLength = (length: string) => {
  const map: Record<string, string> = {
    short: t('desk.lengths.short'),
    medium: t('desk.lengths.medium'),
    long: t('desk.lengths.long')
  }
  return map[length] || length
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 bytes'
  const k = 1024
  const sizes = ['bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const viewAnalysis = (analysis: StoredAnalysis) => {
  previouslyFocused.value = document.activeElement as HTMLElement | null
  selectedAnalysis.value = analysis
}

const closeModal = () => {
  selectedAnalysis.value = null
}

const copySummary = async (analysis: StoredAnalysis) => {
  try {
    await navigator.clipboard.writeText(analysis.summary)
    toast.success(t('toasts.copiedToClipboard'))
  } catch (err) {
    console.error('Failed to copy:', err)
    toast.error(t('toasts.failedToCopy'))
  }
}

const deleteAnalysisItem = (id: string) => {
  const success = deleteAnalysis(id)
  if (success) {
    toast.success(t('toasts.analysisDeleted'))
  } else {
    toast.error(t('toasts.failedToDelete'))
  }
}

const deleteSelected = () => {
  if (!selectedAnalysis.value) return
  const id = selectedAnalysis.value.id

  if (deleteAnalysis(id)) {
    toast.success(t('toasts.analysisDeleted'))
    selectedAnalysis.value = null
  } else {
    toast.error(t('toasts.failedToDelete'))
  }
}

const handleClearAll = () => {
  const success = clearAllAnalyses()
  if (success) {
    toast.success(t('toasts.allHistoryCleared'))
  } else {
    toast.error(t('toasts.failedToClearHistory'))
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && selectedAnalysis.value) closeModal()
}

watch(selectedAnalysis, async (open) => {
  if (typeof document === 'undefined') return

  if (open) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
    await nextTick()
    detailCloseButton.value?.focus()
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
    previouslyFocused.value?.focus()
  }
})

onMounted(() => {
  if (isStorageAvailable.value) {
    getStoredAnalyses()
  }
})

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <main id="main-content" aria-label="Document analysis">
    <section class="frame pb-8 pt-8 sm:pb-10 sm:pt-10 lg:pt-12">
      <div class="grid gap-6 lg:grid-cols-12 lg:items-end">
        <h1 class="reveal font-read text-display lg:col-span-8">
          What does this document say?
        </h1>
        <p class="reveal reveal-1 max-w-[38ch] text-ui text-ink-muted lg:col-span-4 lg:justify-self-end lg:pb-1">
          Paste a document, or open one. The summary and the chat run in Chrome, on this device — nothing is uploaded.
        </p>
      </div>
    </section>

    <section class="frame" aria-label="Document desk">
      <div class="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <!-- Document page -->
        <div class="reveal reveal-2 lg:col-span-7">
          <div class="flex items-baseline justify-between gap-4 pb-3">
            <h2 id="document-heading" class="font-read text-title">Document</h2>
            <div class="flex items-center gap-5" role="tablist" aria-label="Document source">
              <button
                id="text-input-tab"
                role="tab"
                type="button"
                class="tab"
                :aria-selected="inputMode === 'text'"
                aria-controls="text-input-panel"
                :disabled="isCheckingSupport"
                @click="inputMode = 'text'"
              >
                Paste
              </button>
              <button
                id="file-upload-tab"
                role="tab"
                type="button"
                class="tab"
                :aria-selected="inputMode === 'file'"
                aria-controls="file-upload-panel"
                :disabled="isCheckingSupport"
                @click="inputMode = 'file'"
              >
                Open file
              </button>
            </div>
          </div>

          <div class="sheet">
            <div
              v-if="inputMode === 'text'"
              id="text-input-panel"
              role="tabpanel"
              aria-labelledby="text-input-tab"
            >
              <label for="document-textarea" class="sr-only">Document text</label>
              <textarea
                id="document-textarea"
                v-model="inputText"
                class="doc-input"
                :disabled="isLoading || isCheckingSupport"
                placeholder="Paste the document here. It stays on this device."
                spellcheck="false"
              />
            </div>

            <div
              v-else
              id="file-upload-panel"
              role="tabpanel"
              aria-labelledby="file-upload-tab"
            >
              <Suspense>
                <FileUploader @file-loaded="handleFileLoaded" />
                <template #fallback>
                  <p class="p-8 text-ui text-ink-muted">Opening the file reader…</p>
                </template>
              </Suspense>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p class="meta tabular" aria-live="polite">
              <span>{{ wordCount.toLocaleString() }} words</span>
              <span aria-hidden="true"> · </span>
              <span>{{ readMinutes }} min read</span>
              <span aria-hidden="true"> · </span>
              <span>{{ inputText.length.toLocaleString() }} characters</span>
            </p>
            <button
              v-if="inputText.length > 0"
              type="button"
              class="btn-quiet"
              :disabled="isLoading"
              @click="handleClear"
            >
              Clear
            </button>
          </div>

          <div v-if="documentQuality" class="notice mt-4" role="alert">
            <span class="font-medium">This document may not summarize well.</span>
            {{ describeQualityIssues(documentQuality.issues) }}
          </div>

          <fieldset class="mt-8">
            <legend class="sr-only">Summary options</legend>
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label for="summary-type" class="field-label">Type</label>
                <select
                  id="summary-type"
                  v-model="summaryOptions.type"
                  class="select-field"
                  :disabled="isLoading || isCheckingSupport"
                >
                  <option value="tldr">TL;DR</option>
                  <option value="key-points">Key points</option>
                  <option value="teaser">Teaser</option>
                  <option value="headline">Headline</option>
                </select>
              </div>

              <div>
                <label for="summary-length" class="field-label">Length</label>
                <select
                  id="summary-length"
                  v-model="summaryOptions.length"
                  class="select-field"
                  :disabled="isLoading || isCheckingSupport"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>

              <div class="col-span-2">
                <span id="format-label" class="field-label">Format</span>
                <div class="flex h-10 items-center gap-5" role="radiogroup" aria-labelledby="format-label">
                  <label class="flex h-10 cursor-pointer items-center gap-2 text-ui">
                    <input
                      v-model="summaryOptions.format"
                      type="radio"
                      value="plain-text"
                      name="summary-format"
                      :disabled="isLoading || isCheckingSupport"
                    >
                    Plain text
                  </label>
                  <label class="flex h-10 cursor-pointer items-center gap-2 text-ui">
                    <input
                      v-model="summaryOptions.format"
                      type="radio"
                      value="markdown"
                      name="summary-format"
                      :disabled="isLoading || isCheckingSupport"
                    >
                    Markdown
                  </label>
                </div>
              </div>
            </div>
          </fieldset>

          <div class="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <p class="meta">
              Runs on this device · Gemini Nano
            </p>
            <button
              type="button"
              class="btn btn-primary w-full sm:w-auto"
              :disabled="!canSummarize"
              :aria-busy="isLoading"
              :aria-label="isLoading ? 'Analyzing document' : 'Summarize document'"
              @click="handleSummarize"
            >
              {{ isLoading ? 'Reading…' : 'Summarize' }}
            </button>
          </div>
        </div>

        <!-- Reading page -->
        <section
          class="reveal reveal-3 lg:col-span-5"
          aria-labelledby="reading-heading"
        >
          <div class="flex items-baseline justify-between gap-4 pb-3">
            <h2 id="reading-heading" class="font-read text-title">Reading</h2>
            <div class="flex items-center gap-5" role="tablist" aria-label="Reading view">
              <button
                id="summary-tab"
                role="tab"
                type="button"
                class="tab"
                :aria-selected="outputMode === 'summary'"
                aria-controls="summary-panel"
                @click="outputMode = 'summary'"
              >
                Summary
              </button>
              <button
                id="chat-tab"
                role="tab"
                type="button"
                class="tab"
                :aria-selected="outputMode === 'chat'"
                aria-controls="chat-panel"
                @click="outputMode = 'chat'"
              >
                Chat
              </button>
            </div>
          </div>

          <div class="sheet relative flex min-h-[440px] flex-col lg:min-h-[520px]">
            <div
              v-if="outputMode === 'summary'"
              id="summary-panel"
              class="flex flex-1 flex-col"
              role="tabpanel"
              aria-labelledby="summary-tab"
            >
              <div v-if="error && !isLoading" class="p-6 sm:p-8" role="alert">
                <p class="font-read text-[24px] leading-tight">The reading stopped.</p>
                <p class="mt-3 text-ui text-ink-muted">{{ error }}</p>
                <button
                  type="button"
                  class="btn btn-primary mt-6"
                  :disabled="!canSummarize"
                  @click="handleSummarize"
                >
                  Try again
                </button>
              </div>

              <div v-else-if="isLoading" class="p-6 sm:p-8">
                <p class="font-read text-[24px] leading-tight">Writing on this device…</p>
                <p class="mt-3 text-ui text-ink-muted">
                  Long documents can take several minutes. Keep this tab open; you can cancel at any time.
                </p>
                <p class="meta tabular mt-6">{{ elapsedLabel }}</p>
                <div class="progress mt-3" role="progressbar" aria-label="Summarizing">
                  <span />
                </div>
                <button type="button" class="btn-text mt-6" @click="cancelSummarize">
                  Cancel
                </button>
              </div>

              <div v-else-if="summary" class="flex flex-1 flex-col p-6 sm:p-8">
                <p class="meta tabular">
                  {{ typeLabel }} · {{ lengthLabel }} · {{ summary.length.toLocaleString() }} characters
                </p>
                <div class="mt-5 flex-1">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div
                    v-if="summaryOptions.format === 'markdown'"
                    class="reading is-fresh"
                    v-html="formattedSummary"
                  />
                  <pre
                    v-else
                    class="reading is-fresh whitespace-pre-wrap font-read"
                  >{{ summary }}</pre>
                </div>

                <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <button type="button" class="btn-text" @click="handleCopy">
                    Copy
                  </button>
                  <button
                    type="button"
                    class="btn-text"
                    :aria-pressed="showOriginal"
                    @click="showOriginal = !showOriginal"
                  >
                    {{ showOriginal ? 'Hide original' : 'Show original' }}
                  </button>
                </div>

                <div
                  v-if="showOriginal"
                  class="mt-6 bg-inset p-4"
                  aria-label="Original document"
                >
                  <p class="meta">Original</p>
                  <div class="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap text-ui text-ink-muted">{{ inputText }}</div>
                </div>
              </div>

              <div v-else class="flex flex-1 flex-col p-6 sm:p-8">
                <p class="font-read text-[24px] leading-tight">
                  {{ hasDocument ? 'Ready when you are.' : 'No reading yet.' }}
                </p>
                <p class="mt-3 max-w-[38ch] text-ui text-ink-muted">
                  {{ hasDocument
                    ? 'Choose a type and press Summarize. The reading appears here and never leaves this device.'
                    : 'Paste a document or open a file. The summary is written here by Chrome on this device.' }}
                </p>

                <dl class="mt-8 space-y-4">
                  <div>
                    <dt class="text-ui font-medium">TL;DR</dt>
                    <dd class="meta">One paragraph that answers what the document says.</dd>
                  </div>
                  <div>
                    <dt class="text-ui font-medium">Key points</dt>
                    <dd class="meta">The claims worth carrying away, in order.</dd>
                  </div>
                  <div>
                    <dt class="text-ui font-medium">Teaser or headline</dt>
                    <dd class="meta">A short opening line for someone who has not read it.</dd>
                  </div>
                </dl>

                <div class="mt-auto space-y-2 pt-8">
                  <p v-if="cacheStats.size > 0" class="meta tabular">
                    {{ cacheStats.size }} of {{ cacheStats.maxSize }} readings cached on this device
                  </p>
                  <p class="meta">
                    Nothing is uploaded. No account. Works offline once the model is on this device.
                  </p>
                </div>
              </div>
            </div>

            <div
              v-else
              id="chat-panel"
              class="flex flex-1 flex-col"
              role="tabpanel"
              aria-labelledby="chat-tab"
            >
              <Suspense>
                <ChatInterface
                  :document-text="inputText"
                  :has-document="hasDocument"
                />
                <template #fallback>
                  <p class="p-8 text-ui text-ink-muted">Opening the chat…</p>
                </template>
              </Suspense>
            </div>
          </div>
        </section>
      </div>
    </section>

    <SensitiveDataDialog
      :is-open="isSensitiveDialogOpen"
      :findings="sensitiveFindings"
      @confirm="confirmSave"
      @cancel="cancelSave"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, defineAsyncComponent } from 'vue'
import { useChromeAI } from '../composables/useChromeAI'
import { useOfflineStorage } from '../composables/useOfflineStorage'
import { useToast } from '../composables/useToast'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'
import { useSemanticGates } from '../composables/useSemanticGates'
import { formatMarkdown } from '../utils/markdownFormatter'
import { describeQualityIssues, type DocumentQuality, type SensitiveFinding } from '../utils/semanticChecks'
import { AppError, ErrorCode } from '../utils/errorHandler'
import SensitiveDataDialog from '../components/SensitiveDataDialog.vue'

const FileUploader = defineAsyncComponent(() => import('../components/FileUploader.vue'))
const ChatInterface = defineAsyncComponent(() => import('../components/ChatInterface.vue'))

interface SummaryOptions {
  type: string
  format: string
  length: string
  context?: string
}

const { isSupported, isLoading, error, isCheckingSupport, summarizeText, cancelSummarize, getCacheStats } = useChromeAI()
const { isStorageAvailable, saveAnalysis } = useOfflineStorage()
const { assessDocumentQuality, scanSensitiveData } = useSemanticGates()
const toast = useToast()

const inputText = ref<string>('')
const summary = ref<string>('')
const inputMode = ref<'text' | 'file'>('text')
const outputMode = ref<'summary' | 'chat'>('summary')
const summaryOptions = ref<SummaryOptions>({
  type: 'tldr',
  format: 'markdown',
  length: 'medium'
})
const showOriginal = ref(false)

const qualityCheck = ref<{ text: string, quality: DocumentQuality } | null>(null)
const documentQuality = computed(() => {
  const check = qualityCheck.value
  if (!check || check.text !== inputText.value || check.quality.usable) return null
  return check.quality
})

const hasDocument = computed(() => inputText.value.trim().length > 0)
const wordCount = computed(() => {
  const text = inputText.value.trim()
  return text ? text.split(/\s+/).length : 0
})
const readMinutes = computed(() => (wordCount.value ? Math.max(1, Math.ceil(wordCount.value / 220)) : 0))
const cacheStats = computed(() => getCacheStats())
const typeLabel = computed(() => {
  const labels: Record<string, string> = {
    tldr: 'TL;DR',
    'key-points': 'Key points',
    teaser: 'Teaser',
    headline: 'Headline'
  }
  return labels[summaryOptions.value.type] ?? 'Summary'
})
const lengthLabel = computed(() => {
  const labels: Record<string, string> = { short: 'Short', medium: 'Medium', long: 'Long' }
  return labels[summaryOptions.value.length] ?? summaryOptions.value.length
})

const isSensitiveDialogOpen = ref(false)
const sensitiveFindings = ref<SensitiveFinding[]>([])
const pendingAnalysis = ref<{ text: string, summary: string } | null>(null)

const elapsedSeconds = ref(0)
let elapsedTimer: ReturnType<typeof setInterval> | undefined

const stopElapsedTimer = () => {
  clearInterval(elapsedTimer)
  elapsedTimer = undefined
}

watch(isLoading, (loading) => {
  stopElapsedTimer()
  if (!loading) return
  elapsedSeconds.value = 0
  elapsedTimer = setInterval(() => {
    elapsedSeconds.value++
  }, 1000)
})

onUnmounted(stopElapsedTimer)

const elapsedLabel = computed(() => {
  const minutes = Math.floor(elapsedSeconds.value / 60)
  const seconds = String(elapsedSeconds.value % 60).padStart(2, '0')
  return `Elapsed ${minutes}:${seconds}`
})

const canSummarize = computed(() => {
  return isSupported.value && inputText.value.trim().length > 0 && !isLoading.value && !isCheckingSupport.value
})

const formattedSummary = computed(() => {
  if (summaryOptions.value.format === 'markdown' && summary.value) {
    return formatMarkdown(summary.value)
  }
  return summary.value
})

const saveToHistory = (text: string, result: string) => {
  if (!isStorageAvailable.value || !result) return

  try {
    saveAnalysis(text, result, summaryOptions.value)
    toast.info('Analysis saved to history')
  } catch (storageError) {
    console.warn('Failed to save analysis offline:', storageError)
    toast.warning('Could not save to history')
  }
}

const confirmSave = () => {
  const pending = pendingAnalysis.value

  isSensitiveDialogOpen.value = false
  sensitiveFindings.value = []
  pendingAnalysis.value = null

  if (pending) saveToHistory(pending.text, pending.summary)
}

const cancelSave = () => {
  isSensitiveDialogOpen.value = false
  sensitiveFindings.value = []
  pendingAnalysis.value = null
  toast.info('Summary kept on screen, not saved to history')
}

const handleSummarize = async () => {
  if (!canSummarize.value) return

  const cacheStatsBefore = getCacheStats()
  const hadCacheBefore = cacheStatsBefore.size
  const text = inputText.value

  try {
    const quality = await assessDocumentQuality(text)
    qualityCheck.value = { text, quality }

    const result = await summarizeText(text, summaryOptions.value)
    summary.value = result

    const cacheStatsAfter = getCacheStats()
    const usedCache = cacheStatsAfter.size === hadCacheBefore

    if (usedCache) {
      toast.success('Summary retrieved from cache')
    }

    if (!result || !isStorageAvailable.value) return

    const findings = await scanSensitiveData(text)
    if (findings.length > 0) {
      pendingAnalysis.value = { text, summary: result }
      sensitiveFindings.value = findings
      isSensitiveDialogOpen.value = true
      return
    }

    saveToHistory(text, result)
  } catch (err) {
    if (err instanceof AppError && err.code === ErrorCode.AI_CANCELLED) {
      toast.info('Summarization cancelled')
      return
    }
    console.error('Summarization failed:', err)
    toast.error(err instanceof Error ? err.message : 'Failed to generate summary')
  }
}

const handleClear = () => {
  inputText.value = ''
  summary.value = ''
  qualityCheck.value = null
  showOriginal.value = false
  pendingAnalysis.value = null
  sensitiveFindings.value = []
  isSensitiveDialogOpen.value = false
  toast.info('Content cleared')
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(summary.value)
    toast.success('Summary copied to clipboard')
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    toast.error('Failed to copy to clipboard')
  }
}

const handleFileLoaded = async (
  content: string,
  filename: string,
  metadata?: { wordCount: number, charCount: number, pageCount?: number }
) => {
  inputText.value = content
  inputMode.value = 'text'

  if (metadata) {
    const pageInfo = metadata.pageCount ? ` (${metadata.pageCount} pages)` : ''
    toast.info(`File "${filename}" loaded${pageInfo}. ${metadata.wordCount} words ready.`)
  } else {
    toast.info(`File "${filename}" loaded. You can now edit or summarize it.`)
  }

  const quality = await assessDocumentQuality(content)
  qualityCheck.value = { text: content, quality }
}

useKeyboardShortcuts([
  {
    key: 'Enter',
    ctrl: true,
    description: 'Summarize document',
    handler: () => {
      if (canSummarize.value) {
        handleSummarize()
      }
    }
  },
  {
    key: 'k',
    ctrl: true,
    description: 'Clear content',
    handler: handleClear
  },
  {
    key: 'c',
    ctrl: true,
    shift: true,
    description: 'Copy summary',
    handler: () => {
      if (summary.value) {
        handleCopy()
      }
    }
  },
  {
    key: '1',
    alt: true,
    description: 'Switch to Summary tab',
    handler: () => {
      outputMode.value = 'summary'
    }
  },
  {
    key: '2',
    alt: true,
    description: 'Switch to Chat tab',
    handler: () => {
      outputMode.value = 'chat'
    }
  }
])
</script>

<template>
  <main id="main-content" class="max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-4 sm:py-8" role="main" aria-label="Document Analysis">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
      
      <!-- Input Section -->
      <section class="space-y-4 sm:space-y-6" aria-labelledby="input-section-title">
        <div class="card p-4 sm:p-6">
          <h2 id="input-section-title" class="text-lg sm:text-xl font-semibold text-gray-500 dark:text-white mb-3 sm:mb-4 flex items-center">
            <Icon name="heroicons:document-plus" class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-400" aria-hidden="true" />
            Document Input
          </h2>
          
          <!-- Input Mode Tabs -->
          <div class="flex gap-2 mb-3 sm:mb-4" role="tablist" aria-label="Input mode selection">
            <button
              role="tab"
              :aria-selected="inputMode === 'text'"
              :aria-controls="inputMode === 'text' ? 'text-input-panel' : undefined"
              :class="[
                'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all flex-1 sm:flex-none',
                inputMode === 'text' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
                isCheckingSupport && 'opacity-50 cursor-not-allowed'
              ]"
              :disabled="isCheckingSupport"
              @click="inputMode = 'text'"
            >
              <Icon name="heroicons:pencil-square" class="w-3 h-3 sm:w-4 sm:h-4 inline" aria-hidden="true" />
              <span class="ml-1 sm:ml-0">Text</span>
            </button>
            <button
              role="tab"
              :aria-selected="inputMode === 'file'"
              :aria-controls="inputMode === 'file' ? 'file-upload-panel' : undefined"
              :class="[
                'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all flex-1 sm:flex-none',
                inputMode === 'file' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
                isCheckingSupport && 'opacity-50 cursor-not-allowed'
              ]"
              :disabled="isCheckingSupport"
              @click="inputMode = 'file'"
            >
              <Icon name="heroicons:document-arrow-up" class="w-3 h-3 sm:w-4 sm:h-4 inline" aria-hidden="true" />
              <span class="ml-1 sm:ml-0">File</span>
            </button>
          </div>
          
          <!-- File Upload Mode -->
          <div
            v-if="inputMode === 'file'"
            id="file-upload-panel"
            role="tabpanel"
            aria-labelledby="file-upload-tab"
          >
            <Suspense>
              <FileUploader @file-loaded="handleFileLoaded" />
              <template #fallback>
                <div class="flex items-center justify-center py-12">
                  <Icon name="heroicons:arrow-path" class="w-6 h-6 text-primary animate-spin mr-2" />
                  <span class="text-gray-600 dark:text-gray-400">Loading uploader...</span>
                </div>
              </template>
            </Suspense>
          </div>
          
          <!-- Text Area -->
          <div
            v-if="inputMode === 'text'"
            id="text-input-panel"
            role="tabpanel"
            aria-labelledby="text-input-tab"
            class="space-y-4"
          >
            <label for="document-textarea" class="sr-only">Document text input</label>
            <textarea
              id="document-textarea"
              v-model="inputText"
              class="textarea-field"
              :rows="textareaRows"
              placeholder="Paste your document text here for analysis..."
              :disabled="isLoading || isCheckingSupport"
              :aria-describedby="inputText.length > 0 ? 'char-counter' : undefined"
            />
            
            <!-- Character Counter -->
            <div id="char-counter" class="flex justify-between items-center text-sm dark:text-gray-400 text-gray-500" aria-live="polite">
              <span aria-label="Character count">{{ inputText.length.toLocaleString() }} characters</span>
              <span v-if="inputText.length > 10000" class="text-yellow-400" role="alert">
                Very long text may take more time to process
              </span>
            </div>

            <!-- Semantic quality warning (heuristics + Decisions API when available) -->
            <div
              v-if="documentQuality"
              class="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-3 flex items-start space-x-2"
              role="alert"
            >
              <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div class="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                <p class="font-medium">This document may not summarize well</p>
                <p class="mt-1">{{ describeQualityIssues(documentQuality.issues) }}</p>
              </div>
            </div>
          </div>
          
          <!-- Summarizer Options -->
          <fieldset class="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            <legend class="text-base sm:text-lg font-medium dark:text-gray-200 text-gray-400">Summary Options</legend>
            
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label for="summary-type" class="block text-sm font-medium dark:text-gray-300 text-gray-400 mb-2">Type</label>
                <select 
                  id="summary-type"
                  v-model="summaryOptions.type"
                  class="select-field"
                  :disabled="isLoading || isCheckingSupport"
                  aria-label="Summary type"
                >
                  <option value="tldr">TL;DR</option>
                  <option value="key-points">Key Points</option>
                  <option value="teaser">Teaser</option>
                  <option value="headline">Headline</option>
                </select>
              </div>
              
              <div>
                <label for="summary-length" class="block text-sm font-medium dark:text-gray-300 text-gray-400 mb-2">Length</label>
                <select 
                  id="summary-length"
                  v-model="summaryOptions.length"
                  class="select-field"
                  :disabled="isLoading || isCheckingSupport"
                  aria-label="Summary length"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>
            
            <div role="group" aria-labelledby="format-label">
              <label id="format-label" class="block text-sm font-medium dark:text-gray-300 text-gray-400 mb-2">Format</label>
              <div class="flex space-x-4">
                <label class="flex items-center cursor-pointer">
                  <input 
                    id="format-plain"
                    v-model="summaryOptions.format"
                    type="radio" 
                    value="plain-text"
                    name="summary-format"
                    :disabled="isLoading || isCheckingSupport"
                    class="text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                  >
                  <span class="ml-2 dark:text-gray-400 text-gray-700">Plain Text</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input 
                    id="format-markdown"
                    v-model="summaryOptions.format"
                    type="radio" 
                    value="markdown"
                    name="summary-format"
                    :disabled="isLoading || isCheckingSupport"
                    class="text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                  >
                  <span class="ml-2 dark:text-gray-400 text-gray-700">Markdown</span>
                </label>
              </div>
            </div>
          </fieldset>
          
          <!-- Action Buttons -->
          <div class="mt-4 sm:mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              :disabled="!canSummarize"
              :aria-busy="isLoading"
              :aria-label="isLoading ? 'Analyzing document' : 'Summarize document'"
              class="btn-primary flex-1 flex items-center justify-center text-sm sm:text-base"
              @click="handleSummarize"
            >
              <Icon v-if="isLoading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
              <Icon v-else name="heroicons:sparkles" class="w-4 h-4 mr-2" aria-hidden="true" />
              {{ isLoading ? 'Analyzing...' : 'Summarize' }}
            </button>
            
            <button
              :disabled="isLoading || isCheckingSupport"
              aria-label="Clear input and summary"
              class="btn-secondary flex items-center justify-center text-sm sm:text-base"
              @click="handleClear"
            >
              <Icon name="heroicons:trash" class="w-4 h-4 mr-2" aria-hidden="true" />
              Clear
            </button>
          </div>
        </div>
      </section>
      
      <!-- Output Section -->
      <section class="space-y-4 sm:space-y-6" aria-labelledby="output-section-title">
        <div class="card p-4 sm:p-6">
          <h2 id="output-section-title" class="sr-only">Analysis Results</h2>
          <!-- Output Mode Tabs -->
          <div class="flex gap-2 mb-3 sm:mb-4" role="tablist" aria-label="Output view selection">
            <button
              role="tab"
              :aria-selected="outputMode === 'summary'"
              :aria-controls="outputMode === 'summary' ? 'summary-panel' : undefined"
              :class="[
                'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all flex-1',
                outputMode === 'summary' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
              @click="outputMode = 'summary'"
            >
              <Icon name="heroicons:light-bulb" class="w-3 h-3 sm:w-4 sm:h-4 inline" aria-hidden="true" />
              <span class="ml-1">Summary</span>
            </button>
            <button
              role="tab"
              :aria-selected="outputMode === 'chat'"
              :aria-controls="outputMode === 'chat' ? 'chat-panel' : undefined"
              :class="[
                'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all flex-1',
                outputMode === 'chat' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
              @click="outputMode = 'chat'"
            >
              <Icon name="heroicons:chat-bubble-left-right" class="w-3 h-3 sm:w-4 sm:h-4 inline" aria-hidden="true" />
              <span class="ml-1">Chat</span>
            </button>
          </div>
          
          <!-- Summary Tab Content -->
          <div
            v-if="outputMode === 'summary'"
            id="summary-panel"
            role="tabpanel"
            aria-labelledby="summary-tab"
          >
            <!-- Error Display -->
            <div v-if="error" role="alert" class="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
              <div class="flex items-center">
                <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-400" aria-hidden="true" />
                <span class="text-red-600 dark:text-red-400 font-medium">Error</span>
              </div>
              <p class="text-red-500 dark:text-red-300 mt-1">{{ error }}</p>
            </div>
            
            <!-- Loading State -->
            <div v-if="isLoading" role="status" aria-live="polite" class="flex items-center justify-center py-12">
              <div class="text-center">
                <Icon name="heroicons:cog-6-tooth" class="w-8 h-8 text-primary animate-spin mx-auto mb-3" aria-hidden="true" />
                <p class="text-gray-400">Analyzing your document...</p>
                <p class="text-sm text-gray-500 mt-1">{{ elapsedLabel }}</p>
                <p class="text-xs text-gray-500 mt-3 max-w-xs mx-auto">
                  Summarizing runs on your device, so long texts can take several minutes. Keep this tab open.
                </p>
                <button
                  class="btn-secondary mt-4 px-4 py-2 text-sm"
                  aria-label="Cancel summarization"
                  @click="cancelSummarize"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <!-- Summary Display -->
            <div v-else-if="summary" class="space-y-4">
            <div class="bg-white dark:bg-gray-700/50 rounded-lg p-4" role="article" aria-label="Generated summary">
              <div class="prose prose-invert max-w-none">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div v-if="summaryOptions.format === 'markdown'" class="text-gray-900 dark:text-gray-200" v-html="formattedSummary" />
                <pre v-else class="whitespace-pre-wrap text-gray-900 dark:text-gray-200 font-normal">{{ summary }}</pre>
              </div>
            </div>
            
            <!-- Summary Stats -->
            <div class="flex justify-between items-center text-sm text-gray-400 pt-4 border-t border-gray-700">
              <span>{{ summary.length.toLocaleString() }} characters</span>
              <button
                class="text-indigo-400 hover:text-indigo-300 flex items-center"
                @click="handleCopy"
              >
                <Icon name="heroicons:clipboard-document" class="w-4 h-4 mr-1" />
                Copy
              </button>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else class="flex items-center justify-center py-12">
            <div class="text-center">
              <Icon name="heroicons:document-text" class="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p class="text-gray-400">No summary yet</p>
              <p class="text-sm text-gray-500 mt-1">Enter text and click "Summarize" to get started</p>
            </div>
          </div>
          </div>
          
          <!-- Chat Tab Content -->
          <div
            v-if="outputMode === 'chat'"
            id="chat-panel"
            role="tabpanel"
            aria-labelledby="chat-tab"
          >
            <Suspense>
              <ChatInterface 
                :document-text="inputText"
                :has-document="inputText.trim().length > 0"
                :chat-height="chatHeight"
              />
              <template #fallback>
                <div class="flex items-center justify-center h-full">
                  <Icon name="heroicons:arrow-path" class="w-6 h-6 text-primary animate-spin mr-2" />
                  <span class="text-gray-600 dark:text-gray-400">Loading chat...</span>
                </div>
              </template>
            </Suspense>
          </div>
        </div>
        
        <!-- AI Status Info -->
        <aside v-if="isSupported" class="card p-3 sm:p-4" aria-label="AI Status Information">
          <h3 class="text-md font-medium text-gray-500 dark:text-gray-300 mb-2">AI Status</h3>
          <div class="text-sm text-gray-400 space-y-1">
            <div>Status: <span class="text-green-500 dark:text-green-400" role="status">Ready</span></div>
            <div>Model: Gemini Nano (on-device)</div>
            <div v-if="getCacheStats().size > 0" class="flex items-center gap-1">
              <Icon name="heroicons:bolt" class="w-3 h-3 text-yellow-500" />
              Cache: {{ getCacheStats().size }}/{{ getCacheStats().maxSize }} summaries
            </div>
          </div>
        </aside>
      </section>
    </div>

    <SensitiveDataDialog
      :is-open="isSensitiveDialogOpen"
      :findings="sensitiveFindings"
      @confirm="confirmSave"
      @cancel="cancelSave"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useChromeAI } from '../composables/useChromeAI'
import { useOfflineStorage } from '../composables/useOfflineStorage'
import { useToast } from '../composables/useToast'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'
import { useSemanticGates } from '../composables/useSemanticGates'
import { formatMarkdown } from '../utils/markdownFormatter'
import { describeQualityIssues, type DocumentQuality, type SensitiveFinding } from '../utils/semanticChecks'
import { AppError, ErrorCode } from '../utils/errorHandler'
import SensitiveDataDialog from '../components/SensitiveDataDialog.vue'

// Lazy load heavy components for better initial load performance
const FileUploader = defineAsyncComponent(() => import('../components/FileUploader.vue'))
const ChatInterface = defineAsyncComponent(() => import('../components/ChatInterface.vue'))

// Types for summary options
interface SummaryOptions {
  type: string
  format: string
  length: string
  context?: string
}

// Use Chrome AI composable directly - no props needed
const { isSupported, isLoading, error, isCheckingSupport, summarizeText, cancelSummarize, getCacheStats } = useChromeAI()

// Use offline storage composable
const { isStorageAvailable, saveAnalysis } = useOfflineStorage()

// Semantic pre-checks: quality on input, sensitive data before persisting
const { assessDocumentQuality, scanSensitiveData } = useSemanticGates()

// Use toast notifications
const toast = useToast()

// Local state - moved from app.vue
const inputText = ref<string>('')
const summary = ref<string>('')
const inputMode = ref<'text' | 'file'>('text')
const outputMode = ref<'summary' | 'chat'>('summary')
const summaryOptions = ref<SummaryOptions>({
  type: 'tldr',
  format: 'markdown',
  length: 'medium'
})

// Quality is tied to the exact text it was computed for, so editing invalidates it
const qualityCheck = ref<{ text: string, quality: DocumentQuality } | null>(null)
const documentQuality = computed(() => {
  const check = qualityCheck.value
  if (!check || check.text !== inputText.value || check.quality.usable) return null
  return check.quality
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
  return `Elapsed: ${minutes}:${seconds}`
})

// Computed properties - moved from app.vue
const canSummarize = computed(() => {
  return isSupported.value && inputText.value.trim().length > 0 && !isLoading.value && !isCheckingSupport.value
})

const formattedSummary = computed(() => {
  if (summaryOptions.value.format === 'markdown' && summary.value) {
    // Use the new markdown formatter utility with built-in sanitization
    return formatMarkdown(summary.value)
  }
  return summary.value
})

// Reactive viewport height for responsive textarea
const viewportHeight = ref(0)

// Responsive textarea rows based on screen size and content
const textareaRows = computed(() => {
  if (typeof window === 'undefined') return 12 // SSR fallback
  
  const height = viewportHeight.value || window.innerHeight
  const baseRows = 12
  
  // Increase rows for larger screens
  if (height >= 1080) {
    return Math.min(20, baseRows + 8) // Large screens: up to 20 rows
  } else if (height >= 800) {
    return Math.min(16, baseRows + 4) // Medium screens: up to 16 rows
  } else if (height >= 600) {
    return Math.min(14, baseRows + 2) // Small-medium screens: up to 14 rows
  }
  
  return baseRows // Small screens: default 12 rows
})

// Calculate chat height to match textarea (approximate line height: 1.5rem + padding)
const chatHeight = computed(() => {
  const rows = textareaRows.value
  // Each row is approximately 1.5rem (24px) + extra padding for chat
  const heightInRem = rows * 1.5 + 8 // +8rem for more space (header, padding, input)
  return `${heightInRem}rem`
})

// Update viewport height on mount and resize
onMounted(() => {
  if (typeof window !== 'undefined') {
    viewportHeight.value = window.innerHeight
    
    const handleResize = () => {
      viewportHeight.value = window.innerHeight
    }
    
    window.addEventListener('resize', handleResize)
    
    // Cleanup on unmount
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
  }
})

// No props needed - using composable directly

// Local methods
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
  
  // Track if we had cache before the operation
  const cacheStatsBefore = getCacheStats()
  const hadCacheBefore = cacheStatsBefore.size
  const text = inputText.value
  
  try {
    // Warn about content that will not summarize well, but never block the user
    const quality = await assessDocumentQuality(text)
    qualityCheck.value = { text, quality }
    if (!quality.usable) {
      toast.warning(describeQualityIssues(quality.issues))
    }

    const result = await summarizeText(text, summaryOptions.value)
    summary.value = result
    
    // Check if cache was used (size didn't increase)
    const cacheStatsAfter = getCacheStats()
    const usedCache = cacheStatsAfter.size === hadCacheBefore
    
    // Show success notification with cache indicator
    if (usedCache) {
      toast.success('✨ Summary retrieved from cache (instant!)')
    } else {
      toast.success('Summary generated successfully!')
    }
    
    if (!result || !isStorageAvailable.value) return

    // Ask before persisting personal data or credentials to the local history
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
  pendingAnalysis.value = null
  sensitiveFindings.value = []
  isSensitiveDialogOpen.value = false
  toast.info('Content cleared')
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(summary.value)
    toast.success('Summary copied to clipboard!')
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
  inputMode.value = 'text' // Switch to text mode to show the loaded content
  
  // Show detailed info message
  if (metadata) {
    const pageInfo = metadata.pageCount ? ` (${metadata.pageCount} pages)` : ''
    toast.info(`File "${filename}" loaded${pageInfo}. ${metadata.wordCount} words ready to summarize.`)
  } else {
    toast.info(`File "${filename}" loaded. You can now edit or summarize it.`)
  }

  // Flag failed extractions (scanned PDFs, OCR noise) before the user summarizes
  const quality = await assessDocumentQuality(content)
  qualityCheck.value = { text: content, quality }
  if (!quality.usable) {
    toast.warning(describeQualityIssues(quality.issues))
  }
}

// Keyboard shortcuts
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
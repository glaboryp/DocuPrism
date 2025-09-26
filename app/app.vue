<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
    <NuxtRouteAnnouncer />
    
    <!-- Header -->
    <header class="relative bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:document-text" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white">DocuPrism</h1>
              <p class="text-sm text-gray-400">On-Device Document Analysis</p>
            </div>
          </div>
          
          <!-- Status Badge -->
          <div class="flex items-center space-x-2">
            <div v-if="!isSupported && !isCheckingSupport" 
                 class="flex items-center space-x-2 px-3 py-1 bg-red-900/30 border border-red-700 rounded-full">
              <Icon name="heroicons:exclamation-triangle" class="w-4 h-4 text-red-400" />
              <span class="text-sm text-red-400">AI Not Supported</span>
            </div>
            <div v-else-if="isSupported" 
                 class="flex items-center space-x-2 px-3 py-1 bg-green-900/30 border border-green-700 rounded-full">
              <Icon name="heroicons:check-circle" class="w-4 h-4 text-green-400" />
              <span class="text-sm text-green-400">AI Ready</span>
            </div>
            <div v-else 
                 class="flex items-center space-x-2 px-3 py-1 bg-yellow-900/30 border border-yellow-700 rounded-full">
              <Icon name="heroicons:clock" class="w-4 h-4 text-yellow-400" />
              <span class="text-sm text-yellow-400">Checking...</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Input Section -->
        <div class="space-y-6">
          <div class="card p-6">
            <h2 class="text-xl font-semibold text-white mb-4 flex items-center">
              <Icon name="heroicons:document-plus" class="w-5 h-5 mr-2 text-indigo-400" />
              Document Input
            </h2>
            
            <!-- Text Area -->
            <div class="space-y-4">
              <textarea
                v-model="inputText"
                class="textarea-field"
                rows="12"
                placeholder="Paste your document text here for analysis..."
                :disabled="isLoading"
              />
              
              <!-- Character Counter -->
              <div class="flex justify-between items-center text-sm text-gray-400">
                <span>{{ inputText.length.toLocaleString() }} characters</span>
                <span v-if="inputText.length > 10000" class="text-yellow-400">
                  Very long text may take more time to process
                </span>
              </div>
            </div>
            
            <!-- Summarizer Options -->
            <div class="mt-6 space-y-4">
              <h3 class="text-lg font-medium text-gray-200">Summary Options</h3>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select v-model="summaryOptions.type" class="input-field">
                    <option value="tl;dr">TL;DR</option>
                    <option value="key-points">Key Points</option>
                    <option value="teaser">Teaser</option>
                    <option value="headline">Headline</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Length</label>
                  <select v-model="summaryOptions.length" class="input-field">
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Format</label>
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input 
                      v-model="summaryOptions.format" 
                      type="radio" 
                      value="plain-text"
                      class="text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-gray-300">Plain Text</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="summaryOptions.format" 
                      type="radio" 
                      value="markdown"
                      class="text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                    />
                    <span class="ml-2 text-gray-300">Markdown</span>
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="mt-6 flex space-x-4">
              <button
                @click="handleSummarize"
                :disabled="!canSummarize"
                class="btn-primary flex-1 flex items-center justify-center"
              >
                <Icon v-if="isLoading" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
                <Icon v-else name="heroicons:sparkles" class="w-4 h-4 mr-2" />
                {{ isLoading ? 'Analyzing...' : 'Summarize' }}
              </button>
              
              <button
                @click="clearAll"
                :disabled="isLoading"
                class="btn-secondary"
              >
                <Icon name="heroicons:trash" class="w-4 h-4 mr-2" />
                Clear
              </button>
            </div>
          </div>
        </div>
        
        <!-- Output Section -->
        <div class="space-y-6">
          <div class="card p-6">
            <h2 class="text-xl font-semibold text-white mb-4 flex items-center">
              <Icon name="heroicons:light-bulb" class="w-5 h-5 mr-2 text-yellow-400" />
              Summary Results
            </h2>
            
            <!-- Error Display -->
            <div v-if="error" class="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <div class="flex items-center">
                <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-400 mr-2" />
                <span class="text-red-400 font-medium">Error</span>
              </div>
              <p class="text-red-300 mt-1">{{ error }}</p>
            </div>
            
            <!-- Loading State -->
            <div v-if="isLoading" class="flex items-center justify-center py-12">
              <div class="text-center">
                <Icon name="heroicons:cog-6-tooth" class="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                <p class="text-gray-400">Analyzing your document...</p>
                <p class="text-sm text-gray-500 mt-1">This may take a few moments</p>
              </div>
            </div>
            
            <!-- Summary Display -->
            <div v-else-if="summary" class="space-y-4">
              <div class="bg-gray-700/50 rounded-lg p-4">
                <div class="prose prose-invert max-w-none">
                  <div v-if="summaryOptions.format === 'markdown'" v-html="formattedSummary" />
                  <pre v-else class="whitespace-pre-wrap text-gray-200 font-normal">{{ summary }}</pre>
                </div>
              </div>
              
              <!-- Summary Stats -->
              <div class="flex justify-between items-center text-sm text-gray-400 pt-4 border-t border-gray-700">
                <span>{{ summary.length.toLocaleString() }} characters</span>
                <button
                  @click="copyToClipboard"
                  class="text-indigo-400 hover:text-indigo-300 flex items-center"
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
          
          <!-- AI Capabilities Info -->
          <div v-if="capabilities" class="card p-4">
            <h3 class="text-sm font-medium text-gray-300 mb-2">AI Capabilities</h3>
            <div class="text-xs text-gray-400 space-y-1">
              <div>Status: <span class="text-green-400">{{ capabilities.available }}</span></div>
              <div v-if="capabilities.defaultTopK">Top-K: {{ capabilities.defaultTopK }}</div>
              <div v-if="capabilities.defaultTemperature">Temperature: {{ capabilities.defaultTemperature }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="mt-16 bg-gray-900/50 backdrop-blur-sm border-t border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-400">
        <p class="text-sm">
          Built with ❤️ for the Google Chrome Built-in AI Challenge 2025
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Meta and head configuration
useHead({
  title: 'DocuPrism - On-Device Document Analysis',
  meta: [
    { name: 'description', content: 'Privacy-first, offline-capable PWA for on-device document analysis using Chrome Built-in AI' }
  ]
})

// Reactive state
const inputText = ref('')
const summary = ref('')
const isCheckingSupport = ref(true)
const capabilities = ref(null)
const isSupported = ref(false)
const isLoading = ref(false)
const error = ref('')

// Summary options
const summaryOptions = ref({
  type: 'tl;dr',
  format: 'plain-text',
  length: 'medium'
})

// Computed properties
const canSummarize = computed(() => {
  return isSupported.value && inputText.value.trim().length > 0 && !isLoading.value
})

const formattedSummary = computed(() => {
  if (summaryOptions.value.format === 'markdown' && summary.value) {
    // Basic markdown to HTML conversion for display
    return summary.value
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
  }
  return summary.value
})

// Chrome AI Methods
const checkAISupport = async () => {
  try {
    // @ts-ignore - Chrome AI types not available
    if (typeof window === 'undefined' || !window.ai?.summarizer) {
      error.value = 'Chrome Built-in AI is not supported in this browser'
      return false
    }

    // @ts-ignore - Chrome AI types not available
    const caps = await window.ai.summarizer.capabilities()
    
    if (caps.available === 'no') {
      error.value = 'Summarizer API is not available'
      return false
    }

    if (caps.available === 'after-download') {
      error.value = 'Summarizer API requires download. Please wait for the model to be downloaded.'
      return false
    }

    isSupported.value = true
    capabilities.value = caps
    error.value = ''
    return true
  } catch (err) {
    error.value = `Failed to check AI support: ${err instanceof Error ? err.message : 'Unknown error'}`
    return false
  }
}

const summarizeText = async (text, options) => {
  try {
    // @ts-ignore - Chrome AI types not available
    if (!window.ai?.summarizer) {
      throw new Error('Summarizer API is not available')
    }

    // @ts-ignore - Chrome AI types not available
    const summarizer = await window.ai.summarizer.create(options)
    const result = await summarizer.summarize(text, options)
    summarizer.destroy()
    
    return result
  } catch (err) {
    throw new Error(`Failed to summarize: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

// Methods
const handleSummarize = async () => {
  if (!canSummarize.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    summary.value = await summarizeText(inputText.value, summaryOptions.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to summarize text'
    console.error('Summarization failed:', err)
  } finally {
    isLoading.value = false
  }
}

const clearAll = () => {
  inputText.value = ''
  summary.value = ''
  error.value = ''
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(summary.value)
    // TODO: Add toast notification
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}

// Initialize on mount
onMounted(async () => {
  isCheckingSupport.value = true
  try {
    await checkAISupport()
  } catch (err) {
    console.error('Failed to initialize AI:', err)
  } finally {
    isCheckingSupport.value = false
  }
})
</script>

import { ref, readonly, onMounted } from 'vue'

// Types for Chrome Built-in AI
interface AISummarizerCapabilities {
  available: 'readily' | 'after-download' | 'no'
  defaultTopK?: number
  maxTopK?: number
  defaultTemperature?: number
}

interface AISummarizerOptions {
  type?: 'tl;dr' | 'key-points' | 'teaser' | 'headline'
  format?: 'markdown' | 'plain-text'  
  length?: 'short' | 'medium' | 'long'
  sharedContext?: string
}

interface AISummarizer {
  summarize(input: string, options?: Partial<AISummarizerOptions>): Promise<string>
  destroy(): void
}

export const useChromeAI = () => {
  const isSupported = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Check if Chrome Built-in AI is supported
  const checkSupport = async (): Promise<boolean> => {
    try {
      // @ts-expect-error // window.ai is injected by Chrome
      if (typeof window === 'undefined' || !window.ai?.summarizer) {
        error.value = 'Chrome Built-in AI is not supported in this browser'
        return false
      }

      // @ts-expect-error // window.ai is injected by Chrome
      const capabilities = await window.ai.summarizer.capabilities()
      
      if (capabilities.available === 'no') {
        error.value = 'Summarizer API is not available'
        return false
      }

      if (capabilities.available === 'after-download') {
        error.value = 'Summarizer API requires download. Please wait for the model to be downloaded.'
        return false
      }

      isSupported.value = true
      error.value = null
      return true
    } catch (err) {
      error.value = `Failed to check AI support: ${err instanceof Error ? err.message : 'Unknown error'}`
      return false
    }
  }

  // Get summarizer capabilities
  const getCapabilities = async (): Promise<AISummarizerCapabilities | null> => {
    try {
      // @ts-expect-error // window.ai is injected by Chrome
      if (!window.ai?.summarizer) return null
      // @ts-expect-error // window.ai is injected by Chrome
      return await window.ai.summarizer.capabilities()
    } catch (err) {
      error.value = `Failed to get capabilities: ${err instanceof Error ? err.message : 'Unknown error'}`
      return null
    }
  }

  // Create a summarizer instance
  const createSummarizer = async (options?: Partial<AISummarizerOptions>): Promise<AISummarizer | null> => {
    try {
      // @ts-expect-error // window.ai is injected by Chrome
      if (!window.ai?.summarizer) {
        error.value = 'Summarizer API is not available'
        return null
      }

      isLoading.value = true
      // @ts-expect-error // window.ai is injected by Chrome
      const summarizer = await window.ai.summarizer.create(options)
      error.value = null
      return summarizer
    } catch (err) {
      error.value = `Failed to create summarizer: ${err instanceof Error ? err.message : 'Unknown error'}`
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Summarize text with error handling
  const summarizeText = async (
    text: string, 
    options?: Partial<AISummarizerOptions>
  ): Promise<string> => {
    if (!text.trim()) {
      throw new Error('Please provide text to summarize')
    }

    isLoading.value = true
    error.value = null

    try {
      const summarizer = await createSummarizer(options)
      
      if (!summarizer) {
        throw new Error('Failed to create summarizer')
      }

      const summary = await summarizer.summarize(text, options)
      
      // Clean up the summarizer
      summarizer.destroy()
      
      if (!summary.trim()) {
        throw new Error('No summary was generated')
      }

      return summary
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to summarize text'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  // Initialize on client side
  onMounted(async () => {
    await checkSupport()
  })

  return {
    isSupported: readonly(isSupported),
    isLoading: readonly(isLoading),
    error: readonly(error),
    checkSupport,
    getCapabilities,
    createSummarizer,
    summarizeText
  }
}
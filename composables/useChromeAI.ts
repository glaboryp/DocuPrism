import { ref, readonly, onMounted } from 'vue'
import type { AISummarizer, AISummarizerOptions, AISummarizerCapabilities } from '~/types/chrome-ai'

export const useChromeAI = () => {
  const isSupported = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Check if Chrome Built-in AI is supported
  const checkSupport = async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined' || !window.ai?.summarizer) {
        error.value = 'Chrome Built-in AI is not supported in this browser'
        return false
      }

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
      if (!window.ai?.summarizer) return null
      return await window.ai.summarizer.capabilities()
    } catch (err) {
      error.value = `Failed to get capabilities: ${err instanceof Error ? err.message : 'Unknown error'}`
      return null
    }
  }

  // Create a summarizer instance
  const createSummarizer = async (options?: Partial<AISummarizerOptions>): Promise<AISummarizer | null> => {
    try {
      if (!window.ai?.summarizer) {
        error.value = 'Summarizer API is not available'
        return null
      }

      isLoading.value = true
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
import { ref, readonly, onMounted } from 'vue'

// Chrome AI Types according to official documentation
interface SummarizerMonitor {
  addEventListener(event: 'downloadprogress', callback: (e: { loaded: number }) => void): void
}

interface SummarizerCreateOptions {
  sharedContext?: string
  type?: 'key-points' | 'tldr' | 'teaser' | 'headline'
  format?: 'markdown' | 'plain-text'
  length?: 'short' | 'medium' | 'long'
  monitor?: (monitor: SummarizerMonitor) => void
}

interface SummarizerInstance {
  summarize(input: string, options?: { context?: string }): Promise<string>
  summarizeStreaming(input: string, options?: { context?: string }): AsyncIterable<string>
  destroy(): void
}

interface SummaryOptions {
  type: string
  format: string
  length: string
  context?: string
}

// Extend Window interface
declare global {
  interface Window {
    Summarizer?: {
      availability(): Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'>
      create(options?: SummarizerCreateOptions): Promise<SummarizerInstance>
    }
  }
}

export const useChromeAI = () => {
  const isSupported = ref(false)
  const isLoading = ref(false)
  const error = ref<string>('')
  const isCheckingSupport = ref(true)

  // Chrome AI Methods according to official documentation
  const checkSupport = async (): Promise<boolean> => {
    try {
      // Feature detection to check if browser supports Summarizer API
      if (typeof window === 'undefined' || !('Summarizer' in window)) {
        error.value = 'Chrome Built-in AI Summarizer is not supported in this browser'
        return false
      }

      // Check model availability
      const availability = await window.Summarizer!.availability()
      
      if (availability === 'unavailable') {
        error.value = 'Summarizer API is not available on this device'
        return false
      }

      if (availability === 'downloading') {
        error.value = 'Summarizer model is currently downloading. Please wait...'
        return false
      }

      if (availability === 'downloadable') {
        error.value = 'Summarizer model needs to be downloaded. Click "Summarize" to start download.'
        // We can still proceed - model will download when user interacts
        isSupported.value = true
        error.value = ''
        return true
      }

      if (availability === 'available') {
        isSupported.value = true
        error.value = ''
        return true
      }

      return false
    } catch (err) {
      error.value = `Failed to check AI support: ${err instanceof Error ? err.message : 'Unknown error'}`
      return false
    }
  }

  // AI Methods using official API
  const summarizeText = async (text: string, options: SummaryOptions): Promise<string> => {
    if (!text.trim()) {
      throw new Error('Please provide text to summarize')
    }

    isLoading.value = true
    error.value = ''

    try {
      if (!window.Summarizer) {
        throw new Error('Summarizer API is not available')
      }

      // Verify user activation (required for downloads)
      if (!navigator.userActivation?.isActive) {
        throw new Error('User interaction required to use Summarizer API')
      }

      // Prepare options for create()
      const createOptions: SummarizerCreateOptions = {
        type: options.type as 'key-points' | 'tldr' | 'teaser' | 'headline',
        format: options.format as 'markdown' | 'plain-text',
        length: options.length as 'short' | 'medium' | 'long',
        monitor: (monitor) => {
          monitor.addEventListener('downloadprogress', (e) => {
            console.log(`Download progress: ${Math.round(e.loaded * 100)}%`)
          })
        }
      }

      if (options.context) {
        createOptions.sharedContext = options.context
      }

      const summarizer = await window.Summarizer.create(createOptions)
      const result = await summarizer.summarize(text)
      
      // Clean up the summarizer object
      summarizer.destroy()
      
      if (!result.trim()) {
        throw new Error('No summary was generated')
      }
      
      return result
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
    isCheckingSupport.value = true
    try {
      await checkSupport()
    } catch (err) {
      console.error('Failed to initialize AI:', err)
    } finally {
      isCheckingSupport.value = false
    }
  })

  return {
    // Reactive state (readonly for protection)
    isSupported: readonly(isSupported),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isCheckingSupport: readonly(isCheckingSupport),
    
    // Methods
    checkSupport,
    summarizeText
  }
}
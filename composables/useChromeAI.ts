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

interface LanguageDetectorResult {
  detectedLanguage: string
  confidence: number
}

interface LanguageDetectorInstance {
  detect(input: string): Promise<LanguageDetectorResult[]>
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
    LanguageDetector?: {
      availability(): Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'>
      create(): Promise<LanguageDetectorInstance>
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

      // Check if we're offline - if so, assume supported (optimistic)
      if (!navigator.onLine) {
        console.warn('Offline mode - assuming AI support available')
        isSupported.value = true
        error.value = ''
        return true
      }

      // Check model availability with timeout
      const availabilityPromise = window.Summarizer!.availability()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout checking AI availability')), 5000)
      })

      const availability = await Promise.race([availabilityPromise, timeoutPromise])
      
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

  // Helper function to detect language using Chrome's Language Detector API
  const detectLanguage = async (text: string): Promise<string> => {
    try {
      // Check if Language Detector API is available
      if (!window.LanguageDetector) {
        console.warn('Language Detector API not available, falling back to English')
        return 'English'
      }

      // If offline, skip API calls and use fallback detection
      if (!navigator.onLine) {
        console.warn('Offline mode - using basic language detection')
        return basicLanguageDetection(text)
      }

      // Check API availability with timeout
      const availabilityPromise = window.LanguageDetector.availability()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout checking Language Detector')), 3000)
      })

      const availability = await Promise.race([availabilityPromise, timeoutPromise])
      if (availability !== 'available' && availability !== 'downloadable') {
        console.warn('Language Detector not available, falling back to English')
        return 'English'
      }

      // Create detector instance with timeout
      const createPromise = window.LanguageDetector.create()
      const createTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout creating Language Detector')), 3000)
      })

      const detector = await Promise.race([createPromise, createTimeoutPromise])
      
      // Detect language - use first 1000 characters for better accuracy
      const sample = text.substring(0, 1000)
      const results = await detector.detect(sample)
      
      // Clean up detector
      detector.destroy()
      
      if (results && results.length > 0) {
        const topResult = results[0]
        // Only use the result if confidence is high enough
        if (topResult && topResult.confidence > 0.5) {
          // Convert language code to full name
          return getLanguageName(topResult.detectedLanguage)
        }
      }
      
      return 'English' // Default fallback
    } catch (error) {
      console.warn('Language detection failed:', error)
      return 'English' // Fallback to English on error
    }
  }

  // Basic language detection fallback for offline mode
  const basicLanguageDetection = (text: string): string => {
    const sample = text.toLowerCase().substring(0, 500)
    
    // Spanish indicators
    if (sample.match(/\b(el|la|los|las|de|del|que|y|en|un|una|es|son|con|por|para|pero|como|más|muy|también|este|esta|estos|estas|todo|todos|toda|todas|si|sí|no|se|le|lo)\b/g)) {
      return 'Spanish'
    }
    
    // French indicators
    if (sample.match(/\b(le|la|les|de|du|des|que|et|en|un|une|est|sont|avec|pour|mais|comme|plus|très|aussi|ce|cette|ces|tout|tous|toute|toutes|si|ne|se|lui)\b/g)) {
      return 'French'
    }
    
    // German indicators
    if (sample.match(/\b(der|die|das|und|oder|ist|sind|mit|für|aber|wie|mehr|sehr|auch|diese|dieser|dieses|alle|wenn|sich|ihm|ihr)\b/g)) {
      return 'German'
    }
    
    // Italian indicators  
    if (sample.match(/\b(il|la|lo|gli|le|di|del|della|che|e|in|un|una|è|sono|con|per|ma|come|più|molto|anche|questo|questa|questi|queste|tutto|tutti|se|si|gli)\b/g)) {
      return 'Italian'
    }
    
    // Portuguese indicators
    if (sample.match(/\b(o|a|os|as|de|do|da|dos|das|que|e|em|um|uma|é|são|com|para|mas|como|mais|muito|também|este|esta|estes|estas|todo|todos|se|lhe|não)\b/g)) {
      return 'Portuguese'
    }
    
    // Default to English
    return 'English'
  }

  // Helper function to convert language codes to full names
  const getLanguageName = (languageCode: string): string => {
    const languageMap: Record<string, string> = {
      'es': 'Spanish',
      'en': 'English', 
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ca': 'Catalan',
      'eu': 'Basque',
      'gl': 'Galician',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ru': 'Russian',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'no': 'Norwegian',
      'da': 'Danish',
      'fi': 'Finnish',
      'pl': 'Polish',
      'cs': 'Czech',
      'hu': 'Hungarian',
      'ro': 'Romanian',
      'bg': 'Bulgarian',
      'hr': 'Croatian',
      'sk': 'Slovak',
      'sl': 'Slovenian',
      'et': 'Estonian',
      'lv': 'Latvian',
      'lt': 'Lithuanian',
      'mt': 'Maltese',
      'tr': 'Turkish',
      'el': 'Greek',
      'he': 'Hebrew',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'id': 'Indonesian',
      'ms': 'Malay',
      'tl': 'Filipino',
      'sw': 'Swahili',
      'am': 'Amharic',
      'bn': 'Bengali',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'mr': 'Marathi',
      'ne': 'Nepali',
      'pa': 'Punjabi',
      'si': 'Sinhala',
      'ta': 'Tamil',
      'te': 'Telugu',
      'ur': 'Urdu'
    }
    
    return languageMap[languageCode] || 'English'
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

      // Detect the language of the input text
      const detectedLanguage = await detectLanguage(text)
      
      // Create language-specific context
      let languageContext = `Please provide the summary in ${detectedLanguage}.`
      
      // Add specific instructions for different languages
      switch (detectedLanguage) {
        case 'Spanish':
          languageContext += ' Responde en español, manteniendo un lenguaje claro y natural.'
          break
        case 'French':
          languageContext += ' Répondez en français, en maintenant un langage clair et naturel.'
          break
        case 'German':
          languageContext += ' Antworten Sie auf Deutsch und verwenden Sie eine klare und natürliche Sprache.'
          break
        case 'Italian':
          languageContext += ' Rispondi in italiano, mantenendo un linguaggio chiaro e naturale.'
          break
        case 'Portuguese':
          languageContext += ' Responda em português, mantendo uma linguagem clara e natural.'
          break
        default:
          languageContext += ' Respond in English, maintaining clear and natural language.'
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

      // Combine user context with language context
      if (options.context) {
        createOptions.sharedContext = `${languageContext} ${options.context}`
      } else {
        createOptions.sharedContext = languageContext
      }

      // Create summarizer with timeout
      const createPromise = window.Summarizer.create(createOptions)
      const createTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout creating summarizer')), 10000)
      })

      const summarizer = await Promise.race([createPromise, createTimeoutPromise])
      
      // Summarize with timeout
      const summarizePromise = summarizer.summarize(text)
      const summarizeTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Summarization timeout - text may be too long')), 30000)
      })

      const result = await Promise.race([summarizePromise, summarizeTimeoutPromise])
      
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
      // Add timeout to prevent hanging
      const checkPromise = checkSupport()
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.warn('AI support check timed out, assuming available')
          isSupported.value = !navigator.onLine // Assume available if offline
          resolve(!navigator.onLine)
        }, 8000) // 8 second timeout
      })

      await Promise.race([checkPromise, timeoutPromise])
    } catch (err) {
      console.error('Failed to initialize AI:', err)
      // Don't leave hanging - set some default state
      isSupported.value = !navigator.onLine
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
import { ref, readonly, onMounted } from 'vue'
import type { StoredAnalysis } from '../types/storage'

export const useOfflineStorage = () => {
  const isStorageAvailable = ref(true)
  const storedAnalyses = ref<StoredAnalysis[]>([])

  // Check if storage is available
  const checkStorageAvailability = (): boolean => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false
    }
    
    try {
      const test = 'test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      console.warn('Local storage not available:', e)
      return false
    }
  }

  // Generate unique ID for each analysis
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Save analysis to local storage
  const saveAnalysis = (inputText: string, summary: string, options: { type: string, format: string, length: string }): string => {
    if (!isStorageAvailable.value || typeof window === 'undefined') {
      throw new Error('Storage not available')
    }

    const id = generateId()
    const analysis: StoredAnalysis = {
      id,
      timestamp: Date.now(),
      inputText: inputText.substring(0, 1000), // Store first 1000 chars for preview
      summary,
      options
    }

    try {
      // Get existing analyses
      const existing = getStoredAnalyses()
      
      // Add new analysis at the beginning
      existing.unshift(analysis)
      
      // Keep only last 10 analyses to avoid storage limits
      const limited = existing.slice(0, 10)
      
      // Save back to storage
      localStorage.setItem('docuprism-analyses', JSON.stringify(limited))
      
      // Update reactive state
      storedAnalyses.value = limited
      
      return id
    } catch (error) {
      console.error('Failed to save analysis:', error)
      throw new Error('Failed to save analysis offline')
    }
  }

  // Get all stored analyses
  const getStoredAnalyses = (): StoredAnalysis[] => {
    if (!isStorageAvailable.value || typeof window === 'undefined') {
      return []
    }

    try {
      const stored = localStorage.getItem('docuprism-analyses')
      if (stored) {
        const analyses = JSON.parse(stored) as StoredAnalysis[]
        storedAnalyses.value = analyses
        return analyses
      }
      return []
    } catch (error) {
      console.error('Failed to load stored analyses:', error)
      return []
    }
  }

  // Get specific analysis by ID
  const getAnalysisById = (id: string): StoredAnalysis | null => {
    const analyses = getStoredAnalyses()
    return analyses.find(analysis => analysis.id === id) || null
  }

  // Delete analysis by ID
  const deleteAnalysis = (id: string): boolean => {
    if (!isStorageAvailable.value || typeof window === 'undefined') {
      return false
    }

    try {
      const analyses = getStoredAnalyses()
      const filtered = analyses.filter(analysis => analysis.id !== id)
      
      localStorage.setItem('docuprism-analyses', JSON.stringify(filtered))
      storedAnalyses.value = filtered
      
      return true
    } catch (error) {
      console.error('Failed to delete analysis:', error)
      return false
    }
  }

  // Clear all stored analyses
  const clearAllAnalyses = (): boolean => {
    if (!isStorageAvailable.value || typeof window === 'undefined') {
      return false
    }

    try {
      localStorage.removeItem('docuprism-analyses')
      storedAnalyses.value = []
      return true
    } catch (error) {
      console.error('Failed to clear analyses:', error)
      return false
    }
  }

  // Get storage usage information
  const getStorageInfo = () => {
    if (!isStorageAvailable.value || typeof window === 'undefined') {
      return { used: 0, available: 0, percentage: 0 }
    }

    try {
      // Estimate storage usage
      const stored = localStorage.getItem('docuprism-analyses') || ''
      const used = new Blob([stored]).size
      
      // Most browsers allow ~5-10MB for localStorage
      const estimated = 5 * 1024 * 1024 // 5MB estimate
      const percentage = (used / estimated) * 100

      return {
        used,
        available: estimated,
        percentage: Math.min(percentage, 100)
      }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return { used: 0, available: 0, percentage: 0 }
    }
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes} minutes ago`
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} hours ago`
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Initialize storage check (only on client side)
  onMounted(() => {
    isStorageAvailable.value = checkStorageAvailability()
    
    // Load existing analyses on initialization
    if (isStorageAvailable.value) {
      getStoredAnalyses()
    }
  })

  return {
    // Reactive state (readonly for protection)
    isStorageAvailable: readonly(isStorageAvailable),
    storedAnalyses: readonly(storedAnalyses),
    
    // Methods
    saveAnalysis,
    getStoredAnalyses,
    getAnalysisById,
    deleteAnalysis,
    clearAllAnalyses,
    getStorageInfo,
    formatTimestamp
  }
}
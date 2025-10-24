import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useOfflineStorage } from '../../composables/useOfflineStorage'

describe('useOfflineStorage', () => {
  let storageInstance: ReturnType<typeof useOfflineStorage>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    
    // Create wrapper with composable
    let composableResult: ReturnType<typeof useOfflineStorage>
    
    const TestComponent = defineComponent({
      setup() {
        composableResult = useOfflineStorage()
        return () => h('div')
      }
    })
    
    wrapper = mount(TestComponent)
    storageInstance = composableResult!
    // Clear any existing analyses
    storageInstance.clearAllAnalyses()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should check storage availability', () => {
    expect(storageInstance.isStorageAvailable.value).toBe(true)
  })

  it('should save analysis', () => {
    const { saveAnalysis, getStoredAnalyses } = storageInstance
    
    const inputText = 'Test document text'
    const summary = 'Test summary'
    const options = {
      type: 'tldr',
      format: 'plain-text',
      length: 'medium'
    }
    
    saveAnalysis(inputText, summary, options)
    
    const analyses = getStoredAnalyses()
    expect(analyses).toHaveLength(1)
    expect(analyses[0]!.inputText).toBe(inputText)
    expect(analyses[0]!.summary).toBe(summary)
    expect(analyses[0]!.options.type).toBe('tldr')
  })

  it('should get stored analyses', () => {
    const { saveAnalysis, getStoredAnalyses } = storageInstance
    
    // Save multiple analyses
    saveAnalysis('Text 1', 'Summary 1', { type: 'tldr', format: 'plain-text', length: 'short' })
    saveAnalysis('Text 2', 'Summary 2', { type: 'key-points', format: 'markdown', length: 'long' })
    
    const analyses = getStoredAnalyses()
    expect(analyses).toHaveLength(2)
    expect(analyses[0]!.inputText).toBe('Text 2') // Most recent first
    expect(analyses[1]!.inputText).toBe('Text 1')
  })

  it('should delete analysis', () => {
    const { saveAnalysis, getStoredAnalyses, deleteAnalysis } = storageInstance
    
    saveAnalysis('Text 1', 'Summary 1', { type: 'tldr', format: 'plain-text', length: 'short' })
    saveAnalysis('Text 2', 'Summary 2', { type: 'tldr', format: 'plain-text', length: 'short' })
    
    const analyses = getStoredAnalyses()
    const idToDelete = analyses[0]!.id
    
    deleteAnalysis(idToDelete)
    
    const updatedAnalyses = getStoredAnalyses()
    expect(updatedAnalyses).toHaveLength(1)
    expect(updatedAnalyses[0]!.id).not.toBe(idToDelete)
  })

  it('should clear all analyses', () => {
    const { saveAnalysis, getStoredAnalyses, clearAllAnalyses } = storageInstance
    
    saveAnalysis('Text 1', 'Summary 1', { type: 'tldr', format: 'plain-text', length: 'short' })
    saveAnalysis('Text 2', 'Summary 2', { type: 'tldr', format: 'plain-text', length: 'short' })
    
    clearAllAnalyses()
    
    const analyses = getStoredAnalyses()
    expect(analyses).toHaveLength(0)
  })

  it('should limit stored analyses to max', () => {
    const { saveAnalysis, getStoredAnalyses } = storageInstance
    
    // Save more than max (10)
    for (let i = 0; i < 15; i++) {
      saveAnalysis(`Text ${i}`, `Summary ${i}`, { type: 'tldr', format: 'plain-text', length: 'short' })
    }
    
    const analyses = getStoredAnalyses()
    expect(analyses.length).toBeLessThanOrEqual(10)
  })

  it('should get storage info', () => {
    const { saveAnalysis, getStorageInfo } = storageInstance
    
    const initialInfo = getStorageInfo()
    
    saveAnalysis('Test text', 'Test summary', { type: 'tldr', format: 'plain-text', length: 'short' })
    
    const newInfo = getStorageInfo()
    expect(newInfo.used).toBeGreaterThan(initialInfo.used)
  })

  it('should handle storage errors gracefully', () => {
    const { saveAnalysis } = storageInstance
    
    // Mock localStorage.setItem to throw error
    const originalSetItem = localStorage.setItem
    localStorage.setItem = vi.fn(() => {
      throw new Error('Storage quota exceeded')
    })
    
    expect(() => {
      saveAnalysis('Text', 'Summary', { type: 'tldr', format: 'plain-text', length: 'short' })
    }).toThrow()
    
    // Restore original
    localStorage.setItem = originalSetItem
  })
})

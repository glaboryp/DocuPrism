/**
 * Summary Cache Composable
 * Provides caching for AI-generated summaries to avoid reprocessing
 */

import { ref } from 'vue'

interface CachedSummary {
  summary: string
  timestamp: number
  options: SummaryOptions
}

interface SummaryOptions {
  type: string
  format: string
  length: string
  context?: string
}

// In-memory cache with Map for O(1) lookups
const cache = ref(new Map<string, CachedSummary>())

// Cache configuration
const CACHE_MAX_SIZE = 50 // Maximum number of cached summaries
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours in milliseconds

/**
 * Simple hash function for strings
 * Uses a basic hash algorithm for cache keys
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(36)
}

/**
 * Generate cache key from text and options
 * Uses first 1000 chars of text + stringified options
 */
function getCacheKey(text: string, options: SummaryOptions): string {
  // Use first 1000 chars to avoid huge keys while maintaining uniqueness
  const textSample = text.substring(0, 1000)
  const textHash = hashString(textSample)
  const optionsStr = JSON.stringify({
    type: options.type,
    format: options.format,
    length: options.length,
    context: options.context || ''
  })
  return `${textHash}-${hashString(optionsStr)}`
}

/**
 * Check if cached entry is still valid (not expired)
 */
function isValidCache(cached: CachedSummary): boolean {
  const now = Date.now()
  return (now - cached.timestamp) < CACHE_TTL
}

/**
 * Evict oldest entries when cache is full
 * Removes entries until cache size is below max
 */
function evictOldest(): void {
  while (cache.value.size >= CACHE_MAX_SIZE) {
    // Find oldest entry
    let oldestKey: string | null = null
    let oldestTime = Infinity
    
    cache.value.forEach((value, key) => {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp
        oldestKey = key
      }
    })
    
    if (oldestKey) {
      cache.value.delete(oldestKey)
    } else {
      break // Safety: avoid infinite loop
    }
  }
}

export const useSummaryCache = () => {
  /**
   * Get cached summary if available and valid
   */
  const getCached = (text: string, options: SummaryOptions): string | null => {
    const key = getCacheKey(text, options)
    const cached = cache.value.get(key)
    
    if (!cached) {
      return null
    }
    
    // Check if cache is still valid
    if (!isValidCache(cached)) {
      cache.value.delete(key)
      return null
    }
    
    return cached.summary
  }
  
  /**
   * Store summary in cache
   */
  const setCached = (text: string, options: SummaryOptions, summary: string): void => {
    // Evict oldest if cache is full
    evictOldest()
    
    const key = getCacheKey(text, options)
    const cached: CachedSummary = {
      summary,
      timestamp: Date.now(),
      options: { ...options }
    }
    
    cache.value.set(key, cached)
  }
  
  /**
   * Check if summary is cached
   */
  const hasCached = (text: string, options: SummaryOptions): boolean => {
    const key = getCacheKey(text, options)
    const cached = cache.value.get(key)
    return cached ? isValidCache(cached) : false
  }
  
  /**
   * Clear all cached summaries
   */
  const clearCache = (): void => {
    cache.value.clear()
  }
  
  /**
   * Clear expired entries
   */
  const clearExpired = (): void => {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    cache.value.forEach((value, key) => {
      if ((now - value.timestamp) >= CACHE_TTL) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => cache.value.delete(key))
  }
  
  /**
   * Get cache statistics
   */
  const getCacheStats = () => {
    return {
      size: cache.value.size,
      maxSize: CACHE_MAX_SIZE,
      ttl: CACHE_TTL,
      percentage: Math.round((cache.value.size / CACHE_MAX_SIZE) * 100)
    }
  }
  
  return {
    getCached,
    setCached,
    hasCached,
    clearCache,
    clearExpired,
    getCacheStats
  }
}

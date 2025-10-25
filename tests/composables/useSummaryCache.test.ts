import { describe, it, expect, beforeEach } from 'vitest'
import { useSummaryCache } from '../../composables/useSummaryCache'

describe('useSummaryCache', () => {
  let cache: ReturnType<typeof useSummaryCache>

  beforeEach(() => {
    cache = useSummaryCache()
    cache.clearCache()
  })

  it('should return null for non-existent cache', () => {
    const result = cache.getCached('test text', {
      type: 'tldr',
      format: 'markdown',
      length: 'medium'
    })
    expect(result).toBeNull()
  })

  it('should cache and retrieve summaries', () => {
    const text = 'This is a test document'
    const options = {
      type: 'tldr',
      format: 'markdown',
      length: 'medium'
    }
    const summary = 'This is a summary'

    cache.setCached(text, options, summary)
    const retrieved = cache.getCached(text, options)

    expect(retrieved).toBe(summary)
  })

  it('should return different cache for different options', () => {
    const text = 'Same text'
    const summary1 = 'Summary 1'
    const summary2 = 'Summary 2'

    cache.setCached(text, { type: 'tldr', format: 'markdown', length: 'short' }, summary1)
    cache.setCached(text, { type: 'key-points', format: 'markdown', length: 'short' }, summary2)

    const retrieved1 = cache.getCached(text, { type: 'tldr', format: 'markdown', length: 'short' })
    const retrieved2 = cache.getCached(text, { type: 'key-points', format: 'markdown', length: 'short' })

    expect(retrieved1).toBe(summary1)
    expect(retrieved2).toBe(summary2)
  })

  it('should check if summary is cached', () => {
    const text = 'Test'
    const options = { type: 'tldr', format: 'markdown', length: 'medium' }

    expect(cache.hasCached(text, options)).toBe(false)

    cache.setCached(text, options, 'Summary')

    expect(cache.hasCached(text, options)).toBe(true)
  })

  it('should clear all cache', () => {
    cache.setCached('text1', { type: 'tldr', format: 'markdown', length: 'short' }, 'summary1')
    cache.setCached('text2', { type: 'tldr', format: 'markdown', length: 'short' }, 'summary2')

    const stats = cache.getCacheStats()
    expect(stats.size).toBe(2)

    cache.clearCache()

    const statsAfter = cache.getCacheStats()
    expect(statsAfter.size).toBe(0)
  })

  it('should provide cache statistics', () => {
    const stats = cache.getCacheStats()

    expect(stats).toHaveProperty('size')
    expect(stats).toHaveProperty('maxSize')
    expect(stats).toHaveProperty('ttl')
    expect(stats).toHaveProperty('percentage')
    expect(stats.size).toBe(0)
    expect(stats.maxSize).toBe(50)
  })

  it('should calculate cache percentage correctly', () => {
    // Add 10 items
    for (let i = 0; i < 10; i++) {
      cache.setCached(`text${i}`, { type: 'tldr', format: 'markdown', length: 'short' }, `summary${i}`)
    }

    const stats = cache.getCacheStats()
    expect(stats.size).toBe(10)
    expect(stats.percentage).toBe(20) // 10/50 = 20%
  })

  it('should evict oldest entries when cache is full', () => {
    // Fill cache to max (50 items)
    for (let i = 0; i < 51; i++) {
      cache.setCached(`text${i}`, { type: 'tldr', format: 'markdown', length: 'short' }, `summary${i}`)
    }

    const stats = cache.getCacheStats()
    expect(stats.size).toBe(50) // Should not exceed max size
  })

  it('should use same cache key for same text and options', () => {
    const text = 'Same text'
    const options = { type: 'tldr', format: 'markdown', length: 'medium' }

    cache.setCached(text, options, 'First summary')
    cache.setCached(text, options, 'Second summary') // Should overwrite

    const retrieved = cache.getCached(text, options)
    expect(retrieved).toBe('Second summary')

    const stats = cache.getCacheStats()
    expect(stats.size).toBe(1) // Should only have one entry
  })

  it('should handle context in options', () => {
    const text = 'Test'
    const options1 = { type: 'tldr', format: 'markdown', length: 'short', context: 'Context 1' }
    const options2 = { type: 'tldr', format: 'markdown', length: 'short', context: 'Context 2' }

    cache.setCached(text, options1, 'Summary 1')
    cache.setCached(text, options2, 'Summary 2')

    expect(cache.getCached(text, options1)).toBe('Summary 1')
    expect(cache.getCached(text, options2)).toBe('Summary 2')
  })
})

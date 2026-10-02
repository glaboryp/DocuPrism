import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useChromeAI } from '../../composables/useChromeAI'
import { ErrorCode } from '../../utils/errorHandler'

const options = { type: 'tldr', format: 'markdown', length: 'medium' }

describe('useChromeAI summarizeText', () => {
  let ai: ReturnType<typeof useChromeAI>

  beforeEach(() => {
    ai = useChromeAI()
    ai.clearCache()
  })

  it('rejects with AI_CANCELLED and destroys the summarizer when cancelled mid-summary', async () => {
    const destroy = vi.fn()
    vi.mocked(window.Summarizer!.create).mockResolvedValueOnce({
      summarize: vi.fn(() => new Promise<string>(() => {})),
      summarizeStreaming: vi.fn(),
      destroy
    })

    const pending = ai.summarizeText('Some text to summarize', options)
    await vi.waitFor(() => expect(window.Summarizer!.create).toHaveBeenCalled())
    await new Promise(resolve => setTimeout(resolve, 0))
    ai.cancelSummarize()

    await expect(pending).rejects.toMatchObject({ code: ErrorCode.AI_CANCELLED })
    expect(destroy).toHaveBeenCalled()
    expect(ai.isLoading.value).toBe(false)
    expect(ai.error.value).toBe('')
  })

  it('returns the summary and destroys the summarizer on success', async () => {
    const destroy = vi.fn()
    vi.mocked(window.Summarizer!.create).mockResolvedValueOnce({
      summarize: vi.fn().mockResolvedValue('A summary'),
      summarizeStreaming: vi.fn(),
      destroy
    })

    await expect(ai.summarizeText('Another text to summarize', options)).resolves.toBe('A summary')
    expect(destroy).toHaveBeenCalled()
  })
})

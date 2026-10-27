import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useChromeAI } from '../../composables/useChromeAI'
import { ErrorCode } from '../../utils/errorHandler'

const options = { type: 'tldr', format: 'markdown', length: 'medium' }

const setBrowser = (brands: string[] | null, brave = false) => {
  if (brands) {
    Object.defineProperty(navigator, 'userAgentData', {
      value: { brands: brands.map(brand => ({ brand })) },
      configurable: true
    })
  } else {
    delete (navigator as unknown as { userAgentData?: unknown }).userAgentData
  }

  if (brave) {
    Object.defineProperty(navigator, 'brave', {
      value: { isBrave: async () => true },
      configurable: true
    })
  } else {
    delete (navigator as unknown as { brave?: unknown }).brave
  }
}

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

describe('useChromeAI checkSupport', () => {
  let ai: ReturnType<typeof useChromeAI>

  beforeEach(() => {
    ai = useChromeAI()
    vi.mocked(window.Summarizer!.availability).mockResolvedValue('available')
  })

  afterEach(() => {
    setBrowser(null)
    vi.restoreAllMocks()
  })

  it('does not trust a Summarizer object in Brave, which ships no model', async () => {
    setBrowser(['Chromium', 'Google Chrome'], true)

    await expect(ai.checkSupport()).resolves.toBe(false)
    expect(ai.isSupported.value).toBe(false)
    expect(ai.error.value).not.toBe('')
  })

  it('reports ready in Chrome when the model is available', async () => {
    setBrowser(['Chromium', 'Google Chrome'])

    await expect(ai.checkSupport()).resolves.toBe(true)
    expect(ai.isSupported.value).toBe(true)
    expect(ai.error.value).toBe('')
  })

  it('does not assume a model when the availability check fails', async () => {
    setBrowser(['Chromium', 'Google Chrome'])
    vi.mocked(window.Summarizer!.availability).mockRejectedValueOnce(new Error('NotSupportedError'))

    await expect(ai.checkSupport()).resolves.toBe(false)
    expect(ai.isSupported.value).toBe(false)
    expect(ai.error.value).toMatch(/failed/i)
  })

  it('treats an unavailable model as unsupported even in Chrome', async () => {
    setBrowser(['Chromium', 'Google Chrome'])
    vi.mocked(window.Summarizer!.availability).mockResolvedValueOnce('unavailable')

    await expect(ai.checkSupport()).resolves.toBe(false)
    expect(ai.isSupported.value).toBe(false)
  })
})

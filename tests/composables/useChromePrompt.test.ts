import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useChromePrompt } from '../../composables/useChromePrompt'

describe('useChromePrompt', () => {
  const availability = vi.fn()
  const create = vi.fn()

  beforeEach(() => {
    availability.mockResolvedValue('available')
    create.mockResolvedValue({
      prompt: vi.fn(),
      promptStreaming: vi.fn(),
      countPromptTokens: vi.fn(),
      destroy: vi.fn()
    })

    Object.defineProperty(window, 'LanguageModel', {
      value: { availability, create },
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).LanguageModel
    vi.clearAllMocks()
  })

  it('creates the session with greedy sampling instead of legacy temperature/topK', async () => {
    const prompt = useChromePrompt()

    await expect(prompt.createSession('Some document text')).resolves.toBe(true)

    expect(create).toHaveBeenCalledWith({ samplingMode: 'most-predictable' })
    const options = create.mock.calls[0]?.[0] ?? {}
    expect(options).not.toHaveProperty('temperature')
    expect(options).not.toHaveProperty('topK')
  })

  it('checks support with availability() instead of the legacy capabilities()', async () => {
    const prompt = useChromePrompt()

    await expect(prompt.checkSupport()).resolves.toBe(true)
    expect(availability).toHaveBeenCalledWith({ samplingMode: 'most-predictable' })
  })

  it('reports no support when availability() returns "unavailable"', async () => {
    availability.mockResolvedValueOnce('unavailable')
    const prompt = useChromePrompt()

    await expect(prompt.checkSupport()).resolves.toBe(false)
    expect(prompt.error.value).toBe('Prompt API not available on this device')
  })
})

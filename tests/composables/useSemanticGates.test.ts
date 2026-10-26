import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSemanticGates } from '../../composables/useSemanticGates'

const PROSE = 'The quick brown fox jumps over the lazy dog. This sentence is ordinary English prose that a summarizer can handle without trouble.'
const NUMERIC_DUMP = '1 2 3 4 5 6 7 8 9 10 11 12 { } [ ] ; ;'

describe('useSemanticGates', () => {
  const create = vi.fn()
  const decide = vi.fn()
  const destroy = vi.fn()

  const installDecisionModel = () => {
    Object.defineProperty(window, 'DecisionModel', {
      value: { create },
      writable: true,
      configurable: true
    })
  }

  beforeEach(() => {
    create.mockResolvedValue({ decide, destroy })
    decide.mockResolvedValue({
      is_substantive_text: { label: 'true', confidence: 0.95 },
      is_garbled_extraction: { label: 'false', confidence: 0.95 }
    })
  })

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).DecisionModel
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('falls back to heuristics when the Decisions API is missing', async () => {
    const { assessDocumentQuality } = useSemanticGates()

    const quality = await assessDocumentQuality(NUMERIC_DUMP)

    expect(quality.issues).toContain('low-prose-ratio')
    expect(create).not.toHaveBeenCalled()
  })

  it('adds Decisions API verdicts on top of the local metrics', async () => {
    installDecisionModel()
    decide.mockResolvedValue({
      is_substantive_text: { label: 'false', confidence: 0.9 },
      is_garbled_extraction: { label: 'true', confidence: 0.9 }
    })
    const { assessDocumentQuality } = useSemanticGates()

    const quality = await assessDocumentQuality(PROSE)

    expect(quality.usable).toBe(false)
    expect(quality.issues).toEqual(expect.arrayContaining(['low-prose-ratio', 'garbled-characters']))
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ questions: expect.any(Array) }))
    expect(destroy).toHaveBeenCalled()
  })

  it('ignores model answers below the confidence threshold', async () => {
    installDecisionModel()
    decide.mockResolvedValue({
      is_substantive_text: { label: 'false', confidence: 0.5 },
      is_garbled_extraction: { label: 'true', confidence: 0.5 }
    })
    const { assessDocumentQuality } = useSemanticGates()

    const quality = await assessDocumentQuality(PROSE)

    expect(quality.usable).toBe(true)
  })

  it('keeps the heuristic result when DecisionModel.create fails', async () => {
    installDecisionModel()
    create.mockRejectedValueOnce(new Error('experimental API changed'))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { assessDocumentQuality } = useSemanticGates()

    await expect(assessDocumentQuality(PROSE)).resolves.toMatchObject({ usable: true })
  })

  it('does not call the model when a local credential match already exists', async () => {
    installDecisionModel()
    const { scanSensitiveData } = useSemanticGates()

    const findings = await scanSensitiveData('Write to jane.doe@example.com')

    expect(findings[0]?.kind).toBe('email')
    expect(create).not.toHaveBeenCalled()
  })

  it('reports generic personal data when only the model flags the text', async () => {
    installDecisionModel()
    decide.mockResolvedValue({
      contains_sensitive_data: { label: 'true', confidence: 0.9 }
    })
    const { scanSensitiveData } = useSemanticGates()

    const findings = await scanSensitiveData(PROSE)

    expect(findings).toHaveLength(1)
    expect(findings[0]?.kind).toBe('personal-data')
  })

  it('returns no findings when the model and the heuristics agree the text is clean', async () => {
    installDecisionModel()
    decide.mockResolvedValue({
      contains_sensitive_data: { label: 'false', confidence: 0.9 }
    })
    const { scanSensitiveData } = useSemanticGates()

    await expect(scanSensitiveData(PROSE)).resolves.toEqual([])
  })
})

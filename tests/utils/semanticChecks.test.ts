import { describe, it, expect } from 'vitest'
import {
  analyzeDocumentQuality,
  describeQualityIssues,
  detectSensitiveData,
  groupSensitiveFindings,
  needsDocumentContext
} from '../../utils/semanticChecks'

const PROSE = 'The quick brown fox jumps over the lazy dog. This sentence is ordinary English prose that a summarizer can handle without trouble.'

describe('analyzeDocumentQuality', () => {
  it('accepts normal prose', () => {
    const quality = analyzeDocumentQuality(PROSE)

    expect(quality.usable).toBe(true)
    expect(quality.issues).toEqual([])
  })

  it('flags a text that is too short to summarize', () => {
    expect(analyzeDocumentQuality('Too short').issues).toContain('too-short')
  })

  it('flags garbled extraction characters', () => {
    const quality = analyzeDocumentQuality('\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD \uFFFD\uFFFD\uFFFD\uFFFD\uFFFD')

    expect(quality.issues).toContain('garbled-characters')
    expect(quality.usable).toBe(false)
  })

  it('flags numeric or code dumps as low prose ratio', () => {
    const quality = analyzeDocumentQuality('1 2 3 4 5 6 7 8 9 10 11 12 { } [ ] ; ;')

    expect(quality.issues).toContain('low-prose-ratio')
  })

  it('flags placeholder repetition', () => {
    const quality = analyzeDocumentQuality('foo bar '.repeat(60))

    expect(quality.issues).toContain('repetitive-text')
  })

  it('describes the most severe issue first', () => {
    expect(describeQualityIssues(['too-short', 'garbled-characters'])).toMatch(/garbled/)
    expect(describeQualityIssues(['too-short'])).toMatch(/very short/)
  })
})

describe('detectSensitiveData', () => {
  it('finds email addresses and redacts them', () => {
    const findings = detectSensitiveData('Contact me at jane.doe@example.com please')

    expect(findings).toHaveLength(1)
    expect(findings[0]?.kind).toBe('email')
    expect(findings[0]?.preview).toBe('j***@example.com')
    expect(findings[0]?.preview).not.toContain('jane.doe')
  })

  it('finds API keys without leaking the secret', () => {
    const findings = detectSensitiveData('token sk-abcdefghijklmnop1234 end')

    expect(findings[0]?.kind).toBe('api-key')
    expect(findings[0]?.preview).not.toContain('abcdefghijklmnop')
  })

  it('never returns a password value', () => {
    const findings = detectSensitiveData('password: hunter2')

    expect(findings[0]?.kind).toBe('password')
    expect(JSON.stringify(findings)).not.toContain('hunter2')
  })

  it('validates card numbers with Luhn before reporting them', () => {
    expect(detectSensitiveData('4111 1111 1111 1111').map(f => f.kind)).toContain('credit-card')
    expect(detectSensitiveData('4111 1111 1111 1112')).toHaveLength(0)
  })

  it('reports private key blocks', () => {
    const findings = detectSensitiveData('-----BEGIN RSA PRIVATE KEY-----\nabc\n-----END RSA PRIVATE KEY-----')

    expect(findings[0]?.kind).toBe('private-key')
  })

  it('groups findings by kind', () => {
    const groups = groupSensitiveFindings(detectSensitiveData('a@b.com c@d.com'))

    expect(groups).toHaveLength(1)
    expect(groups[0]?.kind).toBe('email')
    expect(groups[0]?.previews).toHaveLength(2)
  })
})

describe('needsDocumentContext', () => {
  it('skips context for obvious small talk', () => {
    expect(needsDocumentContext('hi')).toBe(false)
    expect(needsDocumentContext('Thanks!')).toBe(false)
    expect(needsDocumentContext('hola')).toBe(false)
    expect(needsDocumentContext('ok')).toBe(false)
  })

  it('keeps context when the message references the document', () => {
    expect(needsDocumentContext('¿De qué trata el documento?')).toBe(true)
    expect(needsDocumentContext('gracias, ¿y el segundo párrafo?')).toBe(true)
    expect(needsDocumentContext('summary please')).toBe(true)
  })

  it('keeps context for anything that is not a bare greeting', () => {
    expect(needsDocumentContext('What does it say about revenue?')).toBe(true)
    expect(needsDocumentContext('hello there, can you summarize this?')).toBe(true)
    expect(needsDocumentContext('')).toBe(true)
  })
})

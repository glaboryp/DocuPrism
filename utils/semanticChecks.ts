/**
 * Local semantic checks
 *
 * Small, dependency-free heuristics that answer the questions a Decisions API
 * ("Semantic If") would answer, so they work on any device that can run the
 * Summarizer. `composables/useSemanticGates.ts` layers the Decisions API on top
 * when the browser exposes it.
 */

/** Only the first 20k characters are analysed: enough signal, bounded cost */
const SAMPLE_LIMIT = 20000

const MAX_FINDINGS = 20

export type DocumentIssue =
  | 'too-short'
  | 'low-prose-ratio'
  | 'garbled-characters'
  | 'repetitive-text'

export interface DocumentMetrics {
  chars: number
  words: number
  lettersRatio: number
  averageWordLength: number
  uniqueWordRatio: number
  replacementChars: number
}

export interface DocumentQuality {
  usable: boolean
  issues: DocumentIssue[]
  metrics: DocumentMetrics
}

const sampleText = (text: string): string =>
  text.length > SAMPLE_LIMIT ? text.slice(0, SAMPLE_LIMIT) : text

const countMatches = (text: string, pattern: RegExp): number =>
  text.match(pattern)?.length ?? 0

/**
 * Flags texts that will produce a useless summary: empty extractions, scanned
 * PDFs without OCR, code or table dumps, and placeholder repetition.
 */
export function analyzeDocumentQuality(text: string): DocumentQuality {
  const sample = sampleText(text).trim()
  const tokens = sample.split(/\s+/).filter(Boolean)
  const compactLength = sample.replace(/\s/g, '').length
  const letters = countMatches(sample, /\p{L}/gu)
  const replacementChars = countMatches(sample, /\uFFFD/gu)
  const uniqueWords = new Set(tokens.map(token => token.toLowerCase())).size

  const metrics: DocumentMetrics = {
    chars: text.length,
    words: tokens.length,
    lettersRatio: compactLength > 0 ? letters / compactLength : 0,
    averageWordLength: tokens.length > 0
      ? tokens.reduce((sum, token) => sum + token.length, 0) / tokens.length
      : 0,
    uniqueWordRatio: tokens.length > 0 ? uniqueWords / tokens.length : 0,
    replacementChars
  }

  const issues: DocumentIssue[] = []

  if (tokens.length < 5) issues.push('too-short')

  // Prose is overwhelmingly letters. Code, tables and failed OCR are not.
  if (compactLength > 0 && metrics.lettersRatio < 0.45) issues.push('low-prose-ratio')

  // U+FFFD is what a decoder emits when it cannot map the source bytes.
  if (replacementChars > 5 || (compactLength > 0 && replacementChars / compactLength > 0.01)) {
    issues.push('garbled-characters')
  }

  if (tokens.length >= 50 && metrics.uniqueWordRatio < 0.15) issues.push('repetitive-text')

  return {
    usable: issues.length === 0,
    issues,
    metrics
  }
}

/**
 * Human-readable explanation of a quality check, used by the UI banner and the
 * toast shown before summarizing.
 */
export function describeQualityIssues(issues: DocumentIssue[]): string {
  if (issues.includes('garbled-characters')) {
    return 'The text contains garbled characters. This usually means the PDF or scan could not be extracted as text.'
  }
  if (issues.includes('low-prose-ratio')) {
    return 'This looks like code, a table dump or a broken extraction rather than prose, so a summary may not be meaningful.'
  }
  if (issues.includes('repetitive-text')) {
    return 'The text repeats itself a lot. It may be placeholder or corrupted content.'
  }
  return 'The text is very short, so there is not much for the summary to work with.'
}

export type SensitiveKind =
  | 'email'
  | 'api-key'
  | 'private-key'
  | 'password'
  | 'credit-card'
  | 'personal-data'

export interface SensitiveFinding {
  kind: SensitiveKind
  /** Offset of the match in the analysed text */
  index: number
  /** Redacted representation, safe to render and log */
  preview: string
}

const EMAIL_PATTERN = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu
const PRIVATE_KEY_PATTERN = /-----BEGIN [A-Z ]*PRIVATE KEY-----/gu
const API_KEY_PATTERN = /\b(?:sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}|xox[baprs]-[0-9A-Za-z-]{10,})\b/gu
const PASSWORD_PATTERN = /(?:password|passwd|pwd|contraseña|clave)\s*[:=]\s*["']?([^\s"']{3,})/giu
const CARD_PATTERN = /(?:\d[ -]?){12,18}\d/g

const redactEmail = (email: string): string => {
  const atIndex = email.indexOf('@')
  if (atIndex <= 0) return '***'
  return `${email.charAt(0)}***${email.slice(atIndex)}`
}

const redactToken = (token: string): string => {
  if (token.length <= 8) return '••••'
  return `${token.slice(0, 4)}…${token.slice(-4)}`
}

const passesLuhn = (digits: string): boolean => {
  let sum = 0
  let double = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let value = Number(digits.charAt(i))
    if (double) {
      value *= 2
      if (value > 9) value -= 9
    }
    sum += value
    double = !double
  }

  return sum % 10 === 0
}

/**
 * Finds personal data and credentials in a document. Previews are always
 * redacted: the raw secret is never returned, so it cannot leak into the UI,
 * logs or a toast.
 */
export function detectSensitiveData(text: string): SensitiveFinding[] {
  const sample = sampleText(text)
  const findings: SensitiveFinding[] = []

  for (const match of sample.matchAll(EMAIL_PATTERN)) {
    findings.push({ kind: 'email', index: match.index, preview: redactEmail(match[0]) })
  }

  for (const match of sample.matchAll(PRIVATE_KEY_PATTERN)) {
    findings.push({ kind: 'private-key', index: match.index, preview: 'PRIVATE KEY block' })
  }

  for (const match of sample.matchAll(API_KEY_PATTERN)) {
    findings.push({ kind: 'api-key', index: match.index, preview: redactToken(match[0]) })
  }

  for (const match of sample.matchAll(PASSWORD_PATTERN)) {
    findings.push({ kind: 'password', index: match.index, preview: '••••' })
  }

  for (const match of sample.matchAll(CARD_PATTERN)) {
    const digits = match[0].replace(/\D/g, '')
    if (digits.length < 13 || digits.length > 19) continue
    if (!passesLuhn(digits)) continue
    findings.push({
      kind: 'credit-card',
      index: match.index,
      preview: `•••• ${digits.slice(-4)}`
    })
  }

  return findings
    .sort((a, b) => a.index - b.index)
    .slice(0, MAX_FINDINGS)
}

/** Group findings by kind, preserving the order in which they were found */
export function groupSensitiveFindings(
  findings: SensitiveFinding[]
): Array<{ kind: SensitiveKind; previews: string[] }> {
  const groups = new Map<SensitiveKind, string[]>()

  for (const finding of findings) {
    const previews = groups.get(finding.kind) ?? []
    previews.push(finding.preview)
    groups.set(finding.kind, previews)
  }

  return [...groups.entries()].map(([kind, previews]) => ({ kind, previews }))
}

/** Labels used by the confirmation dialog */
export const SENSITIVE_KIND_LABELS: Record<SensitiveKind, string> = {
  'email': 'Email addresses',
  'api-key': 'API keys or tokens',
  'private-key': 'Private keys',
  'password': 'Passwords',
  'credit-card': 'Card numbers',
  'personal-data': 'Possible personal data'
}

const CONVERSATIONAL_MESSAGE = /^(?:hi|hello|hey|hola|buenas|buenos dias|buenas tardes|buenas noches|good morning|good afternoon|good evening|thanks|thank you|thanks a lot|gracias|muchas gracias|ok|okay|vale|got it|perfect|great|cool|nice|bye|goodbye|adios|chao|see you|nos vemos)(?:[ !.,]*)$/iu

const DOCUMENT_REFERENCE = /\b(?:document|doc|docs|text|summary|summarize|summarise|article|file|pdf|page|paragraph|section|resumen|resumir|documento|texto|archivo|pagina|parrafo|seccion)\b/iu

/**
 * Conservative routing for the chat: only obvious small talk skips the document
 * context, so a misclassification can never drop context from a real question.
 */
export function needsDocumentContext(message: string): boolean {
  const normalized = message.trim()
  if (!normalized) return true

  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length > 6) return true

  const withoutPunctuation = normalized.replace(/[¿?¡!.,;:…]+/gu, '').trim()
  if (DOCUMENT_REFERENCE.test(withoutPunctuation)) return true

  return !CONVERSATIONAL_MESSAGE.test(withoutPunctuation)
}

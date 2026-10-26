import { ref, readonly } from 'vue'
import {
  analyzeDocumentQuality,
  detectSensitiveData,
  type DocumentIssue,
  type DocumentQuality,
  type SensitiveFinding
} from '../utils/semanticChecks'
import { evaluateDecisions, isDecisionModelAvailable } from '../utils/decisionModel'

/** Below this confidence the model answer is ignored in favour of heuristics */
const CONFIDENCE_THRESHOLD = 0.8

/**
 * Semantic pre-checks for document ingestion and history persistence.
 *
 * Local heuristics always run. When Chrome exposes the experimental Decisions
 * API, its answers are layered on top without ever removing a local finding.
 */
export const useSemanticGates = () => {
  const isClassifying = ref(false)

  const assessDocumentQuality = async (text: string): Promise<DocumentQuality> => {
    const local = analyzeDocumentQuality(text)
    if (!isDecisionModelAvailable()) return local

    isClassifying.value = true

    try {
      const decisions = await evaluateDecisions(
        text,
        'Document pre-check before summarizing',
        [
          {
            id: 'is_substantive_text',
            type: 'boolean',
            prompt: 'Does this text contain readable, coherent prose that a person could summarize?'
          },
          {
            id: 'is_garbled_extraction',
            type: 'boolean',
            prompt: 'Does this text look like a failed extraction: random characters, OCR noise or unrelated fragments?'
          }
        ]
      )

      const substantive = decisions?.is_substantive_text
      const garbled = decisions?.is_garbled_extraction
      if (!substantive || !garbled) return local

      const issues = new Set<DocumentIssue>(local.issues)

      if (substantive.label === 'false' && substantive.confidence >= CONFIDENCE_THRESHOLD) {
        issues.add('low-prose-ratio')
      }
      if (garbled.label === 'true' && garbled.confidence >= CONFIDENCE_THRESHOLD) {
        issues.add('garbled-characters')
      }

      return { ...local, usable: issues.size === 0, issues: [...issues] }
    } finally {
      isClassifying.value = false
    }
  }

  const scanSensitiveData = async (text: string): Promise<SensitiveFinding[]> => {
    const findings = detectSensitiveData(text)
    if (!isDecisionModelAvailable()) return findings

    // Local matches are exact, so there is nothing to ask the model about
    if (findings.length > 0) return findings

    isClassifying.value = true

    try {
      const decisions = await evaluateDecisions(
        text,
        'Sensitive data pre-check before saving a document to local history',
        [
          {
            id: 'contains_sensitive_data',
            type: 'boolean',
            prompt: 'Does this text contain personal contact info, API keys, passwords or other credentials?'
          }
        ]
      )

      const sensitive = decisions?.contains_sensitive_data
      if (!sensitive || sensitive.label !== 'true' || sensitive.confidence < CONFIDENCE_THRESHOLD) {
        return findings
      }

      return [{ kind: 'personal-data', index: 0, preview: 'Possible personal data' }]
    } finally {
      isClassifying.value = false
    }
  }

  return {
    isClassifying: readonly(isClassifying),
    assessDocumentQuality,
    scanSensitiveData
  }
}

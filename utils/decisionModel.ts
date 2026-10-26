/**
 * Decisions API bridge
 *
 * Chrome is prototyping a Decisions API ("Semantic If") behind
 * chrome://flags/#ai-decisions-api in Canary. It scores a fixed set of boolean
 * questions in a single pass, which is much cheaper than prompting a generative
 * model. The API shape is still illustrative, so every failure path returns
 * `null` and the caller keeps its local heuristics.
 */

import type {
  AIDecisionModel,
  AIDecisionModelOptions,
  AIDecisionQuestion,
  AIDecisionResult
} from '../types/chrome-ai'

/** Decisions only need a representative sample, not the whole document */
const DECISION_INPUT_LIMIT = 8000

interface DecisionModelApi {
  create(options: AIDecisionModelOptions): Promise<AIDecisionModel>
}

const getDecisionModelApi = (): DecisionModelApi | undefined => {
  if (typeof window === 'undefined') return undefined

  const candidate = (window as unknown as { DecisionModel?: Partial<DecisionModelApi> }).DecisionModel
  if (typeof candidate?.create !== 'function') return undefined

  return candidate as DecisionModelApi
}

export function isDecisionModelAvailable(): boolean {
  return getDecisionModelApi() !== undefined
}

/**
 * Asks the on-device decision model a set of boolean questions about `text`.
 * Returns `null` when the API is missing or the call fails, so callers can fall
 * back without extra branching.
 */
export async function evaluateDecisions(
  text: string,
  context: string,
  questions: AIDecisionQuestion[]
): Promise<AIDecisionResult | null> {
  const api = getDecisionModelApi()
  if (!api) return null

  let model: AIDecisionModel | undefined

  try {
    model = await api.create({ context, questions })
    return await model.decide(text.slice(0, DECISION_INPUT_LIMIT))
  } catch (error) {
    console.warn('[decisionModel] falling back to local heuristics:', error)
    return null
  } finally {
    model?.destroy?.()
  }
}

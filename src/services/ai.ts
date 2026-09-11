import { uid } from '@/lib/utils'
import type {
  AssistantAction,
  AssistantDataPoint,
  AssistantSource,
  ChatMessage,
} from '@/types'

import { ask as askLocalEngine } from './assistant'
import { mutateAsync } from './http'

/**
 * The AI seam.
 *
 *   Student → Chat UI → [this module] → POST /ai/chat
 *                                         → intent detection
 *                                         → context retrieval (campus database)
 *                                         → LLM
 *                                         → validated response → Chat UI
 *
 * The UI calls `chat()` and nothing else. Which provider answers — a backend
 * LLM, or the local rule engine in `assistant.ts` — is decided here, so
 * swapping OpenAI for Claude for a self-hosted model never touches a component.
 *
 * Two hard rules this module enforces on behalf of the product:
 *
 *  1. **The model is never the source of truth for university data.** Retrieval
 *     happens server-side against the campus database, and an answer that
 *     arrives without citing the records it used is rejected outright (see
 *     `validate`). A confident sentence with nothing behind it is exactly the
 *     failure mode we cannot ship to students.
 *
 *  2. **Nothing unverified becomes navigation.** Actions are clamped to
 *     in-app routes, so a compromised or hallucinating model cannot turn an
 *     answer into a link off the product.
 *
 * On any failure — no backend, a timeout, a 500, or a response that fails
 * validation — this falls back to the local engine, which computes every figure
 * from the student's own records and can therefore never invent one.
 */

/* ------------------------------------------------------------- contract */

/** The request body `POST /api/ai/chat` receives. */
export interface AiChatRequest {
  question: string
  /** Prior turns, oldest first, so the backend can resolve "what about tomorrow?". */
  history?: { role: 'user' | 'assistant'; content: string }[]
}

/**
 * The response `POST /api/ai/chat` is expected to return.
 *
 * Deliberately the same shape the UI already renders, minus the fields the
 * client owns (`id`, `role`). `sources` is required, not optional: it is the
 * contract that makes an answer inspectable.
 */
export interface AiChatResponse {
  content: string
  data?: AssistantDataPoint[]
  sources: AssistantSource[]
  actions?: AssistantAction[]
}

/* ----------------------------------------------------------- validation */

const SOURCE_KINDS: AssistantSource['kind'][] = [
  'attendance',
  'timetable',
  'complaints',
  'policy',
]

const TONES: NonNullable<AssistantDataPoint['tone']>[] = ['neutral', 'ok', 'warn', 'danger']

/** Internal routes only — never an absolute or protocol-relative URL. */
function isInternalRoute(to: unknown): to is string {
  return typeof to === 'string' && to.startsWith('/') && !to.startsWith('//')
}

/**
 * Checks a backend answer before a student ever reads it.
 *
 * Returns `null` when the response cannot be trusted, which sends the caller to
 * the local engine. Being strict here is the whole point: a malformed answer is
 * recoverable, a confidently wrong one is not.
 */
export function validate(payload: unknown): AiChatResponse | null {
  if (!payload || typeof payload !== 'object') return null
  const body = payload as Record<string, unknown>

  if (typeof body.content !== 'string' || body.content.trim().length === 0) return null

  /* An answer about a student's own records must say which records it read.
     No citations means we cannot show the student where a figure came from,
     and an uninspectable number is not one this product will display. */
  if (!Array.isArray(body.sources) || body.sources.length === 0) return null

  const sources: AssistantSource[] = []
  for (const entry of body.sources) {
    if (!entry || typeof entry !== 'object') return null
    const source = entry as Record<string, unknown>
    if (typeof source.label !== 'string' || typeof source.detail !== 'string') return null
    if (!SOURCE_KINDS.includes(source.kind as AssistantSource['kind'])) return null
    sources.push({
      kind: source.kind as AssistantSource['kind'],
      label: source.label,
      detail: source.detail,
      /* Anything that does not explicitly declare itself live is labelled
         demo. Mislabelling demo data as official is the worse error, so the
         ambiguous case resolves that way. */
      source: source.source === 'live' ? 'live' : 'demo',
    })
  }

  const data: AssistantDataPoint[] = []
  if (Array.isArray(body.data)) {
    for (const entry of body.data) {
      if (!entry || typeof entry !== 'object') continue
      const point = entry as Record<string, unknown>
      if (typeof point.label !== 'string' || typeof point.value !== 'string') continue
      data.push({
        label: point.label,
        value: point.value,
        tone: TONES.includes(point.tone as never)
          ? (point.tone as AssistantDataPoint['tone'])
          : 'neutral',
      })
    }
  }

  const actions: AssistantAction[] = []
  if (Array.isArray(body.actions)) {
    for (const entry of body.actions) {
      if (!entry || typeof entry !== 'object') continue
      const action = entry as Record<string, unknown>
      if (typeof action.label !== 'string' || !isInternalRoute(action.to)) continue
      actions.push({ label: action.label, to: action.to })
    }
  }

  return {
    content: body.content,
    sources,
    ...(data.length > 0 ? { data } : {}),
    ...(actions.length > 0 ? { actions } : {}),
  }
}

/* ------------------------------------------------------------------ ask */

/**
 * Answers a student's question.
 *
 * The only entry point the chat UI should import. `history` is passed straight
 * through to the backend so follow-up questions resolve; the local engine
 * ignores it, answering each question on its own terms.
 */
export async function chat(
  question: string,
  history: AiChatRequest['history'] = [],
): Promise<ChatMessage> {
  const body: AiChatRequest = { question, history }

  const answer = await mutateAsync<AiChatResponse | null>(
    '/ai/chat',
    body,
    /* No backend, or it failed: answer from the records on this device. */
    async () => null,
  )

  const validated = answer ? validate(answer) : null

  if (!validated) {
    if (answer && import.meta.env.DEV) {
      console.warn('[CampusOS] AI response failed validation — using the local engine.', answer)
    }
    return askLocalEngine(question)
  }

  return { id: uid('msg'), role: 'assistant', ...validated }
}

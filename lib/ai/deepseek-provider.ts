import { createOpenAI } from '@ai-sdk/openai'

// DeepSeek's v4-flash/v4-pro default to "thinking mode" on, which silently
// ignores `temperature` and isn't reachable via @ai-sdk/openai's
// providerOptions.openai (that option set is a strict Zod object that only
// allowlists known OpenAI fields like reasoningEffort/logitBias/etc. and
// drops anything else - confirmed by reading its schema directly, see
// node_modules/@ai-sdk/openai/dist/index.js). A custom fetch is the
// documented, reliable way to inject DeepSeek's top-level `thinking` field.
//
// Do NOT use providerOptions.openai.reasoningEffort: 'none' as a substitute -
// DeepSeek's API returns 400 for reasoning_effort:'none' specifically.
function fetchWithThinkingDisabled(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (init?.body && typeof init.body === 'string') {
    try {
      const body = JSON.parse(init.body)
      body.thinking = { type: 'disabled' }
      init = { ...init, body: JSON.stringify(body) }
    } catch {
      // non-JSON body shouldn't happen for chat completions - pass through untouched
    }
  }
  return fetch(input, init)
}

const provider = createOpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
  fetch: fetchWithThinkingDisabled,
})

// DeepSeek only implements the OpenAI-compatible Chat Completions API, not
// OpenAI's newer Responses API. @ai-sdk/openai's default callable provider
// (and .languageModel()) route to Responses by default in this version -
// confirmed by reading its .d.mts, whose call signature is
// `(modelId: OpenAIResponsesModelId)`. Calling deepseek(modelId) directly
// would silently hit the wrong API shape, so this wraps .chat() instead.
export const deepseek = (modelId: string) => provider.chat(modelId)

// deepseek-chat/deepseek-reasoner were retired 2026-07-24. Live-verified
// against the project's own API key on 2026-08-18 (scripts/test-deepseek.ts).
export const DEEPSEEK_MODELS = {
  flash: 'deepseek-v4-flash', // fast/cheap workhorse - default for most stages
  pro: 'deepseek-v4-pro',     // higher quality, 1M context - reserve for pricier stages
} as const

export type DeepseekModelId = (typeof DEEPSEEK_MODELS)[keyof typeof DEEPSEEK_MODELS]

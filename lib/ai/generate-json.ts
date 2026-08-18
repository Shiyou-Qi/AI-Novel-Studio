import { generateObject } from 'ai'
import type { z } from 'zod'
import { deepseek, DEEPSEEK_MODELS } from './deepseek-provider'

// Replaces lib/utils.ts's parseAIResponse/tryRepairAndParseJson brace-balancing
// hacks. DeepSeek only supports response_format:{type:'json_object'}, not
// json_schema (confirmed by reading @ai-sdk/openai's source: it only emits
// json_schema mode when a `schema` is passed to generateObject). So this uses
// output:'no-schema' (plain JSON mode, matching today's jsonMode:true) and
// validates the result with the caller's own Zod schema, with one bounded
// repair retry (re-prompt with the validation error) on failure.
export async function generateValidatedJson<T extends z.ZodTypeAny>(opts: {
  schema: T
  system: string
  prompt: string
  model?: string
  temperature?: number
}): Promise<z.infer<T>> {
  const model = opts.model ?? DEEPSEEK_MODELS.flash

  const attempt = async (repairNote?: string) => {
    const { object } = await generateObject({
      model: deepseek(model),
      output: 'no-schema',
      system: repairNote ? `${opts.system}\n\n${repairNote}` : opts.system,
      prompt: opts.prompt,
      temperature: opts.temperature ?? 0.7,
    })
    return opts.schema.parse(object)
  }

  try {
    return await attempt()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return await attempt(
      `你上一次的输出未通过校验，错误信息：${message}\n请修正后重新输出完整的 JSON，不要省略任何字段，也不要包含 Markdown 代码块标记。`
    )
  }
}

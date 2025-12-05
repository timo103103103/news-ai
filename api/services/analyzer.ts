import crypto from 'crypto'
import { setStatus } from '../queue/inMemoryQueue.js'
import { cacheGet, cacheSet } from '../repositories/cache.js'
import { saveResult } from '../repositories/db.js'
import { openaiChat } from './openaiClient.js'

export async function processAnalysis(job: {
  id: string
  type: string
  payload: { text?: string; fileUrl?: string; params?: Record<string, unknown> }
}): Promise<void> {
  const { id, type, payload } = job
  const text = payload.text || ''
  const params = payload.params || {}

  const hash = crypto
    .createHash('sha256')
    .update(`${type}|${text}|${JSON.stringify(params)}`)
    .digest('hex')

  const cached = await cacheGet(hash)
  if (cached) {
    await saveResult(id, type, payload, cached)
    return
  }

  const timeoutMs = Number(process.env.ANALYSIS_TIMEOUT_MS || 30000)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const systemPrompt = `You are a ${type} analysis engine.`
    const userPrompt = payload.text
      ? `Analyze this: ${payload.text}`
      : `Analyze content from URL: ${payload.fileUrl}`

    const ai = await openaiChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt || '' },
      ],
      { signal: controller.signal },
    )

    const result = formatResult(type, ai)
    await cacheSet(hash, result)
    await saveResult(id, type, payload, result)
  } finally {
    clearTimeout(timer)
  }
}

function formatResult(
  type: string,
  aiRaw: any,
): {
  success: boolean
  data: Record<string, unknown>
  metadata: Record<string, unknown>
} {
  const content = aiRaw?.choices?.[0]?.message?.content || ''
  const base = {
    success: true,
    data: { content, type },
    metadata: { model: aiRaw?.model, created: aiRaw?.created },
  }
  return base
}
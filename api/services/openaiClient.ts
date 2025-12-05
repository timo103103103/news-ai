type Message = { role: 'system' | 'user' | 'assistant'; content: string }

export async function openaiChat(
  messages: Message[],
  opts?: { signal?: AbortSignal; model?: string },
) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY')
  const model = opts?.model || process.env.OPENAI_MODEL || 'gpt-4.1-mini'
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages }),
    signal: opts?.signal,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${text}`)
  }
  return await res.json()
}
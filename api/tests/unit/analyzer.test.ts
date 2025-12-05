// @vitest-environment node
import { vi } from 'vitest'
vi.mock('../services/openaiClient.js', () => ({
  openaiChat: async () => ({ model: 'mock', created: Date.now(), choices: [{ message: { content: 'Mock result' } }] }),
}))

import { processAnalysis } from '../services/analyzer.js'
import { getResult } from '../repositories/db.js'

describe('Analyzer', () => {
  it('processes job and saves result', async () => {
    const id = 'test-id'
    await processAnalysis({ id, type: 'summary', payload: { text: 'Hello' } })
    const res = await getResult(id)
    expect(res?.result?.data?.content).toContain('Mock result')
  })
})
// @vitest-environment node
import { analysisSchema } from '../middleware/validation.js'

describe('Validation', () => {
  it('validates minimal payload', () => {
    const res = analysisSchema.safeParse({ type: 'summary', text: 'ok' })
    expect(res.success).toBe(true)
  })

  it('rejects invalid url', () => {
    const res = analysisSchema.safeParse({ type: 'summary', fileUrl: 'not-a-url' })
    expect(res.success).toBe(false)
  })
})
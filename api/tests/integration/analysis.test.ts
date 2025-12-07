// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import path from 'path'
import { fileURLToPath } from 'url'

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let app: any

beforeAll(async () => {
  // Import your actual server file
  const mod = await import(path.resolve(__dirname, '../../server.js'))
  app = mod.default || mod.app
})

describe('Analysis API', () => {
  it('should return health status', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200)
    
    expect(res.body.status).toBe('ok')
    expect(res.body.openai).toBeDefined()
  })

  it('should analyze text and return results', async () => {
    const res = await request(app)
      .post('/api/analyze/summary')
      .send({ text: 'This is a test news article about technology trends.' })
      .expect(200)
    
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeDefined()
    expect(typeof res.body.data).toBe('string')
  })

  it('should return 400 when text is missing', async () => {
    const res = await request(app)
      .post('/api/analyze/summary')
      .send({})
      .expect(400)
    
    expect(res.body.error).toBeDefined()
  })
})
// @vitest-environment node
import request from 'supertest'
import app from '../app.js'

describe('Analysis API', () => {
  it('creates a job and returns 202', async () => {
    const res = await request(app)
      .post('/api/analysis')
      .send({ type: 'summary', text: 'Hello world' })
      .expect(202)
    expect(res.body.id).toBeDefined()
  })
})

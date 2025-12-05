import { enqueue, getStatus } from '../queue/inMemoryQueue.js'
import { listResults, getResult } from '../repositories/db.js'
import crypto from 'crypto'

export async function createAnalysis(req: any, res: any) {
  const { type, text, fileUrl, params } = req.body
  const id = crypto.randomUUID()
  enqueue({ id, type, payload: { text, fileUrl, params }, createdAt: Date.now() })
  res.status(202).json({ id, status: 'queued' })
}

export async function getAnalysisStatus(req: any, res: any) {
  const { id } = req.params
  const status = getStatus(id)
  if (!status) return res.status(404).json({ success: false, error: 'Not found' })
  res.json({ id, ...status })
}

export async function getAnalysisResult(req: any, res: any) {
  const { id } = req.params
  const result = await getResult(id)
  if (!result) return res.status(404).json({ success: false, error: 'Not found' })
  res.json({ success: true, id: result.id, type: result.type, result: result.result, created_at: result.created_at })
}

export async function listAnalysis(req: any, res: any) {
  const results = await listResults()
  res.json({ success: true, items: results })
}
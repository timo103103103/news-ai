import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(helmet())
app.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'ok' })
})

// Metrics ingestion (A/B, engagement, filters)
app.post('/api/metrics', (req, res) => {
  try {
    const { event, payload, ts, path } = req.body || {}
    if (!event) {
      return res.status(400).json({ success: false, message: 'event required' })
    }
    console.log('📊 Metrics:', { event, path, ts, payload })
    // In production, persist to a datastore (e.g., Postgres, BigQuery, or log pipeline)
    res.status(204).end()
  } catch (err) {
    console.error('❌ Metrics error:', err)
    res.status(500).json({ success: false })
  }
})

app.post('/api/stripe/create-checkout-session', (_req, res) => {
  res.status(200).json({ url: null })
})

// In-memory history mock
type HistoryItem = { id: string; title: string; date: string; summary: string; type: string; metrics?: { score?: number; confidence?: number } }
const demoHistory: HistoryItem[] = [
  { id: 'a3', title: 'PESTLE: Semiconductor policy shift', date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), summary: 'Policy changes impacting technology exports.', type: 'pestle', metrics: { score: 82, confidence: 87 } },
  { id: 'a2', title: 'Market Impact: Energy sector reacts', date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), summary: 'Oil prices and equities move on geopolitical updates.', type: 'market-impact', metrics: { score: 74, confidence: 79 } },
  { id: 'a1', title: 'Manipulation Score: Viral post analysis', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), summary: 'Detected emotionally charged phrases and missing citations.', type: 'manipulation-score', metrics: { score: 65, confidence: 70 } },
]

app.get('/api/history', (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const sortBy = (req.query.sortBy as string) || 'date'
  const sortOrder = (req.query.sortOrder as string) || 'desc'

  const sorted = [...demoHistory].sort((a, b) => {
    const va = sortBy === 'title' ? a.title.localeCompare(b.title) : new Date(a.date).getTime()
    const vb = sortBy === 'title' ? b.title.localeCompare(a.title) : new Date(b.date).getTime()
    return sortOrder === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number)
  })
  const start = (page - 1) * limit
  const paged = sorted.slice(start, start + limit)
  res.json({ analyses: paged, total: sorted.length, page, totalPages: Math.ceil(sorted.length / limit) })
})

app.get('/api/history/:id', (req, res) => {
  const item = demoHistory.find(h => h.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json({ ...item, content: item.summary, rawData: { source: 'demo' } })
})

app.post('/api/history/refresh', (_req, res) => {
  res.json({ analyses: demoHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), total: demoHistory.length, page: 1, totalPages: 1 })
})

const PORT = 3005
const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`)
})

process.on('SIGTERM', () => {
  server.close(() => process.exit(0))
})

process.on('SIGINT', () => {
  server.close(() => process.exit(0))
})

export default app

type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export interface AnalysisJob {
  id: string
  type: string
  payload: { text?: string; fileUrl?: string; params?: Record<string, unknown> }
  createdAt: number
}

type StatusRecord = {
  status: JobStatus
  progress?: number
  error?: string
}

const queue: AnalysisJob[] = []
const statusMap: Map<string, StatusRecord> = new Map()

let processing = false

export const enqueue = (job: AnalysisJob) => {
  queue.push(job)
  statusMap.set(job.id, { status: 'queued', progress: 0 })
  run()
}

export const getStatus = (id: string): StatusRecord | undefined => statusMap.get(id)

export const setStatus = (id: string, status: StatusRecord) => statusMap.set(id, status)

export const run = async () => {
  if (processing) return
  processing = true
  while (queue.length) {
    const job = queue.shift()!
    setStatus(job.id, { status: 'running', progress: 0 })
    try {
      // Lazy import to avoid circular deps
      const { processAnalysis } = await import('../services/analyzer.js')
      await processAnalysis(job)
      setStatus(job.id, { status: 'succeeded', progress: 100 })
    } catch (e: any) {
      setStatus(job.id, { status: 'failed', error: e?.message || 'Unknown error' })
    }
  }
  processing = false
}
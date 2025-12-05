import { z } from 'zod'
import type { Request, Response, NextFunction } from 'express'

export const analysisSchema = z.object({
  type: z.string().min(1),
  text: z.string().optional(),
  fileUrl: z.string().url().optional(),
  params: z.record(z.any()).optional(),
})

export function validateAnalysis(req: Request, res: Response, next: NextFunction) {
  const parse = analysisSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ success: false, error: 'Invalid input', details: parse.error.issues })
  }
  const data = parse.data
  const clean = {
    ...data,
    text: typeof data.text === 'string' ? sanitize(data.text) : data.text,
  }
  req.body = clean
  next()
}

function sanitize(input: string): string {
  return input.replace(/[<>]/g, '').trim()
}
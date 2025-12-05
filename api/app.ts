/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './docs/openapi.js'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import historyRoutes from './routes/history.js'
import stripeRoutes from './routes/stripe.js'
import accountRoutes from './routes/account.js'
import analyzeRoutes from './routes/analyze.js'
import analysisRoutes from './routes/analysis.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename) // eslint-disable-line @typescript-eslint/no-unused-vars

// load env
dotenv.config()

const app: express.Application = express()

// security and logging
const corsAllowlist = (process.env.CORS_ALLOWLIST || '').split(',').filter(Boolean)
app.use(
  cors({
    origin: corsAllowlist.length ? corsAllowlist : true,
    credentials: true,
  }),
)
app.use(helmet())
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)
app.use(pinoHttp())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/auth', authRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/stripe', stripeRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/analyze', analyzeRoutes)
app.use('/api/analysis', analysisRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = (error as any).statusCode || 500
  res.status(status).json({
    success: false,
    error: error.message || 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app

import express from 'express'
import { validateAnalysis } from '../middleware/validation.js'
import {
  createAnalysis,
  getAnalysisStatus,
  getAnalysisResult,
  listAnalysis,
} from '../controllers/analysisController.js'

const router = express.Router()

router.post('/', validateAnalysis, createAnalysis)
router.get('/', listAnalysis)
router.get('/:id', getAnalysisResult)
router.get('/:id/status', getAnalysisStatus)

export default router
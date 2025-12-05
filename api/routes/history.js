import express from 'express';
import historyController from '../controllers/historyController.js';

const router = express.Router();

// Get analysis history with pagination and filtering
router.get('/', historyController.getHistory);

// Get specific analysis details
router.get('/:id', historyController.getAnalysisDetail);

// Refresh history data
router.post('/refresh', historyController.refreshHistory);

export default router;
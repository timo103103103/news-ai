import express from 'express';
const router = express.Router();

import summaryController from '../controllers/summaryController.js';
import pestleController from '../controllers/pestleController.js';
import motiveController from '../controllers/motiveController.js';
import partyImpactController from '../controllers/partyImpactController.js';
import marketImpactController from '../controllers/marketImpactController.js';
import manipulationScoreController from '../controllers/manipulationScoreController.js';
import newsInputController from '../controllers/newsInputController.js';
import fullController from '../controllers/fullController.js';

router.post('/summary', summaryController.analyzeSummary);
router.post('/full', fullController.analyzeFull);
router.post('/pestle', pestleController.analyzePestle);
router.post('/motive', motiveController.analyzeMotive);
router.post('/party-impact', partyImpactController.analyzePartyImpact);
router.post('/market-impact', marketImpactController.analyzeMarketImpact);
router.post('/manipulation-score', manipulationScoreController.analyzeManipulationScore);

// News Input Module routes
router.post('/news-input/url', newsInputController.processURL);
router.post('/news-input/file', newsInputController.processFile);
router.post('/news-input/text', newsInputController.processText);
router.post('/news-input/auto', newsInputController.processAuto);

export default router;
import { Router } from 'express';
import {
  createCheckoutSession,
  getSubscriptionStatus,
  cancelSubscription,
  webhookHandler,
} from '../controllers/stripeController';

const router = Router();

router.post('/create-checkout-session', createCheckoutSession);
router.get('/subscription-status', getSubscriptionStatus);
router.post('/cancel-subscription', cancelSubscription);
router.post('/webhook', webhookHandler);

export default router;
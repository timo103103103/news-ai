import Stripe from 'stripe';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); 

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { priceId, tier } = req.body;

    if (!priceId || !tier) {
      return res.status(400).json({ error: 'Price ID and tier are required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing?success=true&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing?canceled=true`,
      metadata: {
        tier: tier,
      },
    });

    // Instead of returning sessionId, return the checkout URL
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.session_id as string;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      res.json({
        status: 'success',
        tier: session.metadata?.tier || 'monthly',
        subscriptionId: subscription.id,
        currentPeriodEnd: (subscription as any).current_period_end || Date.now() / 1000 + 30 * 24 * 60 * 60, // Default to 30 days from now
      });
    } else {
      res.json({ status: 'pending' });
    }
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({
      status: 'success',
      message: 'Subscription will be canceled at the end of the current period',
      currentPeriodEnd: (subscription as any).current_period_end || Date.now() / 1000 + 30 * 24 * 60 * 60, // Default to 30 days from now
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

export const webhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.log('Webhook endpoint secret not configured');
    return res.status(400).json({ error: 'Webhook endpoint secret not configured' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Payment succeeded for session: ${session.id}`);
      // Here you would typically update your database with the subscription info
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription canceled: ${subscription.id}`);
      // Here you would typically update your database to reflect the cancellation
      break;
    }
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

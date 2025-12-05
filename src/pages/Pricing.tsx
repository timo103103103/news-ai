import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import SubscriptionStatus from '@/components/account/SubscriptionStatus';
import BillingManagement from '@/components/account/BillingManagement';

// Load Stripe - will be used for future enhancements
// const stripePromise = loadStripe('pk_test_51S6htKGkPJUojqkr014sSAlaOkD7NXbkKf5atqjDr9UaKBofyjIcVpSr3XW02oE9fCm0T1ZRnyo8LxgE2o6INTQX00LCjyn4eH');

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  priceId?: string;
  type: 'basic' | 'premium';
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with basic news analysis',
    features: [
      'Basic news summary',
      'Limited PESTLE analysis',
      '5 articles per month',
      'Basic sentiment analysis',
      'Community support'
    ],
    cta: 'Get Started',
    type: 'basic',
  },
  {
    name: 'Monthly',
    price: '$9.99',
    period: 'month',
    description: 'Unlock advanced features for serious analysis',
    features: [
      'Everything in Free',
      'Full PESTLE analysis',
      'Motive analysis with heatmaps',
      'Unlimited articles',
      'Priority support',
      'Advanced sentiment analysis',
      'Export reports'
    ],
    cta: 'Subscribe',
    popular: true,
    priceId: 'price_1STKLkGkPJUojqkrEmacyNbL',
    type: 'premium',
  },
  {
    name: 'Premium',
    price: '$99.99',
    period: 'year',
    description: 'Complete solution for professional analysts',
    features: [
      'Everything in Monthly',
      'Party impact analysis',
      'Stock market impact insights',
      'Manipulation score detection',
      'Advanced data visualization',
      'Premium support',
      'Custom integrations',
      'White-label reports'
    ],
    cta: 'Go Premium',
    type: 'premium',
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Financial Analyst',
    company: 'Investment Corp',
    content: 'DeepRead has transformed how we analyze news impact on markets. The premium features are worth every penny.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Risk Manager',
    company: 'Tech Startup',
    content: 'The manipulation score detection alone has saved us from making poor investment decisions.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'News Editor',
    company: 'Media Group',
    content: 'The PESTLE analysis is incredibly comprehensive. Our editorial team relies on it daily.',
    rating: 5
  }
];

const faqs = [
  {
    question: 'Can I change my subscription plan anytime?',
    answer: 'Yes, you can upgrade or downgrade your subscription at any time. Changes take effect immediately.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'We offer a 7-day free trial for our Monthly plan. No credit card required.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel anytime. You\'ll continue to have access until the end of your billing period.',
  }
];

export default function Pricing() {
  const [loading, setLoading] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [viewFilter, setViewFilter] = useState<'all' | 'premium' | 'basic'>('all');
  const { setTier } = useSubscription();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [premiumView, setPremiumView] = useState(false);
  const [subscription, setSubscription] = useState<any | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const sessionId = urlParams.get('session_id');
    if (window.location.hash === '#premium') {
      setPremiumView(true);
      setViewFilter('premium');
    }

    if (success === 'true') {
      setMessage('Payment successful! Your subscription has been activated.');
      // Check subscription status
      if (sessionId) {
        setVerifying(true);
        checkSubscriptionStatus(sessionId);
      }
    } else if (canceled === 'true') {
      setMessage('Payment canceled. You can try again anytime.');
    }

    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkSubscriptionStatus = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/subscription-status?session_id=${sessionId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setTier(data.tier);
        setVerifying(false);
        setPremiumView(true);
        navigate('/pricing#premium', { replace: true });
      } else {
        setVerifying(false);
        setMessage('Payment verification pending. Please wait or retry verification.');
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setVerifying(false);
      setMessage('Payment verification failed. You can retry or open billing portal.');
    }
  };

  useEffect(() => {
    if (premiumView) {
      (async () => {
        try {
          const res = await fetch('/api/account/subscription');
          if (!res.ok) {
            setSubscription(null);
            setMessage('Unable to load subscription details.');
            return;
          }
          const data = await res.json();
          const normalized = {
            plan: (data && data.plan) || 'premium',
            status: (data && data.status) || 'active',
            currentPeriodEnd: (data && data.currentPeriodEnd) || new Date().toISOString(),
            cancelAtPeriodEnd: !!(data && data.cancelAtPeriodEnd),
            paymentMethodLast4: data && data.paymentMethodLast4,
          };
          setSubscription(normalized);
        } catch {}
      })();
    }
  }, [premiumView]);

  const handleSubscribe = async (tier: PricingTier) => {
    if (tier.name === 'Free') {
      setTier('free');
      return;
    }

    if (tier.name === 'Premium') {
      // For premium, we'll use the monthly price ID for now
      // In a real app, you'd create a separate annual price in Stripe
      setLoading(tier.name);
      setSelectedTier(tier.name);
      
      // Simulate premium subscription
      setTimeout(() => {
        setTier('premium');
        setLoading('');
        setSelectedTier('');
        navigate('/pricing#premium', { replace: true });
      }, 2000);
      return;
    }

    if (!tier.priceId) return;

    setLoading(tier.name);
    setSelectedTier(tier.name);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: tier.priceId,
          tier: tier.name.toLowerCase(),
        }),
      });

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        alert('Failed to create checkout session. Please try again.');
        setLoading('');
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {verifying && (
          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 border animate-pulse">
              <p className="text-gray-900 font-medium">Verifying your payment…</p>
              <p className="text-sm text-gray-600">This will only take a moment.</p>
            </div>
          </div>
        )}
        {/* Message Display */}
        {message && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg transition-opacity">
            <p className="text-green-800 text-center">{message}</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of AI-powered news analysis with our flexible pricing plans
          </p>
        </div>

        {(premiumView) && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-12 border border-indigo-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Subscription</h2>
            <p className="text-gray-700 mb-4">Your premium access is active. Explore full features and manage billing.</p>
            {subscription && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <SubscriptionStatus subscription={subscription} onRefresh={() => {}} />
                <BillingManagement subscription={subscription} onRefresh={() => {}} />
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/results?upgraded=true&tier=premium', { replace: true })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start Using Premium
              </button>
              <button
                onClick={() => setViewFilter('premium')}
                className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Benefits
              </button>
            </div>
          </div>
        )}

        {/* Plan Toggle */}
        <div className="flex items-center justify-center mb-8" role="tablist" aria-label="Plan type">
          <button
            onClick={() => setViewFilter('all')}
            role="tab"
            aria-selected={viewFilter === 'all'}
            className={`px-4 py-2 rounded-l-lg border ${viewFilter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900 border-gray-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setViewFilter('premium')}
            role="tab"
            aria-selected={viewFilter === 'premium'}
            className={`px-4 py-2 border-t border-b ${viewFilter === 'premium' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900 border-gray-300'}`}
          >
            Premium
          </button>
          <button
            onClick={() => setViewFilter('basic')}
            role="tab"
            aria-selected={viewFilter === 'basic'}
            className={`px-4 py-2 rounded-r-lg border ${viewFilter === 'basic' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900 border-gray-300'}`}
          >
            Basic
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {pricingTiers
            .filter(t => viewFilter === 'all' ? true : t.type === viewFilter)
            .map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                tier.type === 'premium'
                  ? 'bg-white border-2 border-indigo-600 shadow-2xl ring-1 ring-indigo-200'
                  : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
              }`}
            >
              {tier.type === 'premium' && (
                <div className="absolute -top-4 left-4">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide">Premium</span>
                </div>
              )}
              {tier.popular && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">Most Popular</span>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className={`text-2xl font-bold mb-1 ${tier.type === 'premium' ? 'text-gray-900' : 'text-gray-900'}`}>{tier.name}</h3>
                <p className="text-gray-600 mb-4">{tier.description}</p>
                <div className="flex items-baseline">
                  <span className={`text-5xl font-bold ${tier.type === 'premium' ? 'text-gray-900' : 'text-gray-900'}`}>{tier.price}</span>
                  <span className="text-gray-500 ml-2">/{tier.period}</span>
                </div>
              </div>

              {tier.type === 'premium' ? (
                <div className="mb-6 rounded-lg bg-indigo-50 border border-indigo-100 p-4">
                  <p className="text-sm font-medium text-indigo-700 mb-2">Highlights</p>
                  <ul className="space-y-2">
                    {tier.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-indigo-900">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <ul className={`space-y-3 mb-8 ${tier.type === 'premium' ? 'divide-y divide-indigo-100' : ''}`}>
                {tier.features.map((feature, index) => (
                  <li key={index} className={`flex items-start ${tier.type === 'premium' ? 'pt-2' : ''}`}>
                    <Check className={`${tier.type === 'premium' ? 'h-5 w-5 text-indigo-600' : 'h-5 w-5 text-green-600'} mr-3 mt-0.5 flex-shrink-0`} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(tier)}
                disabled={loading === tier.name}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  tier.type === 'premium'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } ${loading === tier.name ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === tier.name ? 'Processing...' : tier.cta}
              </button>
            </div>
          ))}
        </div>


        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Our Users Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          {/* Feature Comparison (moved to final component of last section) */}
          <div className="mt-12 overflow-x-auto transition-all duration-300 ease-in-out max-w-full">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
              Compare Plans
            </h2>
            <table className="min-w-[720px] w-full table-fixed">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 w-2/5 text-xs sm:text-sm md:text-base">Features</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900 w-1/5 text-xs sm:text-sm md:text-base">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900 w-1/5 text-xs sm:text-sm md:text-base">Monthly</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900 w-1/5 text-xs sm:text-sm md:text-base">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'News Summary', free: true, monthly: true, premium: true },
                  { feature: 'PESTLE Analysis', free: 'Limited', monthly: true, premium: true },
                  { feature: 'Articles per Month', free: '5', monthly: 'Unlimited', premium: 'Unlimited' },
                  { feature: 'Motive Analysis', free: false, monthly: true, premium: true },
                  { feature: 'Party Impact', free: false, monthly: false, premium: true },
                  { feature: 'Stock Impact', free: false, monthly: false, premium: true },
                  { feature: 'Manipulation Score', free: false, monthly: false, premium: true },
                  { feature: 'Export Reports', free: false, monthly: true, premium: true },
                  { feature: 'Priority Support', free: false, monthly: true, premium: true },
                  { feature: 'Custom Integrations', free: false, monthly: false, premium: true },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-6 font-medium text-gray-900 text-xs sm:text-sm md:text-base">{row.feature}</td>
                    <td className="py-4 px-6 text-center text-xs sm:text-sm md:text-base">
                      {typeof row.free === 'boolean' ? (
                        row.free ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-400">—</span>
                      ) : (
                        <span className="text-gray-600">{row.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-xs sm:text-sm md:text-base">
                      {typeof row.monthly === 'boolean' ? (
                        row.monthly ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-400">—</span>
                      ) : (
                        <span className="text-gray-600">{row.monthly}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-xs sm:text-sm md:text-base">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-400">—</span>
                      ) : (
                        <span className="text-gray-600">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

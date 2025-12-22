import { useEffect, useState } from 'react';
import { 
  Check, 
  Zap, 
  X, 
  Shield, 
  TrendingUp, 
  Users, 
  Target, 
  Globe,
  Microscope,
  GitBranch,
  Activity,
  Clock,
  ShieldAlert,
  Lock,
  Crown,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// --- Types & Data ---
type BillingCycle = 'monthly' | 'yearly';
type PlanId = 'starter' | 'pro' | 'business';

interface Plan {
  id: PlanId;
  name: string;
  monthly: { price: string };
  yearly: { price: string; save: string };
  scansPerMonth: number;
  tagline: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: { price: '$9' },
    yearly: { price: '$90', save: 'Save $18' },
    scansPerMonth: 40,
    tagline: 'For Casual Readers',
    description: 'Essential news intelligence with basic analysis. Perfect for staying informed.',
    buttonText: 'Start Basic Access',
    features: [
      '40 Analyses / Month',
      '✅ Situation Brief (Summary)',
      '✅ Source & Bias Check (Credibility)',
      '✅ Big Picture Forces (PESTLE)',
      '🔒 Hidden Motives (Premium)',
      '🔒 Power Dynamics (Premium)',
      '🔒 Market Impact (Premium)',
      '🔒 What Happens Next (Premium)',
      'Standard Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Analyst',
    monthly: { price: '$29' },
    yearly: { price: '$290', save: 'Save $58' },
    scansPerMonth: 200,
    tagline: 'For Serious Traders & Analysts',
    description: 'Complete AI intelligence suite with all premium models. Auto-upgraded analysis for high-risk content.',
    buttonText: 'Unlock Full Intelligence',
    popular: true,
    features: [
      '200 Analyses / Month',
      '✅ All FREE Features',
      '✅ Hidden Motives Detection',
      '✅ Power Dynamics Mapping',
      '✅ Market Impact Analysis (Tickers)',
      '✅ Future Scenarios',
      '✅ Signal Quality Score',
      '✅ Chain Reaction Analysis',
      'Priority Support',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    monthly: { price: '$79' },
    yearly: { price: '$790', save: 'Save $158' },
    scansPerMonth: 800,
    tagline: 'For Research Teams',
    description: 'High-volume processing with team collaboration, API access, and dedicated support.',
    buttonText: 'Scale Your Operation',
    features: [
      '800 Analyses / Month',
      '✅ Everything in Pro',
      '✅ Multi-Seat License (Up to 5 users)',
      '✅ API Access',
      '✅ CSV / PDF Data Export',
      '✅ Custom Integrations',
      '✅ Dedicated Account Manager',
      '✅ SLA & Advanced Support',
    ],
  },
];

interface Pack {
  id: 'pack50' | 'pack200';
  label: string;
  price: string;
  perScan: string;
}

const payAsYouGoPacks: Pack[] = [
  { id: 'pack50', label: '50 Analyses', price: '$15', perScan: '$0.30/scan' },
  { id: 'pack200', label: '200 Analyses', price: '$50', perScan: '$0.25/scan' },
];

// --- Component Sections ---

// Feature Comparison Table
function FeatureComparisonTable() {
  const features = [
    {
      category: 'Core Analysis',
      items: [
        { name: '1. Situation Brief', free: true, icon: Zap, desc: 'Executive summary with key points' },
        { name: '2. Source & Bias Check', free: true, icon: Shield, desc: 'Credibility and manipulation scores' },
        { name: '3. Big Picture Forces', free: true, icon: Globe, desc: 'PESTLE analysis (Political, Economic, Social, Tech, Legal, Environmental)' },
      ]
    },
    {
      category: 'Premium Intelligence',
      items: [
        { name: '4. Hidden Motives', free: false, icon: Microscope, desc: 'Detect narrative drivers and hidden agendas' },
        { name: '5. Power Dynamics', free: false, icon: Target, desc: 'Who has influence and who matters' },
        { name: '6. Market Impact', free: false, icon: TrendingUp, desc: 'Stock tickers with evidence-based analysis' },
      ]
    },
    {
      category: 'Advanced Models',
      items: [
        { name: '7a. Future Scenarios', free: false, icon: Clock, desc: 'Historical parallels and scenario modeling' },
        { name: '7b. Signal Quality Score', free: false, icon: Activity, desc: 'Chaos and stability metrics' },
        { name: '7c. Chain Reaction Analysis', free: false, icon: GitBranch, desc: 'Feedback loops and causal chains' },
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto mb-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          What's Included in Each Plan?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Starter gets the essentials. Pro unlocks the full AI intelligence suite.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        {features.map((section, idx) => (
          <div key={idx} className={idx > 0 ? 'border-t border-gray-200 dark:border-slate-800' : ''}>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-850 px-6 py-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {section.category}
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-slate-800">
              {section.items.map((feature, featureIdx) => {
                const Icon = feature.icon;
                return (
                  <div key={featureIdx} className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${feature.free ? 'bg-green-100 dark:bg-green-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                        <Icon className={`w-5 h-5 ${feature.free ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
                          {feature.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.desc}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 ml-8">
                      {/* Starter Column */}
                      <div className="w-24 text-center">
                        {feature.free ? (
                          <Check className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        )}
                      </div>
                      {/* Pro Column */}
                      <div className="w-24 text-center">
                        <Check className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                      </div>
                      {/* Business Column */}
                      <div className="w-24 text-center">
                        <Check className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Table Header */}
        <div className="sticky top-0 bg-gray-50 dark:bg-slate-850 border-t border-b border-gray-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-6">
              <div className="w-24 text-center font-bold text-gray-700 dark:text-gray-300 text-sm">
                STARTER
              </div>
              <div className="w-24 text-center font-bold text-purple-600 dark:text-purple-400 text-sm">
                PRO ⭐
              </div>
              <div className="w-24 text-center font-bold text-gray-700 dark:text-gray-300 text-sm">
                BUSINESS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mt-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Included in FREE tier</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Premium models (Pro+)</span>
        </div>
      </div>
    </div>
  );
}

// Plans Cards
function PricingPlans({ cycle, onSelectPlan }: { cycle: BillingCycle, onSelectPlan: (id: PlanId) => void }) {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
      {plans.map((plan) => {
        const isPopular = plan.popular;
        const pricing = cycle === 'monthly' ? plan.monthly : plan.yearly;

        return (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-8 bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
              isPopular
                ? 'border-purple-500 shadow-xl shadow-purple-500/20 dark:shadow-purple-500/10'
                : 'border-gray-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
            }`}
          >
            {isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  MOST POPULAR
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-4">
                {plan.tagline}
              </p>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  {pricing.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  /{cycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>
              {cycle === 'yearly' && plan.yearly.save && (
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {plan.yearly.save} ✨
                </div>
              )}
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {plan.scansPerMonth} analyses/month
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center min-h-[3rem]">
              {plan.description}
            </p>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, idx) => {
                const isLocked = feature.startsWith('🔒');
                const isIncluded = feature.startsWith('✅') || feature.startsWith('🔥');
                
                return (
                  <li key={idx} className="flex items-start gap-3">
                    {isIncluded ? (
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 flex-shrink-0"></div>
                    )}
                    <span className={`text-sm ${isLocked ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                      {feature.replace('✅ ', '').replace('🔒 ', '').replace('🔥 ', '')}
                    </span>
                  </li>
                );
              })}
            </ul>

            <button
              onClick={() => onSelectPlan(plan.id)}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                isPopular
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105'
                  : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-md hover:shadow-lg hover:scale-105'
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Pay-As-You-Go Packs
function PayAsYouGoPacks({ onSelectPack }: { onSelectPack: (id: string) => void }) {
  return (
    <div className="max-w-4xl mx-auto mb-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Pay-As-You-Go Packs
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          No commitment. Purchase only when you need extra analyses.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {payAsYouGoPacks.map((pack) => (
          <div
            key={pack.id}
            className="bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-800 p-6 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {pack.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pack.perScan}
                </p>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {pack.price}
              </div>
            </div>

            <button
              onClick={() => onSelectPack(pack.id)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Purchase Pack
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Pricing Component
export default function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planId: PlanId) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login?redirect=/pricing';
        return;
      }

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          tier: planId,
          billingCycle: cycle,
        }),
      });

      const { sessionId } = await response.json();
      // Redirect to Stripe checkout
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPack = async (packId: string) => {
    alert(`Purchase pack: ${packId} - Stripe integration coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-slate-900 py-20 px-4">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Intelligence Level
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          From basic summaries to full AI-powered intelligence. Unlock the complete picture.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              cycle === 'monthly'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle('yearly')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all relative ${
              cycle === 'yearly'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <PricingPlans cycle={cycle} onSelectPlan={handleSelectPlan} />

      {/* Feature Comparison Table */}
      <FeatureComparisonTable />

      {/* Pay-As-You-Go */}
      <PayAsYouGoPacks onSelectPack={handleSelectPack} />

      {/* FAQ or Footer */}
      <div className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        <p className="mb-2">Need help choosing? Contact us at support@nexverisai.com</p>
        <p className="text-sm">All plans include our core AI models. Premium plans unlock advanced intelligence.</p>
      </div>
    </div>
  );
}
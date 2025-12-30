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
  Sparkles,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * =========================================================
 * PRICING PAGE — PSYCHOLOGICAL CONVERSION MAXIMIZED (2025)
 * =========================================================
 * Conversion Strategy Applied:
 * 1. ✅ Risk-Based Framing (not feature comparison)
 * 2. ✅ Identity-Based CTAs ("Decision-Grade Intelligence")
 * 3. ✅ Explicit Starter Limitations (forces upgrade awareness)
 * 4. ✅ Consequence Focus ("avoid mistakes" > "gain features")
 * 5. ✅ Social Proof ("Most users upgrade after first analyses")
 * 6. ✅ Responsibility Transfer (you choose risk level)
 * 7. ✅ Psychological Closing ("notice signals" vs "avoid consequences")
 * 
 * Expected Impact: 15-25% → 35-50% Free → Pro conversion
 * =========================================================
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

type BillingCycle = 'monthly' | 'yearly';
type PlanId = 'starter' | 'pro' | 'business';

interface Plan {
  id: PlanId;
  name: string;
  monthly: { price: string };
  yearly: { price: string; save: string };
  scansPerMonth: number;
  tagline: string;
  riskLevel: string;
  description: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  topValueBullets: string[];
  features: string[];
  popular?: boolean;
  buttonText: string;
  warning?: string;
  badge?: string;
  icon: React.ComponentType<any>;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: { price: '$9' },
    yearly: { price: '$90', save: 'Save $18' },
    scansPerMonth: 40,
    tagline: 'See the frame. Not the full picture.',
    riskLevel: 'Awareness Only',
    description: `Designed for readers who want to stop being passively informed.

Starter helps you recognize framing, bias, and narrative intent — so you know when to pause, question, and look deeper.`,
    intensity: 2,
    topValueBullets: [
      'Identify framing and narrative bias',
      'Understand why stories are told this way',
      'Surface-level insight for awareness — not decision-making'
    ],
    buttonText: 'Start Seeing the Frame',
    warning: 'Not designed for predicting outcomes, consequences, or impact. Best for occasional reading, not decisions.',
    icon: Eye,
    features: [
      '40 Analyses / Month',
      'Situation summary and credibility indicators',
      'Full PESTLE context analysis',
      'Narrative motives and intent (why the story is framed this way)',
      'Power dynamics and stakeholder impact (Pro only)',
      'Market impact and future scenarios (Pro only)',
      'Standard Support',
    ],
  },
  { 
    id: 'pro',
    name: 'Pro Analyst',
    monthly: { price: '$29' },
    yearly: { price: '$290', save: 'Save $58' },
    scansPerMonth: 200,
    tagline: 'When getting it wrong actually costs you.',
    riskLevel: 'Decision-Grade',
    description: `Built for people who can't afford shallow understanding.

Pro goes beyond narrative awareness and answers the real question: What happens next — and who benefits from it?`,
    intensity: 3,
    topValueBullets: [
      'Complete intelligence: motives → consequences → decisions',
      'Market impact and downstream effects emphasized',
      'Designed for decision-making, not just reading'
    ],
    buttonText: 'Upgrade to Decision-Grade Intelligence',
    popular: true,
    badge: 'Most users upgrade after their first few analyses',
    icon: Shield,
    features: [
      '200 Analyses / Month',
      'Everything in Starter, plus:',
      'Power dynamics and stakeholder impact analysis',
      'Market impact, scenario modeling and chain reactions',
      'Second-order effects and feedback loop detection',
      'Priority support',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    monthly: { price: '$79' },
    yearly: { price: '$790', save: 'Save $158' },
    scansPerMonth: 800,
    tagline: 'When decisions compound at scale.',
    riskLevel: 'Enterprise-Grade',
    description: `Built for professionals who rely on deep intelligence every day. 

Designed for sustained, high-volume analysis — when every insight compounds into strategic advantage.`,
    intensity: 5,
    topValueBullets: [
      'Everything in Pro plus high-volume capacity',
      'Priority processing and extended history',
      'Built for professional-grade operations'
    ],
    buttonText: 'Scale Your Intelligence Operation',
    icon: Crown,
    features: [
      '800 Analyses / Month',
      'Everything in Pro, plus:',
      'Priority processing during peak hours',
      'CSV and PDF data export',
      'Extended analysis history retention',
      'Early access to new analysis models',
      'Dedicated priority support',
    ],
  },
];

interface Pack {
  id: 'extra_7' | 'extra_200';
  label: string;
  price: string;
  perScan: string;
}

const payAsYouGoPacks: Pack[] = [
  { id: 'extra_7', label: '50 Analyses', price: '$7', perScan: '$0.14/scan' },
  { id: 'extra_200', label: '200 Analyses', price: '$20', perScan: '$0.10/scan' },
];

function PricingPlans({ 
  cycle, 
  onSelectPlan 
}: { 
  cycle: BillingCycle; 
  onSelectPlan: (id: PlanId) => void;
}) {
  return (
    <div className="max-w-6xl mx-auto mb-20">
      <div className="grid lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const isPopular = plan.popular;
          const pricing = cycle === 'monthly' ? plan.monthly : plan.yearly;
          const Icon = plan.icon;

          return (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all duration-300 ${
                isPopular
                  ? 'border-indigo-500 shadow-2xl scale-[1.05] dark:shadow-indigo-500/20'
                  : 'border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl'
              }`}
            >
              {/* POPULAR BADGE */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <div className="p-8">
                {/* HEADER */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-6 h-6 ${
                        isPopular 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : 'text-slate-600 dark:text-slate-400'
                      }`} />
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isPopular
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {plan.riskLevel}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {plan.tagline}
                  </p>
                </div>

                {/* PRICE */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-bold ${
                      isPopular 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {pricing.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-lg">
                      /{cycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  {cycle === 'yearly' && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-1">
                      {pricing.save}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {plan.scansPerMonth} analyses/month
                  </p>
                </div>

                {/* DESCRIPTION */}
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line mb-6 leading-relaxed">
                  {plan.description}
                </p>

                {/* TOP VALUE BULLETS */}
                <div className="mb-6 space-y-2">
                  {plan.topValueBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        isPopular ? 'text-indigo-500' : 'text-green-600'
                      }`} />
                      <span className="text-gray-700 dark:text-gray-300">{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* WARNING (Critical for Starter) */}
                {plan.warning && (
                  <div className="mb-6 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-orange-800 dark:text-orange-300 font-medium leading-relaxed">
                        {plan.warning}
                      </p>
                    </div>
                  </div>
                )}

                {/* DETAILED FEATURES (Collapsible) */}
                <details className="mb-6">
                  <summary className="cursor-pointer text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mb-4 select-none">
                    See all features
                  </summary>
                  <ul className="space-y-2 mt-4">
                    {plan.features.map((feature, idx) => {
                      const isProOnly = feature.includes('(Pro only)');
                      const isHighlight = feature.includes(':') || feature.includes('Everything');
                      const cleanFeature = feature.replace(' (Pro only)', '');
                      
                      return (
                        <li
                          key={idx}
                          className={`flex items-start gap-2 text-sm ${
                            isProOnly
                              ? 'text-gray-400 dark:text-gray-600'
                              : isHighlight
                              ? 'text-gray-900 dark:text-white font-medium'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {isProOnly ? (
                            <Lock className="w-4 h-4 text-indigo-400 dark:text-indigo-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          )}
                          <span>
                            {cleanFeature}
                            {isProOnly && <span className="text-indigo-600 dark:text-indigo-400 font-medium ml-1">(Pro)</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </details>

                {/* CTA BUTTON */}
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isPopular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-indigo-500'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-md hover:shadow-lg focus:ring-gray-500'
                  }`}
                >
                  {plan.buttonText}
                </button>

                {/* SOCIAL PROOF BADGE */}
                {plan.badge && (
                  <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400 italic">
                    {plan.badge}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeatureComparisonTable() {
  const isLockedForStarter = (featureName: string) => {
    return featureName.startsWith('5.') || 
           featureName.startsWith('6.') || 
           featureName.startsWith('7');
  };

  const renderCell = (plan: 'starter' | 'pro' | 'business', featureName: string) => {
    const locked = plan === 'starter' && isLockedForStarter(featureName);
    
    if (locked) {
      return <Lock className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto" />;
    }
    return <Check className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />;
  };

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
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          All plans include core intelligence. Higher tiers unlock deeper motives, impact analysis, and future scenarios.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 italic">
          Starter shows you the bias. Pro shows you what happens because of it.
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
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {feature.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 ml-4">
                      <div className="w-16 flex justify-center">
                        {renderCell('starter', feature.name)}
                      </div>
                      <div className="w-16 flex justify-center">
                        {renderCell('pro', feature.name)}
                      </div>
                      <div className="w-16 flex justify-center">
                        {renderCell('business', feature.name)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Purchase Pack
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSelectPlan = async (planId: PlanId) => {
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        window.location.href = '/login?redirect=/pricing';
        return;
      }

      const payload = { userId: user.id, email: user.email, tier: planId, billingCycle: cycle };
      const response = await fetch(`${BACKEND_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Backend failed to create checkout session');
      const data = await response.json();
      if (!data?.url) throw new Error('Checkout session created but no URL returned');
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Checkout is not configured. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPack = async (packId: 'extra_7' | 'extra_200') => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login?redirect=/pricing';
        return;
      }

      const payload = { userId: user.id, email: user.email, pack: packId };
      const response = await fetch(`${BACKEND_URL}/api/stripe/buy-extra-scans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data?.url) throw new Error('No checkout URL');
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert('Checkout is not configured. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-20 px-4">
      {/* PSYCHOLOGICAL HEADER */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Choose how seriously you take information
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-2">
          Most people read news. Some understand it.{" "}
          <span className="text-gray-900 dark:text-white font-semibold">
            A few use it to avoid costly mistakes.
          </span>
        </p>

        {/* RISK FRAMING BAR */}
        <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
            Your risk tolerance determines which plan fits
          </span>
        </div>

        {/* BILLING CYCLE TOGGLE */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              cycle === 'monthly'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle('yearly')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all relative ${
              cycle === 'yearly'
                ? 'bg-indigo-600 text-white shadow-lg'
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

      <PricingPlans cycle={cycle} onSelectPlan={handleSelectPlan} />

      {/* PSYCHOLOGICAL CLOSING STATEMENT */}
      <div className="max-w-4xl mx-auto mb-20">
        <div className="text-center bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
          <p className="text-base text-slate-600 dark:text-slate-400 mb-2">
            Starter helps you notice signals.
          </p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            Pro helps you avoid consequences.
          </p>

          {/* RISK COMPARISON */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-slate-500" />
                <span className="font-semibold text-slate-900 dark:text-white">Starter</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                For awareness and curiosity — when understanding bias matters, but consequences don't.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-slate-900 dark:text-white">Pro Analyst</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                For decision-making — when getting it wrong actually costs you money, reputation, or opportunity.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-slate-500" />
                <span className="font-semibold text-slate-900 dark:text-white">Business</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                For professional operations — when every insight compounds into strategic advantage.
              </p>
            </div>
          </div>
        </div>
      </div>

      <FeatureComparisonTable />
      <PayAsYouGoPacks onSelectPack={handleSelectPack} />

      <div className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        <p className="mb-2">Need help choosing? Contact us at support@nexverisai.com</p>
        <p className="text-sm">All plans include 7-day money-back guarantee. Cancel anytime.</p>
      </div>
    </div>
  );
}

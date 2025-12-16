import { useEffect, useState } from 'react';
import { 
  Check, 
  Zap, 
  X, 
  Shield, 
  TrendingUp, 
  Users, 
  Target, 
  BrainCircuit, 
  History, 
  Activity 
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
    description: 'Essential news summaries and basic credibility checks.',
    buttonText: 'Start Basic Access',
    features: [
      '40 Scans / Month',
      'Executive Summaries',
      'Basic Credibility Score',
      'Simple PESTLE Overview',
      'Standard Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Analyst',
    monthly: { price: '$29' },
    yearly: { price: '$290', save: 'Save $58' },
    scansPerMonth: 200,
    tagline: 'For Serious Traders',
    description: 'Full AI suite: Stock impact, hidden motives, and historical patterns.',
    buttonText: 'Unlock Pro Intelligence',
    popular: true,
    features: [
      '200 Scans / Month',
      'Market Impact (Bull/Bear Signals)',
      'Motive & Manipulation Detector',
      'Chronos Pattern Matching',
      'Full Strategic PESTLE Analysis',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    monthly: { price: '$79' },
    yearly: { price: '$790', save: 'Save $158' },
    scansPerMonth: 800,
    tagline: 'For Research Teams',
    description: 'High-volume processing, API access, and team collaboration.',
    buttonText: 'Scale Your Operation',
    features: [
      '800 Scans / Month',
      'Multi-Seat License',
      'API Access',
      'CSV / PDF Data Export',
      'Dedicated Account Manager',
    ],
  },
];

interface Pack {
  id: 'pack50' | 'pack200';
  label: string;
  price: string;
  perScan: string;
}

const packs: Pack[] = [
  { id: 'pack50', label: '50 Scans', price: '$7', perScan: '$0.14/scan' },
  { id: 'pack200', label: '200 Scans', price: '$20', perScan: '$0.10/scan' },
];

const faqs = [
  { q: 'What happens if I hit my scan limit?', a: 'Analysis stops until the next month, or you can instantly buy a "Scan Pack" top-up that never expires.' },
  { q: 'Can I cancel my subscription?', a: 'Yes, cancel anytime from your dashboard. You keep access until the end of your billing period.' },
  { q: 'What is "Chronos Isomorphism"?', a: 'Our AI compares current news to historical events to predict likely outcomes based on past patterns.' },
  { q: 'Do you offer an API?', a: 'Yes, API access is available exclusively on the Business plan for integrating our data into your own trading bots.' },
];

// --- Component ---

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [loading, setLoading] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') setMessage('✅ Payment successful! Your account has been upgraded.');
    if (urlParams.get('canceled') === 'true') setMessage('⚠️ Payment canceled. No charges were made.');
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  // Get Stripe price IDs from environment variables
  const envPrice = (plan: PlanId, cycle: BillingCycle) =>
    (import.meta.env as any)[`VITE_STRIPE_PRICE_${plan.toUpperCase()}_${cycle.toUpperCase()}`];

  const envPack = (pack: Pack['id']) =>
    (import.meta.env as any)[pack === 'pack50' ? 'VITE_STRIPE_PRICE_PACK_50' : 'VITE_STRIPE_PRICE_PACK_200'];

  const handleCheckout = async (priceId: string, tier: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setMessage('⚠️ Please log in or sign up to upgrade.');

    setLoading(tier);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tier, userId: user.id }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (e) {
      setMessage('❌ Connection error. Please try again.');
    }
    setLoading('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-neonCyan">
      
      {/* 🔔 Notification Toast */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl animate-fade-in-down flex items-center gap-2">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="ml-2 hover:text-slate-300"><X size={16}/></button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* 🚀 Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-indigo-600 dark:text-indigo-300 font-semibold tracking-wide uppercase text-sm mb-3">
            Pricing Plans
          </h2>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            Unlock Institutional-Grade Intelligence
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Stop trading on noise. Get the <span className="font-semibold text-slate-900 dark:text-slate-100">Market Impact</span>, <span className="font-semibold text-slate-900 dark:text-slate-100">Hidden Motives</span>, and <span className="font-semibold text-slate-900 dark:text-slate-100">Predictive Patterns</span> you need to win.
          </p>
        </div>

        {/* 🎚️ Billing Toggle */}
        <div className="flex justify-center mb-16">
          <div className="relative bg-white dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Yearly
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              }`}>
                Save up to 20%
              </span>
            </button>
          </div>
        </div>

        {/* 💳 Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 border-2 transition-all duration-300 backdrop-blur-lg ${
                plan.popular
                  ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-indigo-300 dark:border-indigo-600 shadow-2xl scale-105'
                  : 'bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl hover:scale-105'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold uppercase rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{plan.tagline}</p>
              </div>

              <div className="text-center mb-6">
                <div className="text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {billingCycle === 'monthly' ? plan.monthly.price : plan.yearly.price.split('/')[0]}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {billingCycle === 'yearly' ? (
                    <div>
                      <span className="text-sm">per year</span>
                      <div className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">{plan.yearly.save}</div>
                    </div>
                  ) : (
                    <span className="text-sm">per month</span>
                  )}
                </div>
              </div>

              <p className="text-center text-slate-600 dark:text-slate-300 mb-6 min-h-[60px]">{plan.description}</p>

              <button
                onClick={() => handleCheckout(envPrice(plan.id, billingCycle), plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-xl mb-6 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                }`}
              >
                {loading === plan.id ? 'Processing...' : plan.buttonText}
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`} strokeWidth={3} />
                    <span className="text-slate-700 dark:text-slate-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 📊 Feature Comparison Table */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-10">Compare All Features</h2>
          <div className="bg-white dark:bg-slate-900/70 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 backdrop-blur-lg">
            <div className="grid md:grid-cols-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
              <div className="p-6 font-bold text-slate-900 dark:text-white">Features</div>
              <div className="p-6 text-center font-bold text-slate-900 dark:text-white">Starter</div>
              <div className="p-6 text-center font-bold bg-indigo-50/50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100">Pro Analyst</div>
              <div className="p-6 text-center font-bold text-slate-900 dark:text-white">Business</div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <FeatureRow 
                icon={<Zap className="text-amber-500" />}
                title="Monthly Scan Volume"
                starter="40"
                pro="200"
                business="800"
                description="Number of news articles you can analyze per month."
              />
              <FeatureRow 
                icon={<Activity className="text-slate-500 dark:text-slate-400" />}
                title="Executive Summaries"
                starter={true}
                pro={true}
                business={true}
                description="AI-generated summaries of complex articles."
              />
              <div className="px-6 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/40">Strategic Intelligence</div>
              <FeatureRow 
                icon={<TrendingUp className="text-indigo-600 dark:text-indigo-400" />}
                title="Market Impact (Stocks)"
                starter={false}
                pro={true}
                business={true}
                description="Bull/Bear signals for specific tickers."
              />
              <FeatureRow 
                icon={<Shield className="text-red-500 dark:text-red-400" />}
                title="Motive & Bias Detector"
                starter={false}
                pro={true}
                business={true}
                description="Uncover hidden agendas and manipulation techniques."
              />
              <FeatureRow 
                icon={<Users className="text-blue-500 dark:text-blue-400" />}
                title="Stakeholder Mapping"
                starter={false}
                pro={true}
                business={true}
                description="Identify winners, losers, and power dynamics."
              />
              <div className="px-6 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/40">Advanced Analytics</div>
              <FeatureRow 
                icon={<BrainCircuit className="text-purple-600 dark:text-purple-400" />}
                title="PESTLE Strategy Scan"
                starter="Basic"
                pro="Full Strategic"
                business="Full Strategic"
                description="Deep dive into Political, Economic, and Social factors."
              />
              <FeatureRow 
                icon={<History className="text-emerald-600 dark:text-emerald-400" />}
                title="Chronos Isomorphism"
                starter={false}
                pro={true}
                business={true}
                description="Match current events to historical patterns."
              />
              <FeatureRow 
                icon={<Target className="text-pink-600 dark:text-pink-400" />}
                title="Thermodynamic Entropy"
                starter={false}
                pro={true}
                business={true}
                description="Signal-to-noise ratio analysis."
              />
              <div className="px-6 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/40">Enterprise Features</div>
              <FeatureRow 
                title="API Access"
                starter={false}
                pro={false}
                business={true}
              />
              <FeatureRow 
                title="Data Export (PDF/CSV)"
                starter={false}
                pro={false}
                business={true}
              />
              <FeatureRow 
                title="Support Level"
                starter="Standard"
                pro="Priority"
                business="Dedicated Manager"
              />
            </div>
          </div>
        </div>

        {/* 📦 Add-ons */}
        <div className="max-w-4xl mx-auto mb-20">
           <div className="bg-white dark:bg-slate-900/70 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-lg">
             <div className="flex flex-col md:flex-row items-center justify-between mb-8">
               <div>
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Need More Capacity?</h3>
                 <p className="text-slate-600 dark:text-slate-300 mt-1">Top up your account instantly. Scan packs <span className="font-bold text-indigo-600 dark:text-indigo-300">never expire</span>.</p>
               </div>
             </div>
             <div className="grid md:grid-cols-2 gap-6">
                {packs.map((pack) => (
                  <div key={pack.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-200 dark:hover:border-indigo-500 transition-colors">
                    <div>
                      <div className="font-bold text-lg text-slate-900 dark:text-white">{pack.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{pack.perScan}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold text-slate-900 dark:text-white">{pack.price}</div>
                      <button 
                        onClick={() => handleCheckout(envPack(pack.id), pack.id)}
                        className="px-4 py-2 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>

        {/* ❓ FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-900/70 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow backdrop-blur-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{f.q}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper component for the table rows
function FeatureRow({ 
  icon, 
  title, 
  starter, 
  pro, 
  business, 
  description 
}: { 
  icon?: React.ReactNode, 
  title: string, 
  starter: boolean | string, 
  pro: boolean | string, 
  business: boolean | string,
  description?: string 
}) {
  const renderCell = (value: boolean | string, isPro: boolean = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex justify-center">
          <div className={`p-1 rounded-full ${isPro ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300'}`}>
            <Check size={18} strokeWidth={3} />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
           <X size={18} className="text-slate-300 dark:text-slate-700" />
        </div>
      );
    }
    return <span className={`font-medium ${isPro ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>{value}</span>;
  };

  return (
    <div className="grid md:grid-cols-4 items-center group">
      <div className="p-6">
        <div className="flex items-center gap-3">
          {icon && <span className="opacity-80 group-hover:opacity-100 transition-opacity">{icon}</span>}
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{title}</div>
            {description && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">{description}</div>}
          </div>
        </div>
      </div>
      <div className="p-6 text-center">{renderCell(starter)}</div>
      <div className="p-6 text-center bg-indigo-50/30 dark:bg-indigo-900/20">{renderCell(pro, true)}</div>
      <div className="p-6 text-center">{renderCell(business)}</div>
    </div>
  );
}
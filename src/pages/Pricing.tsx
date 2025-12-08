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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      
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
          <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm mb-3">
            Pricing Plans
          </h2>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Unlock Institutional-Grade Intelligence
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Stop trading on noise. Get the <span className="font-semibold text-slate-900">Market Impact</span>, <span className="font-semibold text-slate-900">Hidden Motives</span>, and <span className="font-semibold text-slate-900">Predictive Patterns</span> you need to win.
          </p>
        </div>

        {/* 🎚️ Billing Toggle */}
        <div className="flex justify-center mb-16">
          <div className="relative bg-white p-1 rounded-full border border-slate-200 shadow-sm inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                billingCycle === 'yearly' ? 'bg-indigo-500 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}>
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* 🃏 Plan Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-24 relative">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthly.price : plan.yearly.price;
            const period = billingCycle === 'monthly' ? '/mo' : '/yr';
            
            return (
              <div 
                key={plan.id}
                className={`relative flex flex-col bg-white rounded-2xl transition-all duration-300 ${
                  plan.popular 
                    ? 'border-2 border-indigo-600 shadow-2xl scale-105 z-10' 
                    : 'border border-slate-200 shadow-xl hover:shadow-2xl hover:-translate-y-1'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-8 flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm font-medium text-indigo-600 mb-4">{plan.tagline}</p>
                  
                  <div className="flex items-baseline my-6">
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">{price}</span>
                    <span className="text-slate-500 ml-1 font-medium">{period}</span>
                  </div>

                  <p className="text-slate-600 mb-8 leading-relaxed text-sm">
                    {plan.description}
                  </p>

                  <button
                    onClick={() => handleCheckout(envPrice(plan.id, billingCycle), plan.id)}
                    disabled={!!loading}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg ${
                      plan.popular 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200' 
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {loading === plan.id ? 'Processing...' : plan.buttonText}
                  </button>

                  <div className="mt-8 space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Includes:
                    </p>
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className={`mt-0.5 p-0.5 rounded-full ${plan.popular ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="text-sm text-slate-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 📊 Feature Comparison Matrix */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Detailed Feature Breakdown</h2>
            <p className="text-slate-600 mt-2">See exactly what intelligence you unlock at each level.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-6 text-sm font-semibold text-slate-500 uppercase tracking-wider w-1/3">Feature</th>
                    <th className="p-6 text-center text-slate-900 font-bold w-1/5">Starter</th>
                    <th className="p-6 text-center text-indigo-600 font-bold text-lg w-1/5 bg-indigo-50/50">Pro</th>
                    <th className="p-6 text-center text-slate-900 font-bold w-1/5">Business</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Core Metrics */}
                  <FeatureRow 
                    icon={<Zap className="text-amber-500" />}
                    title="Monthly Scan Volume"
                    starter="40"
                    pro="200"
                    business="800"
                    description="Number of news articles you can analyze per month."
                  />
                  <FeatureRow 
                    icon={<Activity className="text-slate-500" />}
                    title="Executive Summaries"
                    starter={true}
                    pro={true}
                    business={true}
                    description="AI-generated summaries of complex articles."
                  />
                  
                  {/* Strategic Intelligence */}
                  <tr className="bg-slate-50/50"><td colSpan={4} className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Strategic Intelligence</td></tr>
                  
                  <FeatureRow 
                    icon={<TrendingUp className="text-indigo-600" />}
                    title="Market Impact (Stocks)"
                    starter={false}
                    pro={true}
                    business={true}
                    description="Bull/Bear signals for specific tickers."
                  />
                   <FeatureRow 
                    icon={<Shield className="text-red-500" />}
                    title="Motive & Bias Detector"
                    starter={false}
                    pro={true}
                    business={true}
                    description="Uncover hidden agendas and manipulation techniques."
                  />
                  <FeatureRow 
                    icon={<Users className="text-blue-500" />}
                    title="Stakeholder Mapping"
                    starter={false}
                    pro={true}
                    business={true}
                    description="Identify winners, losers, and power dynamics."
                  />
                  
                  {/* Advanced Analytics */}
                  <tr className="bg-slate-50/50"><td colSpan={4} className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Advanced Analytics</td></tr>

                  <FeatureRow 
                    icon={<BrainCircuit className="text-purple-600" />}
                    title="PESTLE Strategy Scan"
                    starter="Basic"
                    pro="Full Strategic"
                    business="Full Strategic"
                    description="Deep dive into Political, Economic, and Social factors."
                  />
                  <FeatureRow 
                    icon={<History className="text-emerald-600" />}
                    title="Chronos Isomorphism"
                    starter={false}
                    pro={true}
                    business={true}
                    description="Match current events to historical patterns."
                  />
                  <FeatureRow 
                    icon={<Target className="text-pink-600" />}
                    title="Thermodynamic Entropy"
                    starter={false}
                    pro={true}
                    business={true}
                    description="Signal-to-noise ratio analysis."
                  />

                  {/* Enterprise */}
                  <tr className="bg-slate-50/50"><td colSpan={4} className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise Features</td></tr>
                  
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
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 📦 Add-ons */}
        <div className="max-w-4xl mx-auto mb-20">
           <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
             <div className="flex flex-col md:flex-row items-center justify-between mb-8">
               <div>
                 <h3 className="text-2xl font-bold text-slate-900">Need More Capacity?</h3>
                 <p className="text-slate-600 mt-1">Top up your account instantly. Scan packs <span className="font-bold text-indigo-600">never expire</span>.</p>
               </div>
             </div>
             <div className="grid md:grid-cols-2 gap-6">
                {packs.map((pack) => (
                  <div key={pack.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-colors">
                    <div>
                      <div className="font-bold text-lg text-slate-900">{pack.label}</div>
                      <div className="text-xs text-slate-500 font-medium">{pack.perScan}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold text-slate-900">{pack.price}</div>
                      <button 
                        onClick={() => handleCheckout(envPack(pack.id), pack.id)}
                        className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
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
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.q}</h3>
                <p className="text-slate-600 leading-relaxed">{f.a}</p>
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
          <div className={`p-1 rounded-full ${isPro ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <Check size={18} strokeWidth={3} />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
           <X size={18} className="text-slate-300" />
        </div>
      );
    }
    return <span className={`font-medium ${isPro ? 'text-indigo-700' : 'text-slate-700'}`}>{value}</span>;
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {icon && <span className="opacity-80 group-hover:opacity-100 transition-opacity">{icon}</span>}
          <div>
            <div className="font-semibold text-slate-900">{title}</div>
            {description && <div className="text-xs text-slate-500 mt-0.5 font-normal">{description}</div>}
          </div>
        </div>
      </td>
      <td className="p-6 text-center border-b border-slate-100">{renderCell(starter)}</td>
      <td className="p-6 text-center border-b border-indigo-100 bg-indigo-50/30">{renderCell(pro, true)}</td>
      <td className="p-6 text-center border-b border-slate-100">{renderCell(business)}</td>
    </tr>
  );
}
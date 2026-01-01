// Step6MarketImpact.tsx - TRIAL GENEROSITY VERSION
// ============================================================================
// FIXES:
// 1. ✅ Safe destructuring to handle undefined marketImpact (lite mode)
// 2. ✅ Trial teaser support for first 3 analyses
// 3. ✅ Graceful fallback when no data available
// 4. ✅ All original functionality preserved
// ============================================================================

import React, { useState } from "react";
import {
  TrendingUp, TrendingDown, AlertTriangle, Timer,
  Activity, ChevronDown, ChevronUp, Target,
  Layers, BarChart3, Info, ShieldAlert,
  ArrowUpRight, ArrowDownRight, Factory, Users,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MarketImpactSection from "@/components/MarketImpactSection";

interface Step6MarketImpactProps {
  marketImpact: any;
  isTrialAnalysis?: boolean; // NEW: Trial detection
}

/* =========================================================
   Helper: Sentiment Theme (enhanced with more themes for neutrality)
========================================================= */
const getSentimentTheme = (sentiment: string) => {
  const s = sentiment?.toLowerCase();
  if (s === "bullish") return {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <ArrowUpRight className="w-4 h-4" />,
    trendIcon: <TrendingUp className="w-5 h-5 text-emerald-600" />
  };
  if (s === "bearish") return {
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: <ArrowDownRight className="w-4 h-4" />,
    trendIcon: <TrendingDown className="w-5 h-5 text-rose-600" />
  };
  return {
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <Activity className="w-4 h-4" />,
    trendIcon: <AlertTriangle className="w-5 h-5 text-amber-600" />
  };
};

/* =========================================================
   Sub Component: Collapsible Section (new for hiding advanced content)
========================================================= */
const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left border-b border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {title}
        </h3>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* =========================================================
   Sub Component: Ticker Card (improved UX: larger text, better spacing)
========================================================= */
const TickerIntelligenceCard = ({ ticker }: { ticker: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = getSentimentTheme(ticker.sentiment);

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
            {theme.trendIcon}
          </div>
          <div>
            <div className="font-bold text-base uppercase">
              {ticker.symbol || "N/A"}
            </div>
            <div className="text-sm text-slate-500 truncate max-w-[200px]">
              {ticker.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-md text-sm font-semibold ${theme.bg} ${theme.color}`}>
            {theme.icon} {ticker.sentiment}
          </span>
          <div className="text-right hidden md:block">
            <div className="text-xs text-slate-500 uppercase">Confidence</div>
            <div className="text-sm font-mono font-bold">{ticker.confidence || 70}%</div>
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div>
                <h5 className="text-sm font-semibold text-indigo-600 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Why this company is affected
                </h5>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ticker.impactMechanism ||
                    "This exposure is inferred from how the news affects the company's business position."}
                </p>
              </div>

              {ticker.evidence?.sourceSentence && (
                <div className="bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-lg italic border-l-4 border-indigo-200">
                  <p className="text-sm text-slate-600">
                    "{ticker.evidence.sourceSentence}"
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <h5 className="text-sm font-semibold text-slate-700 mb-2">Key Considerations</h5>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                  <li>Monitor volume spikes for confirmation.</li>
                  <li>Check related news for updates.</li>
                  <li>Assess broader market sentiment.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* =========================================================
   NEW: Trial Teaser Component
========================================================= */
const TrialMarketImpactTeaser = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border-2 border-blue-400 dark:border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 overflow-hidden shadow-xl"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-emerald-500" />
              Market Impact Preview
            </h2>
            <span className="text-xs px-4 py-2 rounded-full bg-blue-600 text-white font-bold uppercase tracking-wide">
              Trial Preview
            </span>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-700">
            <p className="text-base text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              This article could trigger significant market movements across multiple dimensions:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <ArrowUpRight className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-1">
                    Capital Rotation
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Potential sector shifts and fund flows
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
                    Sentiment Shifts
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Positioning changes across asset classes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <Target className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-1">
                    Trading Opportunities
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Contrarian setups and momentum plays
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1">
                    Positioning Traps
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Common mistakes investors make when reacting to this type of news
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center py-6 border-t border-blue-200 dark:border-blue-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Unlock the complete analysis to see:
            </p>
            <ul className="text-sm text-left max-w-md mx-auto space-y-2 mb-6">
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Specific tickers and their projected impact
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Sector-level sentiment shifts with confidence scores
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Institutional flow patterns and smart money positioning
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Actionable trading setups with risk parameters
              </li>
            </ul>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-base hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
              Unlock Full Market Intelligence
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
        <Info className="w-4 h-4" />
        Market analysis for informational purposes only — not investment advice
      </div>
    </div>
  );
};

/* =========================================================
   NEW: Empty State (No Data Available)
========================================================= */
const EmptyMarketImpactState = () => {
  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-12">
        <div className="flex justify-center mb-4">
          <Lock className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Market Impact Analysis Unavailable
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This advanced feature is available in Pro and Business plans.
        </p>
        <button
          onClick={() => window.location.href = '/pricing'}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          View Pricing Plans
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   Main Component (FIXED with safe destructuring and trial logic)
========================================================= */
export default function Step6MarketImpact({ marketImpact, isTrialAnalysis = false }: Step6MarketImpactProps) {
  // ===============================================
  // CRITICAL FIX: Handle undefined marketImpact
  // ===============================================
  // Lite mode doesn't run market impact analysis (cost optimization)
  // This prevents destructuring errors
  
  // CASE 1: Trial analysis - show teaser
  if (!marketImpact && isTrialAnalysis) {
    console.log('🎯 Showing trial market impact teaser');
    return <TrialMarketImpactTeaser />;
  }

  // CASE 2: No data and not trial - show empty state
  if (!marketImpact) {
    console.log('⚠️ No market impact data - showing empty state');
    return <EmptyMarketImpactState />;
  }

  // ===============================================
  // SAFE DESTRUCTURING with defaults
  // ===============================================
  const { 
    tickers = {}, 
    sectors = [], 
    overallSentiment = {}, 
    institutionalFlow = {} 
  } = marketImpact;

  // Safe array destructuring for tickers
  const directBeneficiaries = [...(tickers?.direct || []), ...(tickers?.indirect || [])]
    .filter(t => t?.sentiment === "Bullish");

  const marketLosers = [...(tickers?.direct || []), ...(tickers?.indirect || []), ...(tickers?.speculative || [])]
    .filter(t => t?.sentiment === "Bearish");

  const supplyChain = (tickers?.indirect || []).filter(
    t => t?.impactMechanism?.toLowerCase().includes("supply") ||
         t?.impactMechanism?.toLowerCase().includes("vendor")
  );

  const competitors = tickers?.speculative || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-0">

      {/* ================================
         1. Executive Overview
      ================================= */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-indigo-500" />
            Market Impact Overview
          </h2>
          <span className="text-xs px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold uppercase tracking-wide">
            Pro Intelligence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50">
            <label className="text-xs uppercase tracking-wide text-indigo-500">
              Actionability
            </label>
            <div className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Timer className="w-6 h-6 text-indigo-500" />
              {directBeneficiaries.length > 0 ? "Actionable (Await confirmation)" : "Watch only"}
            </div>
            <p className="text-sm text-slate-500 mt-3">
              Use with price/volume confirmation. Not a direct signal.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/50">
            <label className="text-xs uppercase tracking-wide text-rose-500">
              Potential Risks
            </label>
            <div className="mt-3 space-y-2 text-sm font-medium text-rose-600">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4" /> No price follow-through
              </div>
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4" /> Macro reversal
              </div>
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4" /> Regulatory changes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================
         2. Company Impacts (Advanced: collapsible, closed by default)
      ================================= */}
      <CollapsibleSection title={<div className="flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500" />Company Impacts (Advanced Details)</div>} defaultOpen={false}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-base font-semibold text-emerald-600 mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5" />
              Primary Targets (Beneficiaries)
            </h4>
            <div className="grid gap-4">
              {directBeneficiaries.length > 0
                ? directBeneficiaries.map((t, i) => <TickerIntelligenceCard key={i} ticker={t} />)
                : <div className="p-8 text-sm text-slate-500 border-2 border-dashed rounded-xl text-center">
                    No clear beneficiaries identified.
                  </div>}
            </div>

            {supplyChain.length > 0 && (
              <div className="mt-8 p-6 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200">
                <h5 className="text-sm font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                  <Factory className="w-5 h-5" />
                  Ecosystem & Supply Chain
                </h5>
                <p className="text-sm text-slate-600 mb-4">
                  Supporting or dependent companies.
                </p>
                <div className="grid gap-3">
                  {supplyChain.map((t, i) => (
                    <div key={i} className="text-sm font-medium">
                      {t.symbol || t.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-base font-semibold text-rose-600 mb-4 flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5" />
              Competitive Pressure (Potential Losers)
            </h4>
            <div className="grid gap-4">
              {marketLosers.length > 0
                ? marketLosers.map((t, i) => <TickerIntelligenceCard key={i} ticker={t} />)
                : <div className="p-8 text-sm text-slate-500 border-2 border-dashed rounded-xl text-center">
                    No obvious downside risks detected.
                  </div>}
            </div>

            {competitors.length > 0 && (
              <div className="mt-8 p-6 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200">
                <h5 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Industry Peers to Watch
                </h5>
                <p className="text-sm text-slate-600 mb-4">
                  Potential shifts in market share.
                </p>
                <div className="grid gap-3">
                  {competitors.map((t, i) => (
                    <div key={i} className="text-sm font-medium">
                      {t.symbol || t.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* ================================
         3. Sector Impact (Advanced: collapsible, closed by default)
      ================================= */}
      <CollapsibleSection title={<div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-500" />Sector Implications — Who Benefits, Who Faces Pressure</div>} defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors?.map((s: any, i: number) => {
            const bullish = s.impact === "Bullish";
            const theme = bullish ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600";
            return (
              <div
                key={i}
                className={`p-6 rounded-xl border ${theme} shadow-sm`}
              >
                <div className="text-sm uppercase font-semibold text-slate-600 mb-1">
                  {s.name}
                </div>
                <div className={`text-xl font-bold`}>
                  {bullish ? "Tailwind" : "Headwind"}
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
  {bullish
    ? "This news flow improves demand visibility or pricing power for this sector."
    : "This development may compress margins, reduce demand, or shift capital away from this sector."}
</p>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-slate-500 mb-1">Confidence</div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${bullish ? "bg-emerald-500" : "bg-rose-500"}`}
                      style={{ width: `${s.confidence}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-right mt-1">{s.confidence}%</div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
  <strong>Investor takeaway:</strong>{" "}
  {bullish
    ? "Monitor leading stocks in this sector for relative strength, volume expansion, or follow-through."
    : "Be alert to relative underperformance, valuation compression, or capital rotation away from this sector."}
</div>

              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <MarketImpactSection marketImpact={marketImpact} />

      {/* Decision Support Tips */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-500" />
          Decision Support Tips
        </h3>
        <ul className="space-y-4 text-sm text-slate-600">
          <li className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span>Always cross-verify with real-time price data and volume trends before acting.</span>
          </li>
          <li className="flex gap-3">
            <Target className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <span>Consider portfolio diversification to mitigate sector-specific risks.</span>
          </li>
          <li className="flex gap-3">
            <Layers className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Monitor institutional flows for stronger confirmation signals.</span>
          </li>
          <li className="flex gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>Be aware of external factors like economic indicators or geopolitical events.</span>
          </li>
        </ul>
      </section>

      <footer className="flex justify-center pt-6 border-t text-xs text-slate-400 uppercase tracking-widest">
        <Info className="w-4 h-4 mr-2" />
        Financial Decision Support — Not Investment Advice
      </footer>
    </div>
  );
}
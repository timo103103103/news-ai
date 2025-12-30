import { Activity, TrendingUp, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import TierLock from "@/components/TierLock";
import MarketImpactSection from "@/components/MarketImpactSection";
import Tooltip from "@/components/Tooltip";

interface Step6MarketImpactProps {
  marketImpact: any;
  isPremium: boolean;
}

function hasAnyTickers(tickers: any) {
  return (
    (Array.isArray(tickers?.direct) && tickers.direct.length > 0) ||
    (Array.isArray(tickers?.indirect) && tickers.indirect.length > 0) ||
    (Array.isArray(tickers?.speculative) && tickers.speculative.length > 0)
  );
}

function countByTier(tickers: any) {
  return {
    direct: tickers?.direct?.length || 0,
    indirect: tickers?.indirect?.length || 0,
    speculative: tickers?.speculative?.length || 0,
  };
}

export default function Step6MarketImpact({
  marketImpact,
  isPremium,
}: Step6MarketImpactProps) {
  const tickers = marketImpact?.tickers;
  const hasData = hasAnyTickers(tickers);
  const counts = countByTier(tickers || {});

  // 🔒 非 Premium
  if (!isPremium) {
    return (
      <TierLock
        feature="market_impact"
        className="min-h-[360px] bg-slate-50 dark:bg-slate-900/40"
      />
    );
  }

  return (
    <div className="space-y-8">

      {/* 🧠 Market Signal Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-4 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm">
                Market Read-Through
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {marketImpact?.overallSentiment
                  ? `Overall reaction leans ${marketImpact.overallSentiment}. 
                     Market impact depends on confirmation and transmission speed.`
                  : "Market reaction is ambiguous. Treat this as contextual information, not a trade trigger."}
              </p>
            </div>
          </div>
        </div>

        {/* 🧪 Signal Quality */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
          <h5 className="text-sm font-semibold mb-2">Signal Quality</h5>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <li>🟢 Explicit links: <b>{counts.direct}</b></li>
            <li>🔵 Inferred links: <b>{counts.indirect}</b></li>
            <li>🟠 Structural themes: <b>{counts.speculative}</b></li>
          </ul>
        </div>
      </div>

      {/* 🕒 Time Horizon Map */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h5 className="font-semibold text-sm">Expected Market Timing</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded border bg-white dark:bg-slate-900">
            <b>Direct</b><br />
            Often reacts within days if confirmed by price/volume.
          </div>
          <div className="p-3 rounded border bg-white dark:bg-slate-900">
            <b>Indirect</b><br />
            Usually lags as supply-chain or competition effects play out.
          </div>
          <div className="p-3 rounded border bg-white dark:bg-slate-900">
            <b>Speculative</b><br />
            Narrative-driven; requires repeated validation.
          </div>
        </div>
      </div>

      {/* 📊 有 ticker */}
      {hasData ? (
        <>
          <MarketImpactSection marketImpact={marketImpact} />

          {/* 🧭 Transmission Logic */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <h5 className="font-semibold text-sm mb-2">Transmission Logic</h5>
            <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span>• Demand shock</span>
              <span>• Cost structure</span>
              <span>• Regulatory pressure</span>
              <span>• Competitive positioning</span>
              <span>• Market sentiment</span>
            </div>
          </div>

          {/* 🎯 Actionability */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm text-amber-800 dark:text-amber-200">
                  Actionability Guidance
                </h5>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Treat this as a <b>signal-screening layer</b>. 
                  Confirm with price action, earnings guidance, and macro alignment 
                  before committing capital.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ❌ 無 ticker */
        <div className="p-10 text-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-900/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
          <Activity className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h5 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
            Narrative-Level Market Signal
          </h5>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            No directly tradable equities identified. 
            This news is more useful for <b>macro positioning</b>, 
            sector rotation analysis, or risk awareness.
          </p>
        </div>
      )}
    </div>
  );
}

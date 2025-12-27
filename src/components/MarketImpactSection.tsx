import { TrendingUp } from "lucide-react";
import { ImpactDistributionMeter } from "@/components/StockImpactMeter";

export default function MarketImpactSection({ marketImpact }: { marketImpact: any }) {
  const tickers = marketImpact?.tickers || { direct: [], indirect: [], speculative: [] };

  const direct = tickers.direct || [];
  const indirect = tickers.indirect || [];
  const speculative = tickers.speculative || [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Market Impact
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {marketImpact?.overallSentiment || "Neutral"}
        </span>
      </div>

      <ImpactDistributionMeter
        direct={direct.length}
        indirect={indirect.length}
        speculative={speculative.length}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[
          ["Direct", direct],
          ["Indirect", indirect],
          ["Speculative", speculative],
        ].map(([label, list]: any) => (
          <div key={label}>
            <h4 className="text-sm font-semibold mb-2">{label} Targets</h4>
            {list.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No equities found</p>
            ) : (
              list.map((t: any, i: number) => (
                <div
                  key={i}
                  className="p-3 mb-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800"
                >
                  <div className="font-bold text-slate-900 dark:text-white">
                    {t.symbol || t.name || "Unknown"}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 mt-1">
                    {t.impactMechanism || t.reasoning || "Market impact"}
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

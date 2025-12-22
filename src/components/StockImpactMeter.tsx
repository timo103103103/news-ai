import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ExternalLink,
  Activity,
  GitCommit,
  ShieldAlert,
  Info,
  BrainCircuit,
  Scale,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* =========================
   Types (Backend-Aligned)
========================= */

type ImpactTier = "Direct" | "Indirect" | "Speculative";
type Sentiment = "Bullish" | "Bearish" | "Neutral" | "Mixed";

interface TickerImpact {
  symbol: string;
  name?: string;
  sentiment: Sentiment;
  tier: ImpactTier;
  confidence: number;
  exposure?: string;
  secondOrderRole?: string;
  neglectedNarrative?: boolean;
  riskLevel?: string;
  trapWarning?: boolean;
  tradingHint?: {
    action: string;
    timeHorizon: string;
    evidence: string;
  };
  reasoning?: string;
}

interface StockImpactMeterProps {
  data?: {
    overallSentiment?: Sentiment;
    institutionalFlow?: "Net Long" | "Net Short" | "Neutral";
    analystNote?: string;
    tickers: TickerImpact[];
    verifiedTickersInText?: string[];
    unverifiedCandidates?: any[];
  };
  className?: string;
}

/* =========================
   Small UI Helpers
========================= */

const ConfidenceBadge = ({ score }: { score: number }) => {
  let color =
    "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300";
  if (score >= 80)
    color =
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  else if (score >= 60)
    color =
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  else
    color =
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";

  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${color}`}
    >
      {score}% conf
    </span>
  );
};

const SentimentBadge = ({
  type,
  trapWarning,
}: {
  type: Sentiment;
  trapWarning?: boolean;
}) => {
  if (trapWarning) {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
        <ShieldAlert className="w-3 h-3" />
        <span className="text-xs font-bold uppercase">Trap Risk</span>
      </div>
    );
  }

  const styles: Record<Sentiment, string> = {
    Bullish:
      "bg-green-50 text-green-700 border-green-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    Bearish:
      "bg-red-50 text-red-700 border-red-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
    Neutral:
      "bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700",
    Mixed:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  };

  return (
    <span
      className={`text-xs font-bold px-2 py-0.5 rounded border ${styles[type]} uppercase tracking-wider`}
    >
      {type}
    </span>
  );
};

const RiskLevelBadge = ({ level }: { level?: string }) => {
  if (!level) return null;

  const styles: Record<string, string> = {
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
    Medium:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    High: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300",
  };

  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${styles[level] || styles.Medium}`}
    >
      Risk: {level}
    </span>
  );
};

const EvidenceBadge = ({ type }: { type: "Explicit" | "Inferred" | "Speculative" }) => {
  const config = {
    Explicit: {
      text: "EXPLICIT",
      class: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
    },
    Inferred: {
      text: "AI INFERRED",
      class: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
    },
    Speculative: {
      text: "STRUCTURAL INFERENCE",
      class: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
    }
  }[type];

  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wide ${config.class}`}
    >
      {config.text}
    </span>
  );
};


/* =========================
   Impact Distribution Meter
========================= */

interface ImpactDistributionProps {
  direct: number;
  indirect: number;
  speculative: number;
}

export function ImpactDistributionMeter({ 
  direct, 
  indirect, 
  speculative 
}: ImpactDistributionProps) {
  const total = direct + indirect + speculative || 1;
  const bar = (value: number) => `${(value / total) * 100}%`;
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Impact Distribution
      </h4>
      {[
        ["Direct", direct, "bg-orange-500"],
        ["Indirect", indirect, "bg-blue-500"],
        ["Speculative", speculative, "bg-slate-400"],
      ].map(([label, value, color]) => (
        <div key={label as string} className="text-xs">
          <div className="flex justify-between mb-1">
            <span className="text-slate-700 dark:text-slate-300">{label}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded">
            <div 
              className={`h-2 rounded ${color}`} 
              style={{ width: bar(value as number) }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================
   Ticker Card
========================= */

function TickerCard({
  ticker,
  onClick,
}: {
  ticker: TickerImpact;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-slate-900/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer relative"
    >
      {/* Source Verified Badge - Only for Direct tier */}
      <div className="absolute right-2 top-2 flex items-center gap-2">
        {ticker.tier === "Direct" && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3" />
            <span>SOURCE VERIFIED</span>
          </div>
        )}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="flex justify-between items-start mb-2 pr-24">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
              {ticker.symbol}
            </span>
            <SentimentBadge
              type={ticker.sentiment}
              trapWarning={ticker.trapWarning}
            />
            <EvidenceBadge
              type={
                ticker.tier === "Direct"
                  ? "Explicit"
                  : ticker.tier === "Indirect"
                  ? "Inferred"
                  : "Speculative"
              }
            />
          </div>
          {ticker.name && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              {ticker.name}
            </span>
          )}
          {ticker.secondOrderRole && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-1 block">
              Role: {ticker.secondOrderRole}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 items-end">
          <RiskLevelBadge level={ticker.riskLevel} />
          {ticker.neglectedNarrative && (
            <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-bold dark:bg-purple-900/30 dark:text-purple-300">
              Hidden Gem
            </span>
          )}
        </div>
      </div>

      {/* Trading Hint */}
      {ticker.tradingHint && (
        <div className="mt-3 p-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
              Action: {ticker.tradingHint.action}
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
              {ticker.tradingHint.timeHorizon}-term
            </span>
          </div>
          {ticker.tradingHint.evidence && (
            <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
              {ticker.tradingHint.evidence}
            </p>
          )}
        </div>
      )}

      {/* Evidence/Reasoning */}
      {ticker.reasoning && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-start gap-2">
          <Info className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Evidence:
            </span>{" "}
            {ticker.reasoning}
          </p>
        </div>
      )}

      {/* Confidence Footer */}
      <div className="mt-2 flex justify-between items-center">
        <ConfidenceBadge score={ticker.confidence} />
        {ticker.confidence < 60 && (
          <span className="text-[10px] font-bold text-amber-600 uppercase">
            Low confidence
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================
   Impact Summary Chart
========================= */

const ImpactSummaryChart = ({
  tiers,
}: {
  tiers: Record<ImpactTier, TickerImpact[]>;
}) => {
  const chartData = [
    { name: "Direct", count: tiers.Direct.length, color: "#f43f5e" },
    { name: "Indirect", count: tiers.Indirect.length, color: "#6366f1" },
    { name: "Speculative", count: tiers.Speculative.length, color: "#f59e0b" },
  ];

  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="p-4 bg-white dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Scale className="w-4 h-4 text-indigo-500" />
        <h5 className="text-sm font-bold uppercase text-slate-700 dark:text-slate-200">
          Impact Distribution
        </h5>
        <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-400">
          {total} Verified
        </span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart layout="vertical" data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          <XAxis type="number" hide domain={[0, "dataMax + 1"]} />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            style={{ fontSize: "12px", fontWeight: 600 }}
            tick={{ fill: "#64748b" }}
          />
          <Tooltip
            cursor={{ fill: "#e0f2f1", opacity: 0.3 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-md text-xs font-medium">
                    <p className="text-slate-800 dark:text-slate-200 font-bold">
                      {payload[0].payload.name}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {payload[0].value} tickers
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          {chartData.map((entry, index) => (
            <Bar
              key={index}
              dataKey="count"
              fill={entry.color}
              radius={[4, 4, 4, 4]}
              minPointSize={2}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* =========================
   MAIN COMPONENT
========================= */

export default function StockImpactMeter({
  data,
  className = "",
}: StockImpactMeterProps) {
  const [impactData, setImpactData] =
    useState<StockImpactMeterProps["data"]>();

  useEffect(() => {
    setImpactData(data);
  }, [data]);

  // No data or no tickers - show empty state
  if (!impactData || impactData.tickers.length === 0) {
    return (
      <div className={className}>
        <div className="p-8 text-center border border-dashed rounded-xl bg-slate-50 dark:bg-slate-900/30 border-slate-300 dark:border-slate-700">
          <Activity className="w-10 h-10 mx-auto mb-3 text-slate-400" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No Verified Equities Detected
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            This article does not explicitly mention publicly traded companies
            or stock symbols. We never infer or fabricate tickers.
          </p>
        </div>
      </div>
    );
  }

  // Group tickers by tier
  const tiers = {
    Direct: impactData.tickers.filter((t) => t.tier === "Direct"),
    Indirect: impactData.tickers.filter((t) => t.tier === "Indirect"),
    Speculative: impactData.tickers.filter(
      (t) => t.tier === "Speculative"
    ),
  };

  const openYahooFinance = (symbol: string) => {
    window.open(`https://finance.yahoo.com/quote/${symbol}`, "_blank");
  };

  const sentimentIcon =
    impactData.overallSentiment === "Bullish"
      ? TrendingUp
      : impactData.overallSentiment === "Bearish"
      ? TrendingDown
      : Activity;
  const sentimentColor =
    impactData.overallSentiment === "Bullish"
      ? "text-emerald-500"
      : impactData.overallSentiment === "Bearish"
      ? "text-rose-500"
      : "text-slate-500";

  return (
    <div className={className}>
      <div className="bg-white dark:bg-slate-900/70 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/40">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Market Ripple Analysis
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-indigo-500" />
                  {impactData.tickers.length} Verified Equities • No Fabrication
                </p>
              </div>
            </div>

            {/* Overall Sentiment */}
            {impactData.overallSentiment && (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-base font-extrabold uppercase ${sentimentColor}`}
                  >
                    {impactData.overallSentiment}
                  </span>
                  {React.createElement(sentimentIcon, {
                    className: `w-5 h-5 ${sentimentColor}`,
                  })}
                </div>
                {impactData.institutionalFlow && (
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60">
                    Flow: {impactData.institutionalFlow}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Analyst Note + Chart */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {impactData.analystNote && (
                <div className="flex items-start gap-3 p-4 bg-indigo-50/70 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                  <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-300 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300">
                      Analyst Perspective
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug mt-0.5">
                      "{impactData.analystNote}"
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <ImpactSummaryChart tiers={tiers} />
            </div>
          </div>
        </div>

        {/* Ticker Grid by Tier */}
        <div className="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Direct Impact */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-300 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                Direct Targets ({tiers.Direct.length})
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">
              Explicitly mentioned in the article
            </p>
            <div className="flex flex-col gap-4">
              {tiers.Direct.length > 0 ? (
                tiers.Direct.map((ticker) => (
                  <TickerCard
                    key={ticker.symbol}
                    ticker={ticker}
                    onClick={() => openYahooFinance(ticker.symbol)}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No direct equities found
                </p>
              )}
            </div>
          </div>

          {/* Indirect Impact */}
          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 mb-4">
              <GitCommit className="w-5 h-5 text-indigo-500" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                Indirect Shockwave ({tiers.Indirect.length})
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">
              Supply chain or sector correlation
            </p>
            <div className="flex flex-col gap-4">
              {tiers.Indirect.length > 0 ? (
                tiers.Indirect.map((ticker) => (
                  <TickerCard
                    key={ticker.symbol}
                    ticker={ticker}
                    onClick={() => openYahooFinance(ticker.symbol)}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No indirect equities found
                </p>
              )}
            </div>
          </div>

          {/* Speculative */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                Speculative Outliers ({tiers.Speculative.length})
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">
              Macro-driven or hedging plays
            </p>
            <div className="flex flex-col gap-4">
              {tiers.Speculative.length > 0 ? (
                tiers.Speculative.map((ticker) => (
                  <TickerCard
                    key={ticker.symbol}
                    ticker={ticker}
                    onClick={() => openYahooFinance(ticker.symbol)}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No speculative equities found
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

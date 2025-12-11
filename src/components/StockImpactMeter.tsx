import React, { useState, useEffect } from 'react';
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
  Scale
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TierLock } from './TierLock'; // Assuming this component exists

// --- Types & Interfaces (Unchanged) ---

type ImpactTier = 'Direct' | 'Indirect' | 'Speculative';
type Sentiment = 'Bullish' | 'Bearish' | 'Neutral';

interface TickerImpact {
  symbol: string;
  name: string;
  price: number;
  change: number; // Percentage change
  sentiment: Sentiment;
  tier: ImpactTier;
  confidence: number; // 0-100%
  trapWarning?: boolean; // "Market Maker Trap" indicator
  reasoning: string; // The "Aspect" determining this link
}

interface StockImpactMeterProps {
  data?: {
    overallSentiment: Sentiment;
    institutionalFlow: 'Net Long' | 'Net Short' | 'Neutral';
    analystNote: string;
    tickers: TickerImpact[];
  };
  className?: string;
}

// --- Helper Components (Unchanged) ---

const ConfidenceBadge = ({ score }: { score: number }) => {
  let color = 'bg-slate-100 text-slate-600';
  if (score >= 80) color = 'bg-emerald-100 text-emerald-700';
  else if (score >= 50) color = 'bg-blue-100 text-blue-700';
  else color = 'bg-amber-100 text-amber-700';

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${color}`}>
      {score}% Conf.
    </span>
  );
};

const SentimentBadge = ({ type, trapWarning }: { type: Sentiment; trapWarning?: boolean }) => {
  if (trapWarning) {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded border border-purple-200" title="High probability of liquidity trap/reversal">
        <ShieldAlert className="w-3 h-3" />
        <span className="text-xs font-bold uppercase">Trap Risk</span>
      </div>
    );
  }

  const styles = {
    Bullish: 'bg-green-50 text-green-700 border-green-200',
    Bearish: 'bg-red-50 text-red-700 border-red-200',
    Neutral: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${styles[type]} uppercase tracking-wider`}>
      {type}
    </span>
  );
};

// --- NEW/UPDATED Component: Ticker Card (Unchanged for simplicity) ---

function TickerCard({ ticker, onClick }: { ticker: TickerImpact; onClick: () => void }) {
  const isNegative = ticker.change < 0;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Hover Indication */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-4 h-4 text-slate-400" />
      </div>

      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-slate-800 tracking-tight">{ticker.symbol}</span>
            <SentimentBadge type={ticker.sentiment} trapWarning={ticker.trapWarning} />
          </div>
          <span className="text-xs text-slate-500 font-medium truncate max-w-[150px] block">
            {ticker.name}
          </span>
        </div>

        <div className="text-right">
          <div className="text-sm font-bold text-slate-700 font-mono">
            ${ticker.price.toFixed(2)}
          </div>
          <div className={`flex items-center justify-end text-xs font-bold ${isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isNegative ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
            {ticker.change > 0 ? '+' : ''}{ticker.change}%
          </div>
        </div>
      </div>

      {/* Logic/Reasoning Block */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2">
        <Info className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-slate-600 leading-snug">
          <span className="font-semibold text-slate-800">Logic:</span> {ticker.reasoning}
        </p>
      </div>

      {/* Confidence Meter */}
      <div className="mt-2 flex justify-between items-center">
        <ConfidenceBadge score={ticker.confidence} />
        {ticker.trapWarning && (
            <span className="text-[10px] font-bold text-purple-600 uppercase animate-pulse">
              Possible Contrarian Trap
            </span>
        )}
      </div>
    </div>
  );
}

// --- NEW Component: ImpactSummaryChart ---

const ImpactSummaryChart = ({ tiers }: { tiers: { Direct: TickerImpact[]; Indirect: TickerImpact[]; Speculative: TickerImpact[] } }) => {
  const chartData = [
    { name: 'Direct', count: tiers.Direct.length, color: '#f43f5e' },
    { name: 'Indirect', count: tiers.Indirect.length, color: '#4f46e5' },
    { name: 'Speculative', count: tiers.Speculative.length, color: '#f59e0b' },
  ];

  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  // Custom Tick for Y-Axis to show only whole numbers
  const renderCustomYTick = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    if (Number.isInteger(payload.value)) {
      return (
        <text x={x} y={y} dy={3} fill="#64748b" fontSize={10} textAnchor="end">
          {payload.value}
        </text>
      );
    }
    return null;
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-inner">
      <div className="flex items-center gap-2 mb-3">
        <Scale className="w-4 h-4 text-indigo-500" />
        <h5 className="text-sm font-bold text-slate-700 uppercase">Impact Distribution</h5>
        <span className="ml-auto text-xs font-medium text-slate-500">Total: {total} Tickers</span>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis type="number" hide domain={[0, 'dataMax + 1']} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            width={70}
            style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}
          />
          <Tooltip
            cursor={{ fill: '#e0f2f1', opacity: 0.5 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="p-2 bg-white border border-slate-200 rounded shadow-md text-xs font-medium">
                    <p className="text-slate-800 font-bold">{payload[0].payload.name}</p>
                    <p className="text-slate-600">Count: {payload[0].value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          {chartData.map((entry, index) => (
            <Bar key={index} dataKey="count" fill={entry.color} radius={[4, 4, 4, 4]} minPointSize={1} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Main Component (Redesigned Structure) ---

export default function StockImpactMeter({ data, className = '' }: StockImpactMeterProps) {
  // ✅ FIXED: Removed mock data generation - only use real data from props
  const [impactData, setImpactData] = useState<Required<StockImpactMeterProps>['data'] | null>(null);

  useEffect(() => {
    if (data) {
      setImpactData(data);
    } else {
      // ✅ FIXED: Set to null instead of generating fake data
      setImpactData(null);
    }
  }, [data]);

  // ✅ FIXED: Show proper placeholder when no data available
  if (!impactData) {
    return (
      <TierLock feature="stock_impact" className={className}>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Ripple Analysis</h3>
          <p className="text-gray-600">No market impact data available for this article.</p>
          <p className="text-sm text-gray-500 mt-2">
            The AI analysis did not identify specific stock market impacts for this news event.
          </p>
        </div>
      </TierLock>
    );
  }

  // Grouping Tickers (Unchanged)
  const tiers = {
    Direct: impactData.tickers.filter(t => t.tier === 'Direct'),
    Indirect: impactData.tickers.filter(t => t.tier === 'Indirect'),
    Speculative: impactData.tickers.filter(t => t.tier === 'Speculative'),
  };

  const openYahooFinance = (symbol: string) => {
    window.open(`https://finance.yahoo.com/quote/${symbol}`, '_blank');
  };

  const sentimentIcon = impactData.overallSentiment === 'Bullish' ? TrendingUp : impactData.overallSentiment === 'Bearish' ? TrendingDown : Activity;
  const sentimentColor = impactData.overallSentiment === 'Bullish' ? 'text-emerald-500' : impactData.overallSentiment === 'Bearish' ? 'text-rose-500' : 'text-slate-500';

  return (
    <TierLock feature="stock_impact" className={className}>
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden font-sans">

        {/* --- Header & Summary: The Control Panel --- */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Market Ripple Analysis</h3>
                <p className="text-sm text-slate-500 font-medium">
                  Impact Scope: **{impactData.tickers.length} Tickers** Identified
                </p>
              </div>
            </div>

            {/* Overall Sentiment & Institutional Flow */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-base font-extrabold uppercase ${sentimentColor}`}>
                  {impactData.overallSentiment}
                </span>
                {React.createElement(sentimentIcon, { className: `w-5 h-5 ${sentimentColor}` })}
              </div>
              <span className="text-xs font-semibold text-slate-600 px-2 py-1 rounded-full bg-slate-100">
                Inst. Flow: **{impactData.institutionalFlow}**
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {/* Bias-Free Analyst Note (More Prominent) */}
              <div className="flex items-start gap-3 p-4 bg-indigo-50/70 border border-indigo-200 rounded-lg">
                <BrainCircuit className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold uppercase text-indigo-700">Analyst Perspective (Macro View)</span>
                  <p className="text-sm text-slate-700 leading-snug mt-0.5">
                    "{impactData.analystNote}"
                  </p>
                </div>
              </div>
            </div>
            {/* Impact Summary Chart */}
            <div className="lg:col-span-1">
              <ImpactSummaryChart tiers={tiers} />
            </div>
          </div>
        </div>

        {/* --- Ticker Content: Organized by Tier --- */}

        <div className="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-slate-100">
          
          {/* Tier 1: DIRECT IMPACT */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-300 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                Direct Targets ({tiers.Direct.length})
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-4 italic">The epicenter of the news. High confidence needed.</p>
            <div className="flex flex-col gap-4">
              {tiers.Direct.length > 0 ? (
                tiers.Direct.map((ticker) => (
                  <TickerCard key={ticker.symbol} ticker={ticker} onClick={() => openYahooFinance(ticker.symbol)} />
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No direct impact tickers identified</p>
              )}
            </div>
          </div>

          {/* Tier 2: INDIRECT IMPACT */}
          <div className="p-6 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-4">
              <GitCommit className="w-5 h-5 text-indigo-500" />
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Indirect Shockwave ({tiers.Indirect.length})
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-4 italic">Supply chain or close sector correlation. Monitor flows.</p>
            <div className="flex flex-col gap-4">
              {tiers.Indirect.length > 0 ? (
                tiers.Indirect.map((ticker) => (
                  <TickerCard key={ticker.symbol} ticker={ticker} onClick={() => openYahooFinance(ticker.symbol)} />
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No indirect impact tickers identified</p>
              )}
            </div>
          </div>

          {/* Tier 3: SPECULATIVE */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-bold text-slate-600 uppercase tracking-widest">
                Speculative Outliers ({tiers.Speculative.length})
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-4 italic">Macro-driven or hedging plays. Low confidence warning.</p>
            <div className="flex flex-col gap-4">
              {tiers.Speculative.length > 0 ? (
                tiers.Speculative.map((ticker) => (
                  <TickerCard key={ticker.symbol} ticker={ticker} onClick={() => openYahooFinance(ticker.symbol)} />
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No speculative impact tickers identified</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </TierLock>
  );
}
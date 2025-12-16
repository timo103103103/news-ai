// ChronosIsomorphism.tsx
import React, { useState } from 'react';
import { History, ArrowRight, AlertTriangle, TrendingUp, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

type ChronosPayload = {
  currentEvent: string;
  matchedEvent: string;
  similarityScore: number; // 0-100
  timePattern: string;
  cyclicality: number; // 0-100
  historicalOutcomes: Array<{ outcome: string; probability: number }>;
  analystNote: string;
};

export interface ChronosProps {
  data?: ChronosPayload;
  className?: string;
}

export default function ChronosIsomorphism({ data, className = '' }: ChronosProps) {
  const [showAllOutcomes, setShowAllOutcomes] = useState(false);

  if (!data) return null;

  // Sort outcomes by probability
  const sortedOutcomes = [...(data.historicalOutcomes || [])].sort((a, b) => b.probability - a.probability);
  const primaryOutcome = sortedOutcomes[0];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Pattern Recurrence</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">AI-detected repetition</p>
        </div>
      </div>

      {/* Main Insight Card */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Closest Match</span>
          <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            {data.similarityScore}% Similarity
          </span>
        </div>
        <div className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1">
          {data.matchedEvent || "No historical match found"}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Pattern: <span className="text-slate-700 dark:text-slate-300 font-medium">{data.timePattern}</span>
        </div>
      </div>

      {/* Most Likely Outcome */}
      <div className="flex-1">
        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">Based on history, what happens next?</div>
        
        {primaryOutcome ? (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl blur-sm transition-opacity opacity-75 group-hover:opacity-100"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Most Likely Outcome
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{primaryOutcome.probability}% Probability</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {primaryOutcome.outcome}
              </p>
            </div>
          </div>
        ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-500 text-center">
                Insufficient data to predict outcome.
            </div>
        )}

        <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 bg-slate-50 dark:bg-slate-900/40">
            Alternative Outcomes
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedOutcomes.map((o, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <span className="col-span-8 text-xs text-slate-600 dark:text-slate-400">{o.outcome}</span>
                <div className="col-span-4 flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{o.probability}%</span>
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${o.probability}%`,
                        backgroundColor: o.probability >= 60 ? '#059669' : o.probability >= 30 ? '#f59e0b' : '#6b7280'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analyst Note Footer */}
      {data.analystNote && (
         <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-2">
                <div className="mt-0.5"><AlertTriangle className="w-3 h-3 text-amber-500" /></div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    "{data.analystNote}"
                </p>
            </div>
         </div>
      )}
    </div>
  );
}

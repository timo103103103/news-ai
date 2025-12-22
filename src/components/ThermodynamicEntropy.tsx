// ThermodynamicEntropy.tsx
import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, FileText, Sparkles } from 'lucide-react';

type Segment = { text: string; type: 'fact' | 'speculation' };

export interface EntropyProps {
  data?: {
    articleTitle: string;
    wordCount: number;
    factCount: number;
    speculationCount: number;
    signalToNoise: number; // 0-100 (Higher is better signal)
    entropyLevel: number; 
    segments: Segment[];
  };
  className?: string;
}

export default function ThermodynamicEntropy({ data, className = '' }: EntropyProps) {
  const [activeTab, setActiveTab] = useState<'facts' | 'speculation'>('facts');

  if (!data) return null;

  // Calculate percentages for the bar
  const total = data.factCount + data.speculationCount;
  const factPct = total > 0 ? Math.round((data.factCount / total) * 100) : 0;
  
  // Filter segments with defensive check
  const facts = (data.segments || []).filter(s => s.type === 'fact');
  const specs = (data.segments || []).filter(s => s.type === 'speculation');

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${data.signalToNoise > 60 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
          {data.signalToNoise > 60 ? (
             <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
             <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Evidence Confidence</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Fact vs Speculation Ratio</p>
        </div>
      </div>

      {/* The Truth Meter Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-semibold mb-2">
            <span className="text-emerald-600 dark:text-emerald-400">{factPct}% Facts</span>
            <span className="text-rose-500 dark:text-rose-400">{100 - factPct}% Speculation</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${factPct}%` }} />
            <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${100 - factPct}%` }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3 border-b border-slate-200 dark:border-slate-800">
        <button
            onClick={() => setActiveTab('facts')}
            className={`pb-2 px-1 text-xs font-bold uppercase tracking-wide transition-colors ${
                activeTab === 'facts' 
                ? 'text-emerald-600 border-b-2 border-emerald-500' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
        >
            Verified Facts ({facts.length})
        </button>
        <button
            onClick={() => setActiveTab('speculation')}
            className={`pb-2 px-1 text-xs font-bold uppercase tracking-wide transition-colors ${
                activeTab === 'speculation' 
                ? 'text-rose-500 border-b-2 border-rose-500' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
        >
            Speculation ({specs.length})
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto max-h-[420px] md:max-h-[520px] pr-2 space-y-2">
        {activeTab === 'facts' ? (
            facts.length > 0 ? facts.map((item, i) => (
                <div key={i} className="flex gap-3 text-sm p-2 rounded bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                    <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">{item.text}</span>
                </div>
            )) : <div className="text-center text-slate-400 text-sm py-4">No specific facts isolated.</div>
        ) : (
            specs.length > 0 ? specs.map((item, i) => (
                <div key={i} className="flex gap-3 text-sm p-2 rounded bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                    <Sparkles className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 italic">{item.text}</span>
                </div>
            )) : <div className="text-center text-slate-400 text-sm py-4">No speculation detected.</div>
        )}
      </div>
    </div>
  );
}
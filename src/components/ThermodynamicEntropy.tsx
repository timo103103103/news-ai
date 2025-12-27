// ThermodynamicEntropy.tsx - IMPROVED VERSION
import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, FileText, Sparkles, Info } from 'lucide-react';

type Segment = { text: string; type: 'fact' | 'speculation' };

export interface EntropyProps {
  data?: {
    articleTitle?: string;
    wordCount?: number;
    factCount: number;
    speculationCount: number;
    signalToNoise: number; // 0-100 (Higher is better signal)
    entropyLevel?: number; 
    segments?: Segment[];
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
  const segments = data.segments || [];
  const facts = segments.filter(s => s.type === 'fact');
  const specs = segments.filter(s => s.type === 'speculation');

  // Check if we have actual segment data
  const hasSegments = segments.length > 0;

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
            Verified Facts ({hasSegments ? facts.length : data.factCount})
        </button>
        <button
            onClick={() => setActiveTab('speculation')}
            className={`pb-2 px-1 text-xs font-bold uppercase tracking-wide transition-colors ${
                activeTab === 'speculation' 
                ? 'text-rose-500 border-b-2 border-rose-500' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
        >
            Speculation ({hasSegments ? specs.length : data.speculationCount})
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto max-h-[420px] md:max-h-[520px] pr-2 space-y-2">
        {hasSegments ? (
          // Show actual segments if available
          activeTab === 'facts' ? (
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
          )
        ) : (
          // Show aggregate stats when segments are not available
          <div className="space-y-4">
            {activeTab === 'facts' ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-6 border-2 border-dashed border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">
                      {data.factCount} Verified Facts
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      {factPct}% of content is fact-based
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-white dark:bg-slate-900 rounded-lg">
                    <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <p className="font-semibold mb-1">High Factual Density</p>
                      <p className="text-xs">This article contains a strong foundation of verifiable statements and data points.</p>
                    </div>
                  </div>

                  {data.signalToNoise >= 70 && (
                    <div className="flex items-start gap-2 p-3 bg-white dark:bg-slate-900 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        <p className="font-semibold mb-1">Strong Signal Quality</p>
                        <p className="text-xs">Signal-to-noise ratio of {data.signalToNoise}% indicates reliable information.</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      Individual fact extraction coming in next backend update
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 dark:bg-rose-900/10 rounded-xl p-6 border-2 border-dashed border-rose-200 dark:border-rose-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                    <Sparkles className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-rose-900 dark:text-rose-300">
                      {data.speculationCount} Speculative Elements
                    </h4>
                    <p className="text-xs text-rose-700 dark:text-rose-400">
                      {100 - factPct}% of content contains speculation
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-white dark:bg-slate-900 rounded-lg">
                    <Info className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <p className="font-semibold mb-1">Contains Predictions & Opinions</p>
                      <p className="text-xs">Article includes forward-looking statements and interpretative analysis.</p>
                    </div>
                  </div>

                  {(100 - factPct) > 40 && (
                    <div className="flex items-start gap-2 p-3 bg-white dark:bg-slate-900 rounded-lg">
                      <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        <p className="font-semibold mb-1">High Speculation Ratio</p>
                        <p className="text-xs">Exercise caution - significant portion is based on projections or assumptions.</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      Individual speculation extraction coming in next backend update
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
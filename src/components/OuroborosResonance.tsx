import React, { useState } from 'react';
import { Infinity, GitMerge, ArrowDown, Target, EyeOff, Zap } from 'lucide-react';

type ChainLink = {
  order: string;
  event: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical' | 'Extreme';
  probability: number;
};

type OuroborosData = {
  resonanceScore: number;
  loopDetected: string;
  causalChain: ChainLink[];
  blindSpot: string;
};

export interface OuroborosProps {
  data?: OuroborosData;
  className?: string;
}

export default function OuroborosResonance({ data, className = '' }: OuroborosProps) {
  if (!data) return null;

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'extreme': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300';
      case 'critical': return 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300';
      case 'high': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg animate-pulse">
            <Infinity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Outcome Propagation</h3>
            <p className="text-xs text-slate-500">Causal Chain & Consequence Engine</p>
          </div>
        </div>
        <div className="text-right">
             <div className="text-xs font-bold text-slate-400 uppercase">Loop Strength</div>
             <div className="text-xl font-black text-purple-600 dark:text-purple-400">{data.resonanceScore}%</div>
        </div>
      </div>

      {/* The Detected Loop Name */}
      <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <GitMerge className="w-5 h-5 text-slate-400" />
        <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Identified Feedback Loop</div>
            <div className="font-bold text-slate-700 dark:text-slate-200 leading-tight">{data.loopDetected}</div>
        </div>
      </div>

      {/* The Causal Chain (The Domino Effect) */}
      <div className="flex-1 relative space-y-0 pl-4 border-l-2 border-slate-200 dark:border-slate-800 ml-4 mb-4">
        {data.causalChain.map((link, idx) => (
          <div key={idx} className="relative pb-8 last:pb-0">
            {/* Timeline Dot */}
            <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${idx === 2 ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
            
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{link.order}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getImpactColor(link.impact)}`}>
                        {link.probability}% Likely
                    </span>
                </div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {link.event}
                </div>
            </div>
            
            {/* Arrow connecting to next, unless last */}
            {idx !== data.causalChain.length - 1 && (
                <div className="mt-2 text-slate-300 dark:text-slate-700">
                   <ArrowDown className="w-3 h-3" />
                </div>
            )}
          </div>
        ))}
      </div>

      {/* The Blindspot (The "Perfect" insight) */}
      <div className="mt-auto">
        <div className="relative overflow-hidden rounded-xl bg-slate-900 dark:bg-black p-4 text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <EyeOff className="w-24 h-24" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-purple-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Crucial Blindspot</span>
                </div>
                <p className="text-sm font-medium leading-relaxed opacity-90">
                    "{data.blindSpot}"
                </p>
            </div>
        </div>
      </div>

    </div>
  );
}

// src/sections/Step5PowerAmplification.tsx

import React from "react";
import { Target } from "lucide-react";
import PartyBarChart from "@/components/PartyBarChart";

type Props = {
  partyImpact: any;
};

/**
 * Step5PowerAmplification - Power Dynamics Analysis
 * 
 * ARCHITECTURE NOTE:
 * This component is wrapped by TierLock in AnalysisResultPage.tsx
 * It should NEVER check isPremium or render TierLock internally
 * Just render data if available, or show "no data" state
 */
export default function Step5PowerAmplification({ partyImpact }: Props) {
  const hasData = !!partyImpact && Array.isArray(partyImpact.stakeholders) && partyImpact.stakeholders.length > 0;

  if (!hasData) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
        <Target className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          No stakeholder power data detected
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          This article does not contain clear influence or leverage signals.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-purple-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Power–Interest Strategy Map
          </h4>
        </div>

        <PartyBarChart partyImpactData={partyImpact} />
      </div>
    </div>
  );
}
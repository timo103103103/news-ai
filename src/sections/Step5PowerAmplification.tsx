// src/sections/Step5PowerAmplification.tsx

import React from "react";
import { Target } from "lucide-react";

import { TierLock } from "@/components/TierLock";
import { PartyBarChart } from "@/components/PartyBarChart";

type Props = {
  partyImpact: any;
  isPremium: boolean;
};

export default function Step5PowerAmplification({ partyImpact, isPremium }: Props) {
  const hasData = !!partyImpact;

  return (
    <div className="p-6">
      {isPremium ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Power–Interest Strategy Map
              </h4>
            </div>

            {hasData ? (
              <PartyBarChart partyImpactData={partyImpact} />
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Target className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No stakeholder power data available
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This section requires detectable actors/leverage signals from the article.
                </div>
              </div>
            )}
          </div>

          {/* 你如果仲有其他 premium-only 小分析（例如 key actors / leverage notes），可以加喺呢度 */}
        </div>
      ) : (
        <TierLock feature="stakeholder_impact" className="rounded-xl">
          <div className="p-8 text-center">
            <Target className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              Unlock Power Dynamics Analysis
            </h3>
            <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
              <strong>Basic value:</strong> See who has real influence and leverage in this story.
              Upgrade for full stakeholder mapping and engagement strategies.
            </p>
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
              Upgrade to Premium
            </button>
          </div>
        </TierLock>
      )}
    </div>
  );
}

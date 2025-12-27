import React from "react";
import { GitBranch, Clock } from "lucide-react";
import WorkflowStep from "../components/WorkflowStep";
import { TierLock } from "../components/TierLock";
import LazySection from "../components/LazySection";


import MemoChronos from "../components/ChronosIsomorphism";
import MemoEntropy from "../components/ThermodynamicEntropy";
import MemoOuroboros from "../components/OuroborosResonance";

interface Step7OutlookProps {
  chronos?: any;
  entropy?: any;
  ouroboros?: any;
  isPremium: boolean;
verdictText?: string;

}

export default function Step7Outlook({
  chronos,
  entropy,
  ouroboros,
  isPremium,
  verdictText,
}: Step7OutlookProps) {
  return (
    <WorkflowStep

    >
      <div className="p-6 h-full">
        {isPremium ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[700px]">
            {/* ===================== PAST ===================== */}
            <LazySection>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-md border border-slate-200 dark:border-slate-800 relative overflow-visible">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-blue-500" />
                <div className="absolute -top-3 left-4">
                  <div className="px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide bg-emerald-600 text-white rounded-b-md shadow-sm">
                    PAST
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Historical context — This section helps you understand prior
                  patterns.
                </div>

                {chronos ? (
                  <MemoChronos data={chronos} />
                ) : (
                  <div className="p-4 text-slate-500 dark:text-slate-400 text-center">
                    Chronos data not available.
                  </div>
                )}
              </div>
            </LazySection>

            {/* ===================== PRESENT ===================== */}
            <LazySection>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-md border border-slate-200 dark:border-slate-800 relative overflow-visible">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-500" />
                <div className="absolute -top-3 left-4">
                  <div className="px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide bg-blue-600 text-white rounded-b-md shadow-sm">
                    PRESENT
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Signal noise / uncertainty — This section helps you understand
                  information quality.
                </div>

                {entropy ? (
                  <MemoEntropy data={entropy} />
                ) : (
                  <div className="p-4 text-slate-500 dark:text-slate-400 text-center">
                    Entropy data not available.
                  </div>
                )}
              </div>
            </LazySection>

            {/* ===================== FUTURE ===================== */}
            <LazySection>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-md border-2 border-purple-500/20 relative overflow-visible">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-rose-500 to-rose-500" />
                <div className="absolute -top-3 left-4">
                  <div className="px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide bg-rose-600 text-white rounded-b-md shadow-sm">
                    FUTURE
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Feedback loop projection — This section helps you understand
                  potential causal chains.
                </div>

                {ouroboros ? (
                  <MemoOuroboros data={ouroboros} />
                ) : (
                  <div className="p-4 text-slate-500 dark:text-slate-400 text-center">
                    Ouroboros data not available.
                  </div>
                )}
              </div>
            </LazySection>
          </div>
        ) : (
          <TierLock
            feature="predictive_modeling"
            className="min-h-[300px] bg-slate-50 dark:bg-slate-900/40"
          >
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-blue-300 dark:text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                Unlock Future Prediction Analysis
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                <strong>Basic value:</strong> Understand where this story is
                heading based on patterns. Upgrade for full predictive modeling
                with historical context and scenario analysis.
              </p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                Upgrade to Premium
              </button>
            </div>
          </TierLock>
        )}
      </div>
    </WorkflowStep>
  );
}

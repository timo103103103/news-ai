import { Activity } from 'lucide-react';
import PowerAmplificationMap from '@/components/PowerAmplificationMap';
import ManipulationScoreGauge from '@/components/ManipulationScoreGauge';
import TierLock from '@/components/TierLock';

type Step4NarrativeIntentProps = {
  strategyIntent: any
};

export default function Step4NarrativeIntent({
  strategyIntent
}: Step4NarrativeIntentProps) {
  if (!strategyIntent) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Narrative intent data not available.
      </div>
    );
  }

  const dominant = strategyIntent?.dominantDriver;
  const incentive = strategyIntent?.incentiveStack;
  const bp = strategyIntent?.behavioralPattern;

  // 🔧 CRITICAL: Extract power amplification actors with fallback
  // Backend may return actors at different nesting levels, but AnalysisResultPage
  // should normalize it to strategyIntent.powerAmplification.actors
  // Always provide empty array fallback to prevent undefined errors
  const powerActors = strategyIntent?.powerAmplification?.actors || [];

  // 🐛 DEBUG: Development-only logging to trace data flow
  // Remove or comment out for production builds
  if (import.meta.env.DEV) {
    console.log('[Step4 Debug] Full strategyIntent object:', strategyIntent);
    console.log('[Step4 Debug] powerActors count:', powerActors.length);
    if (powerActors.length > 0) {
      console.log('[Step4 Debug] First actor sample:', powerActors[0]);
      console.log('[Step4 Debug] All actors data:', powerActors);
    } else {
      console.log('[Step4 Debug] No actors detected - will show empty state');
    }
  }

  const hasFraming = bp?.framingTechniques?.length > 0;
  const hasOmissions = bp?.omissions?.length > 0;
  const hasTriggers = bp?.emotionalTriggers?.length > 0;

  return (
    <div className="p-6 space-y-8">

      {/* ======================================================
          PRIMARY NARRATIVE DRIVER
      ====================================================== */}
      <div className="relative overflow-hidden rounded-xl border border-blue-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-slate-50 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-6 shadow-md dark:shadow-black/40">
        <div className="absolute top-0 right-0 p-2 opacity-5 dark:opacity-20">
          <Activity className="w-20 h-20 text-blue-600 dark:text-blue-400" />
        </div>

        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300">
          Primary Narrative Driver
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {dominant?.type || 'Undetermined'}
          </h3>

          <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            Confidence: {dominant?.confidence ?? 0}%
          </span>
        </div>

        <p className="mt-4 border-l-2 border-blue-200 dark:border-blue-700 pl-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {dominant?.explanation || 'No explanation available.'}
        </p>
      </div>

      {/* ======================================================
          ADVANCED ANALYSIS (COLLAPSIBLE)
      ====================================================== */}
      <details className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <summary className="cursor-pointer list-none select-none px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-blue-600" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Why This Story Is Told This Way
              </span>
              <span className="text-xs text-slate-400">(Advanced)</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Click to expand
            </span>
          </div>
        </summary>

        <TierLock feature="hidden_motive_full">
          <div className="px-6 pb-6 space-y-8">

            {/* ======================================================
                INCENTIVE STACK
            ====================================================== */}
            <div>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Who Benefits From This Narrative
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  ['Financial Interests', incentive?.economic],
                  ['Reputation & Positioning', incentive?.socialPositioning],
                  ['Political Influence', incentive?.politicalSignaling],
                  ['Ideological Messaging', incentive?.ideologicalControl]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border bg-white p-4 dark:bg-slate-900"
                  >
                    <div className="mb-2 flex justify-between items-center">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                        {label}
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {value ?? 0}%
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${value ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ======================================================
                FRAMING & BEHAVIORAL PATTERNS
            ====================================================== */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-6">
              <h4 className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                <span className="h-1 w-1 rounded-full bg-blue-700 dark:bg-blue-400" />
                How the Story Is Framed
              </h4>

              {!hasFraming && !hasOmissions && !hasTriggers ? (
                <p className="text-sm italic text-slate-500 dark:text-slate-400">
                  No notable behavioral framing patterns detected.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {hasFraming && (
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                        Key Emphasis
                      </h5>
                      <ul className="space-y-2 pl-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {bp.framingTechniques.map((t: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-blue-600 dark:text-blue-500">▸</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {hasOmissions && (
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
                        Missing Context
                      </h5>
                      <ul className="space-y-2 pl-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {bp.omissions.map((o: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-rose-600 dark:text-rose-500">▸</span>
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {hasTriggers && (
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                        Emotional Language
                      </h5>
                      <ul className="space-y-2 pl-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {bp.emotionalTriggers.map((e: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-amber-600 dark:text-amber-500">▸</span>
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ======================================================
                LANGUAGE & BIAS ANALYSIS
            ====================================================== */}
            {strategyIntent?.credibility && (
              <ManipulationScoreGauge
                credibilityData={strategyIntent.credibility}
              />
            )}

            {/* ======================================================
                POWER AMPLIFICATION
            ====================================================== */}
            <PowerAmplificationMap
              actors={powerActors}
            />
          </div>
        </TierLock>
      </details>
    </div>
  );
}

import { ArrowRight } from 'lucide-react';

type UpgradeAfterThirdAnalysisProps = {
  onUpgrade?: () => void;
};

export default function UpgradeAfterThirdAnalysis({
  onUpgrade
}: UpgradeAfterThirdAnalysisProps) {
  return (
    <div className="mt-10 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-900/20 dark:via-slate-900 dark:to-slate-900 p-6 shadow-sm">
      
      {/* Headline */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
        You are no longer seeing isolated news — you are seeing patterns.
      </h3>

      {/* Core message */}
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-4">
        Across your <strong>three analyses</strong>, one thing has appeared repeatedly:
        <br />
        <span className="italic">
          narratives are not neutral, and missing information is often more important than what is included.
        </span>
      </p>

      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-6">
        Most readers never move beyond surface-level interpretation.
        <br />
        You already have.
      </p>

      {/* Divider */}
      <div className="my-5 border-t border-slate-200 dark:border-slate-700" />

      {/* Choice framing */}
      <div className="space-y-3 mb-6 text-sm text-slate-700 dark:text-slate-300">
        <p>
          What comes next is a choice:
        </p>
        <p>
          <strong>A.</strong> Return to traditional news reading,
          <br />
          accepting that critical structural signals may be missed again
        </p>
        <p className="font-medium">
          or
        </p>
        <p>
          <strong>B.</strong> Continue with structured analysis,
          <br />
          examining narratives, incentives, and risk before forming conclusions
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onUpgrade}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white py-3 font-medium transition"
      >
        Upgrade to avoid blind spots
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Subtext */}
      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
        Analytical users typically upgrade at this point
      </p>
    </div>
  );
}

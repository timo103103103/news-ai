import {
  AlertTriangle,
  Scale,
  Info,
} from "lucide-react";

type SignalLevel = "high" | "medium" | "low";

interface DecisionSummaryCardProps {
  signalLevel: SignalLevel;
  score: number;
  primaryDriver: string;
}

export default function DecisionSummaryCard({
  signalLevel,
  score,
  primaryDriver,
}: DecisionSummaryCardProps) {
  const config = getSignalConfig(signalLevel, score, primaryDriver);

  return (
    <section
      className={`relative rounded-2xl border p-6 mb-10
        ${config.border}
        ${config.bg}`}
    >
      {/* 左側強度線 */}
      <div className={`absolute left-0 top-0 h-full w-1 ${config.accent}`} />

      {/* Header */}
      <div className="mb-4">
        <p className="text-[10px] tracking-[0.25em] uppercase font-mono text-slate-500 mb-2">
          Decision Summary · One-Minute Takeaway
        </p>

        <div className="flex items-start gap-3">
          <config.Icon className={`w-6 h-6 mt-1 ${config.icon}`} />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {config.verdict}
          </h2>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <SummaryBlock
          title="Signal Strength"
          content={`${capitalize(signalLevel)} (${score}/100)`}
        />

        <SummaryBlock
          title="Primary Driver"
          content={primaryDriver}
        />

        <SummaryBlock
          title="Decision Posture"
          content={config.posture}
        />
      </div>
    </section>
  );
}

/* =========================
   Sub-components
========================= */

function SummaryBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-xl bg-white/60 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800">
      <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
        {title}
      </p>
      <p className="font-medium text-slate-800 dark:text-slate-200">
        {content}
      </p>
    </div>
  );
}

/* =========================
   Signal Config
========================= */

function getSignalConfig(
  level: SignalLevel,
  score: number,
  driver: string
) {
  switch (level) {
    case "high":
      return {
        verdict: "This is a high-impact signal that may justify near-term action.",
        posture:
          "Treat as actionable. Consider strategic or position adjustments.",
        Icon: AlertTriangle,
        accent: "bg-red-500",
        icon: "text-red-500",
        border: "border-red-200 dark:border-red-900/50",
        bg: "bg-red-50/40 dark:bg-red-900/10",
      };

    case "medium":
      return {
        verdict:
          "This is a moderate-impact development, not a decisive trigger.",
        posture:
          "Use as a base-case reference. Monitor for confirmation before acting.",
        Icon: Scale,
        accent: "bg-amber-500",
        icon: "text-amber-500",
        border: "border-amber-200 dark:border-amber-900/50",
        bg: "bg-amber-50/40 dark:bg-amber-900/10",
      };

    case "low":
    default:
      return {
        verdict:
          "This is a low-impact signal with limited decision relevance.",
        posture:
          "Treat as background context. No action required at this stage.",
        Icon: Info,
        accent: "bg-slate-400",
        icon: "text-slate-400",
        border: "border-slate-200 dark:border-slate-800",
        bg: "bg-slate-50 dark:bg-slate-900/30",
      };
  }
}

/* =========================
   Helpers
========================= */

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

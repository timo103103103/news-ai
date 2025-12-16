import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Info, Shield, AlertTriangle, ThumbsUp, Globe } from "lucide-react";

interface CredibilityAssessmentProps {
  credibilityScore: number; // 0-100
  redFlags?: string[]; // AI-extracted suspicious keywords
  sourceInfo?: {
    hasAuthor: boolean;
    hasCitations: boolean;
    isReputable: boolean;
  };
}

const CredibilityAssessment: React.FC<CredibilityAssessmentProps> = ({
  credibilityScore,
  redFlags = [],
  sourceInfo,
}) => {
  const [displayPct, setDisplayPct] = useState(0);
  const getCredibilityStatus = (score: number) => {
    if (score >= 85)
      return { label: "Highly Reliable", icon: <ThumbsUp />, color: "text-green-500" };
    if (score >= 60)
      return { label: "Partially Reliable", icon: <Info />, color: "text-yellow-500" };
    return { label: "Low Reliability", icon: <AlertTriangle />, color: "text-red-500" };
  };

  const status = getCredibilityStatus(credibilityScore);
  const barColor = credibilityScore >= 85
    ? "#16a34a"
    : credibilityScore >= 60
    ? "#eab308"
    : "#dc2626";
  const badgeClasses = credibilityScore >= 85
    ? "bg-green-100 text-green-800 ring-1 ring-green-300 dark:bg-green-900/60 dark:text-green-200 dark:ring-green-700"
    : credibilityScore >= 60
    ? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300 dark:bg-yellow-900/60 dark:text-yellow-200 dark:ring-yellow-700"
    : "bg-red-100 text-red-800 ring-1 ring-red-300 dark:bg-red-900/60 dark:text-red-200 dark:ring-red-700";

  const reasons = [
    !sourceInfo?.hasAuthor && "Missing author / anonymous source",
    !sourceInfo?.hasCitations && "Unverifiable claims",
    !sourceInfo?.isReputable && "Low reputation publisher",
    redFlags.length > 0 && "Presence of high-bias or manipulative language",
  ].filter(Boolean) as string[];

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 800;
    const animate = (t: number) => {
      const elapsed = Math.min(t - start, duration);
      const progress = elapsed / duration;
      setDisplayPct(Math.round(progress * credibilityScore));
      if (elapsed < duration) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [credibilityScore]);

  return (
    <motion.div
      className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex gap-2 items-center">
          <Shield className="text-cyan-500" /> Credibility Assessment
        </h3>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"><Globe className="w-3 h-3 text-cyan-500"/> News Signal Integrity</span>
      </div>

      <div className="space-y-3">
        <div className="relative" role="progressbar" aria-valuenow={credibilityScore} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-6 bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <motion.div
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: `${credibilityScore}%` }}
              transition={{ duration: 0.8 }}
              style={{ backgroundColor: barColor }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[12px] font-mono font-semibold text-slate-700 dark:text-slate-100">
              {displayPct}%
            </span>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${badgeClasses}`}>
          {status.icon} {status.label} ({credibilityScore}%)
        </span>
      </div>

      {/* Reasons why score is not 100% */}
      {credibilityScore < 100 && reasons.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-200 mb-2">Credibility limiting factors</p>
          <div className="space-y-2">
            {reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/70 border border-slate-700/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-slate-900/80 hover:border-slate-600">
                <AlertTriangle className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-200 leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red Flag Keywords */}
      {redFlags.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold text-red-600 dark:text-red-300 mb-2">Flagged keywords</p>
          <div className="rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 transition-all duration-200 hover:shadow-sm">
            
            <div className="flex flex-wrap gap-2.5">
              {redFlags.map((flag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1.5 bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-200 rounded-full text-xs font-medium ring-1 ring-red-200 dark:ring-red-800 border border-red-200 dark:border-red-800 shadow-sm transition-all duration-200 focus:outline-none"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      
    </motion.div>
  );
};

export default CredibilityAssessment;

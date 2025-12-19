import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Globe, Info } from "lucide-react";

/* ================= TYPES ================= */

interface CredibilityFactor {
  name: string;
  score: number; // backend only
}

interface AnalystNote {
  biasPattern: string;
  riskLevel: "Low" | "Moderate" | "Elevated";
  guidance: string;
}

interface CredibilityAssessmentProps {
  credibilityScore: number;              // backend
  factors?: CredibilityFactor[];         // credibility.factors
  redFlags?: string[];                   // credibility.biasIndicators
  analystNote?: AnalystNote | null;      // credibility.analystNote
}

/* ================= COMPONENT ================= */

const CredibilityAssessment: React.FC<CredibilityAssessmentProps> = ({
  credibilityScore,
  factors = [],
  redFlags = [],
  analystNote = null,
}) => {
  const [displayPct, setDisplayPct] = useState(0);

  /* ---------- STATUS LABEL ---------- */
  const getStatusLabel = (score: number) => {
    if (score >= 85) return "Operationally Reliable";
    if (score >= 60) return "High Signal, Framing Risk Present";
    return "Low Reliability";
  };

  const statusLabel = getStatusLabel(credibilityScore);

  /* ---------- BAR COLOR ---------- */
  const barColor =
    credibilityScore >= 85
      ? "#16a34a"
      : credibilityScore >= 60
      ? "#eab308" // yellow = identity
      : "#dc2626";

  /* ---------- SCORE ANIMATION (VISUAL ONLY) ---------- */
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 600;

    const animate = (t: number) => {
      const elapsed = Math.min(t - start, duration);
      setDisplayPct(Math.round((elapsed / duration) * credibilityScore));
      if (elapsed < duration) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [credibilityScore]);

  return (
    <motion.div
      className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-500" />
          Source & Bias Check
        </h3>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          <Globe className="w-3 h-3 text-cyan-500" />
          News Signal Integrity
        </span>
      </div>

      {/* ================= SCORE BAR ================= */}
      <div className="relative mb-4">
        <div className="h-6 bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <motion.div
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${credibilityScore}%` }}
            transition={{ duration: 0.6 }}
            style={{ backgroundColor: barColor }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[12px] font-mono font-semibold text-slate-700 dark:text-slate-100">
            {displayPct}%
          </span>
        </div>
      </div>

      <div className="mb-6">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700 text-xs font-bold">
          <Info className="w-3.5 h-3.5" />
          {statusLabel}
        </span>
      </div>

      {/* ================= CREDIBILITY COMPOSITION ================= */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Credibility Composition
        </p>

        {factors.length === 0 ? (
          <div className="text-sm italic text-slate-500 dark:text-slate-400">
            Credibility sub-signals not provided by analysis model.
          </div>
        ) : (
          <div className="space-y-2">
            {factors.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-48 text-xs text-slate-600 dark:text-slate-400">
                  {f.name}
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-slate-500 dark:bg-slate-300"
                    style={{ width: `${f.score}%` }}
                  />
                </div>
                <span className="w-10 text-xs text-slate-600 dark:text-slate-400 text-right">
                  {f.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= DISTORTION SIGNAL ================= */}
      {redFlags.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Detected Distortion Signals
          </p>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/70 border border-slate-700">
            <AlertTriangle className="w-4 h-4 text-yellow-300 mt-0.5" />
            <span className="text-xs text-slate-200 leading-relaxed">
              Language patterns flagged by the analysis model as potentially
              framing, speculative, or emotive.
            </span>
          </div>
        </div>
      )}

      {/* ================= FLAGGED LANGUAGE ================= */}
      {redFlags.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-red-600 dark:text-red-300 mb-2">
            Flagged Language Signals
          </p>

          <div className="flex flex-wrap gap-2">
            {redFlags.map((flag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 rounded-full text-xs font-medium border border-red-200 dark:border-red-800"
              >
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ================= ANALYST NOTE (REAL DATA ONLY) ================= */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            Analyst Note
          </span>
        </div>

        {analystNote ? (
          <div className="space-y-1.5 text-sm text-slate-800 dark:text-slate-200">
            <div>
              <span className="font-semibold">Bias Pattern:</span>{" "}
              {analystNote.biasPattern}
            </div>
            <div>
              <span className="font-semibold">Risk Level:</span>{" "}
              {analystNote.riskLevel}
            </div>
            <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {analystNote.guidance}
            </div>
          </div>
        ) : (
          <div className="text-sm italic text-slate-500 dark:text-slate-400">
            Analyst interpretation not provided by analysis model.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CredibilityAssessment;

import React, { useEffect, useState, Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Target } from "lucide-react";

const ManipulationScoreGauge = React.lazy(() => import("@/components/ManipulationScoreGauge"));

// ============================================
// CONSTANTS
// ============================================
const GRID_PADDING = 10; // % padding inside chart for proper table appearance

// ============================================
// TYPES
// ============================================
interface CredibilityFactor {
  name: string;
  score: number;
}

interface AnalystNote {
  biasPattern: string;
  riskLevel: "Low" | "Moderate" | "Elevated";
  guidance: string;
}

interface CredibilityAssessmentProps {
  credibilityScore: number;
  manipulationScore?: number;
  factors?: CredibilityFactor[];
  redFlags?: string[];
  analystNote?: AnalystNote | null;
  sourceInfo?: {
    isReputable: boolean;
    hasAuthor: boolean;
    hasCitations: boolean;
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================
const inferStructuralBiasFromFactors = (
  factors: { name: string; score: number }[]
): string[] => {
  const signals: string[] = [];

  const getScore = (keywords: string[]) =>
    factors.find(f =>
      keywords.some(k => f.name.toLowerCase().includes(k))
    )?.score ?? 0;

  const sourceScore = getScore(["source", "selection"]);
  const contextScore = getScore(["context", "omission"]);
  const emotionalScore = getScore(["emotional", "language"]);
  const persuasiveScore = Math.max(
    getScore(["rhetorical", "persuasive"]),
    getScore(["political", "messaging", "coding"])
  );

  // 1️⃣ Source structure
  if (sourceScore >= 60) {
    signals.push(
      "Sources cited may be limited to a narrow range of perspectives (derived from Source Selection)."
    );
  }

  // 2️⃣ Context & time framing
  if (contextScore >= 60) {
    signals.push(
      "Key background or historical context may be underrepresented."
    );
  }

  // 3️⃣ Narrative intent
  if (persuasiveScore >= 65 && emotionalScore >= 50) {
    signals.push(
      "The overall structure suggests an attempt to influence opinion, not just present information."
    );
  }

  // Fallback
  if (signals.length === 0) {
    signals.push(
      "No strong structural bias patterns detected beyond linguistic framing."
    );
  }

  return signals.slice(0, 3);
};

// UPGRADED: Area-based influence region calculation
const getBiasInfluenceArea = (
  factorName: string,
  score: number
): {
  x: number;
  y: number;
  label: string;
  intensity: number;
  radius: number;
  opacity: number;
  xRange: [number, number];
  yRange: [number, number];
} => {
  const name = factorName.toLowerCase();

  let baseX = 50;
  let baseY = 50;
  let label = factorName;

  if (name.includes("emotional") || name.includes("language")) {
    baseX = 30;
    baseY = 20;
    label = "Emotional Language";
  } else if (name.includes("contextual") || name.includes("omission")) {
    baseX = 70;
    baseY = 25;
    label = "Context Omission";
  } else if (name.includes("political") || name.includes("coding")) {
    baseX = 45;
    baseY = 70;
    label = "Political Framing";
  } else if (name.includes("rhetorical") || name.includes("intensity")) {
    baseX = 60;
    baseY = 65;
    label = "Rhetorical Pressure";
  } else if (name.includes("source") || name.includes("sourcing")) {
    baseX = 25;
    baseY = 50;
    label = "Source Bias";
  }

  const jitter = 8;
  const randomX = (Math.random() - 0.5) * jitter;
  const randomY = (Math.random() - 0.5) * jitter;

  const clamp = (v: number) =>
    Math.max(GRID_PADDING, Math.min(100 - GRID_PADDING, v));

  const centerX = clamp(baseX + randomX);
  const centerY = clamp(baseY + randomY);

  // AREA-BASED: Radius based on score (influence range)
  const radius =
    score >= 80 ? 14 :  // Large influence
    score >= 60 ? 10 :  // Medium influence
    score >= 40 ? 7 :   // Small influence
    5;                  // Minimal influence

  // AREA-BASED: Opacity based on confidence
  const opacity =
    score >= 80 ? 0.5 :  // High confidence
    score >= 60 ? 0.4 :  // Medium confidence
    score >= 40 ? 0.3 :  // Low confidence
    0.2;                 // Very low confidence

  // Calculate influence range (for display purposes)
  const xRange: [number, number] = [
    Math.max(GRID_PADDING, centerX - radius),
    Math.min(100 - GRID_PADDING, centerX + radius)
  ];
  const yRange: [number, number] = [
    Math.max(GRID_PADDING, centerY - radius),
    Math.min(100 - GRID_PADDING, centerY + radius)
  ];

  return {
    x: centerX,
    y: centerY,
    label,
    intensity: score,
    radius,
    opacity,
    xRange,
    yRange,
  };
};

const inferMissingContext = (
  factors: { name: string; score: number }[]
): {
  present: boolean;
  level: string;
  items: string[];
} => {
  const contextScore =
    factors.find((f) =>
      f.name.toLowerCase().includes("context")
    )?.score ?? 0;

  if (contextScore >= 60) {
    return {
      present: true,
      level: 'High',
      items: [
        'Significant historical background omitted',
        'Key stakeholder perspectives missing'
      ]
    };
  }

  if (contextScore >= 40) {
    return {
      present: true,
      level: 'Moderate',
      items: [
        'Limited contextual background',
        'Partial data framing'
      ]
    };
  }

  return {
    present: false,
    level: 'Low',
    items: []
  };
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

// AREA-BASED: Get influence level label
const getInfluenceLevel = (score: number): string => {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Moderate";
  if (score >= 40) return "Weak";
  return "Minimal";
};

// ============================================
// MAIN COMPONENT
// ============================================
const CredibilityAssessment: React.FC<CredibilityAssessmentProps> = ({
  credibilityScore,
  manipulationScore = 0,
  factors = [],
  redFlags = [],
  analystNote = null,
  sourceInfo,
}) => {
  const [displayPct, setDisplayPct] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    x: number;
    y: number;
    score: number;
    color: string;
    name: string;
    radius: number;
    opacity: number;
    xRange: [number, number];
    yRange: [number, number];
  } | null>(null);

  // Helper functions for verdict
const getVerdictTitle = (score: number) => {
  if (score >= 85) return "Mostly Reliable";
  if (score >= 60) return "Some Bias Detected";
  return "Low Reliability";
};

const getVerdictSummary = (score: number) => {
  if (score >= 85) {
    return "This article is mostly factual, with no strong signs of manipulation.";
  }
  if (score >= 60) {
    return "Key facts are present, but wording or emphasis may push a particular viewpoint.";
  }
  return "This content relies heavily on framing or selective facts. Do not treat it as objective truth.";
};

  const barColor =
    credibilityScore >= 85
      ? "#16a34a"
      : credibilityScore >= 60
      ? "#eab308"
      : "#dc2626";

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

  // AREA-BASED: Generate influence areas instead of points
  const influenceAreas = useMemo(() => {
    return factors.map((factor) => {
      const area = getBiasInfluenceArea(factor.name, factor.score);
      return {
        ...area,
        score: factor.score,
        color: getScoreColor(factor.score),
        name: factor.name,
      };
    });
  }, [factors]);

  const missingContext = useMemo(() => inferMissingContext(factors), [factors]);
  const structuralSignals = useMemo(() => inferStructuralBiasFromFactors(factors), [factors]);

  return (
    <div className="space-y-6">
      {/* =========================
          SECTION A — Credibility Verdict
          ========================= */}
      <motion.div
        className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-500" />
            Credibility Assessment
          </h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Single verdict for decision making
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Score */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-black text-slate-900 dark:text-white">
                    {displayPct}
                  </div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    / 100
                  </div>
                </div>
              </div>
              {/* small status dot */}
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900"
                style={{ backgroundColor: barColor }}
                aria-hidden="true"
              />
            </div>

            <div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {getVerdictTitle(credibilityScore)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                {getVerdictSummary(credibilityScore)}
              </div>

              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                * This assessment evaluates narrative framing and credibility signals — it does not determine factual truth.
              </div>
            </div>
          </div>

          {/* Optional: Analyst note (if exists) */}
          {analystNote?.guidance ? (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 max-w-xl">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Analyst Note
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300">
                {analystNote.guidance}
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* =========================
          SECTION B — Key Signals (max 3)
          ========================= */}
      <motion.div
        className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          Key Signals Detected
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Signal 1: selective framing / missing context */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500" />
              <div>
               <div className="text-sm font-semibold text-slate-900 dark:text-white">
  Some information may be missing
</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
 {missingContext.present
  ? "Important background or alternative views may not be fully shown."
  : "No obvious missing context detected."}

                </div>
              </div>
            </div>
          </div>

          {/* Signal 2: emotional / persuasive pressure */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Emotional / persuasive pressure
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {factors.some(f => f.name.toLowerCase().includes("emotional") && f.score >= 40) ||
                  factors.some(f => f.name.toLowerCase().includes("rhetorical") && f.score >= 40)
 ? "Wording appears designed to influence how you feel, not just inform."
: "Language appears mostly neutral."}
                </div>
              </div>
            </div>
          </div>

          {/* Signal 3: source hygiene */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 text-emerald-500" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Source quality check
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {sourceInfo?.isReputable
                    ? "Publisher signals look reputable."
                    : "Publisher reputation signal is unclear."}{" "}
                  {sourceInfo?.hasAuthor ? "Author identified." : "Author not clearly identified."}{" "}
                  {sourceInfo?.hasCitations ? "Citations present." : "Few or no citations detected."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* =========================
          SECTION C — Detailed Diagnostics (collapsed by default)
          ========================= */}
      <motion.div
        className="p-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <details>
          <summary className="cursor-pointer select-none px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Detailed Diagnostics
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Expand to view charts & evidence
            </div>
          </summary>

          <div className="px-6 pb-6 pt-2 space-y-6">
            {/* Diagnostics grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Perspective Structure - AREA-BASED (v1) */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Perspective Structure
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LEFT: Chart with Y-axis labels OUTSIDE */}
                  <div className="flex gap-2">
                    {/* Y-axis labels (LEFT, OUTSIDE chart, rotated) */}
                    <div className="flex flex-col justify-between items-center w-6">
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        Narrative
                      </span>
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        Informational
                      </span>
                    </div>

                    {/* Chart container */}
                    <div className="flex-1">
                      <div className="relative w-full h-64 rounded-lg border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-950/20">
                        {/* Grid lines */}
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                          {[0, 25, 50, 75, 100].map((x) => (
                            <line
                              key={`v-${x}`}
                              x1={`${x}%`}
                              y1="0%"
                              x2={`${x}%`}
                              y2="100%"
                              stroke="currentColor"
                              strokeWidth="1"
                              className="text-slate-300 dark:text-slate-700"
                            />
                          ))}
                          {[0, 25, 50, 75, 100].map((y) => (
                            <line
                              key={`h-${y}`}
                              x1="0%"
                              y1={`${y}%`}
                              x2="100%"
                              y2={`${y}%`}
                              stroke="currentColor"
                              strokeWidth="1"
                              className="text-slate-300 dark:text-slate-700"
                            />
                          ))}
                        </svg>

                        {/* AREA-BASED: Influence regions (semi-transparent circles) */}
                        {influenceAreas.map((area, idx) => (
                          <motion.div
                            key={`${area.label}-${idx}`}
                            className="absolute rounded-full cursor-pointer border-2 transition-all"
                            style={{
                              left: `${area.x}%`,
                              top: `${100 - area.y}%`,
                              width: `${area.radius * 2}px`,
                              height: `${area.radius * 2}px`,
                              backgroundColor: area.color,
                              opacity: hoveredPoint?.label === area.label ? area.opacity + 0.2 : area.opacity,
                              borderColor: hoveredPoint?.label === area.label ? area.color : 'transparent',
                              transform: "translate(-50%, -50%)",
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: hoveredPoint?.label === area.label ? area.opacity + 0.2 : area.opacity, scale: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            whileHover={{ 
                              scale: 1.2,
                              opacity: area.opacity + 0.3,
                              borderColor: area.color,
                            }}
                            onMouseEnter={() =>
                              setHoveredPoint({
                                label: area.label,
                                x: area.x,
                                y: area.y,
                                score: area.score,
                                color: area.color,
                                name: area.name,
                                radius: area.radius,
                                opacity: area.opacity,
                                xRange: area.xRange,
                                yRange: area.yRange,
                              })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                            title={`${area.label} - ${getInfluenceLevel(area.score)} influence`}
                          />
                        ))}

                        {/* Tooltip removed to avoid duplication with right-side details */}
                      </div>

                      {/* X-axis labels (BOTTOM, OUTSIDE chart) */}
                      <div className="flex justify-between px-1 mt-1">
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Implicit</span>
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Explicit</span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Area Details (updated for area-based) */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 p-4 text-xs space-y-2">
                    <div className="font-bold text-slate-900 dark:text-white">Influence Region Details</div>
                    {hoveredPoint ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300">Factor</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{hoveredPoint.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300">Label</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{hoveredPoint.label}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300">Intensity</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{hoveredPoint.score}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300">Influence Level</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {getInfluenceLevel(hoveredPoint.score)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300">Framing Range</span>
                          <span className="font-semibold text-slate-900 dark:text-white text-right">
                            {hoveredPoint.x < 50 ? "Implicit" : "Explicit"} tendency
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300">Pressure Type</span>
                          <span className="font-semibold text-slate-900 dark:text-white text-right">
                            {hoveredPoint.y > 50 ? "Narrative" : "Informational"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300">Region Indicator</span>
                          <span className="inline-flex items-center gap-2">
                            <span 
                              className="w-4 h-4 rounded-full" 
                              style={{ 
                                backgroundColor: hoveredPoint.color,
                                opacity: hoveredPoint.opacity + 0.3
                              }} 
                            />
                            <span className="text-slate-900 dark:text-white">
                              {getInfluenceLevel(hoveredPoint.score)}
                            </span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-600 dark:text-slate-300">Hover an influence region to see details.</div>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  This chart shows <strong>estimated influence regions</strong>, not exact positions. Each area represents the <strong>likely framing range</strong> inferred from detected signals.
                </div>
                
                {/* Color legend */}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 select-none">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500" style={{ opacity: 0.5 }} />
                    Strong (80–100)
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" style={{ opacity: 0.4 }} />
                    Moderate (60–79)
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" style={{ opacity: 0.3 }} />
                    Weak (40–59)
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" style={{ opacity: 0.2 }} />
                    Minimal (&lt; 40)
                  </span>
                </div>
              </div>

              {/* Linguistic fingerprints */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Linguistic Bias Indicators
                </div>

                {redFlags.length ? (
                  <div className="flex flex-wrap gap-2">
                    {redFlags.slice(0, 8).map((t, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    No strong linguistic bias indicators detected.
                  </div>
                )}

                <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  Terms detected in the text that may suggest editorial framing.
                </div>
              </div>
            </div>

            {/* Structural Bias + Publisher Intent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Structural Bias Signals
                </div>

                {structuralSignals.length ? (
                  <ul className="list-disc ml-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    {structuralSignals.slice(0, 5).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    No strong structural bias patterns detected beyond linguistic framing.
                  </div>
                )}
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Publisher Intent
                </div>

                <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <div>
                    <span className="font-semibold">Primary goal:</span>{" "}
                    {credibilityScore >= 80 ? "Inform" : credibilityScore >= 60 ? "Inform / Persuade" : "Persuade"}
                  </div>
                  <div>
                    <span className="font-semibold">Tone:</span>{" "}
                    {credibilityScore >= 80 ? "Neutral / Factual" : credibilityScore >= 60 ? "Mixed" : "Subjective / Persuasive"}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full border ${sourceInfo?.isReputable ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800" : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"}`}>
                    {sourceInfo?.isReputable ? "Reputable" : "Unknown"}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${sourceInfo?.hasAuthor ? "bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-200 dark:border-cyan-800" : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"}`}>
                    {sourceInfo?.hasAuthor ? "Author identified" : "No author"}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${sourceInfo?.hasCitations ? "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-200 dark:border-indigo-800" : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"}`}>
                    {sourceInfo?.hasCitations ? "Citations present" : "No citations"}
                  </span>
                </div>
              </div>
            </div>

 
          </div>
        </details>
      </motion.div>
    </div>
  );
};

export default CredibilityAssessment;

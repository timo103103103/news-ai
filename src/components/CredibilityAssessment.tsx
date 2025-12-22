import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Target } from "lucide-react";

interface CredibilityFactor {
  name: string;
  score: number;
}

interface AnalystNote {
  biasPattern: string;
  riskLevel: "Low" | "Moderate" | "Elevated";
  guidance: string;
}

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

  // Fallback（防止空卡）
  if (signals.length === 0) {
    signals.push(
      "No strong structural bias patterns detected beyond linguistic framing."
    );
  }

  return signals.slice(0, 3); // 控制在 2–3 條
};

interface CredibilityAssessmentProps {
  credibilityScore: number;
  factors?: CredibilityFactor[];
  redFlags?: string[];
  analystNote?: AnalystNote | null;
  sourceInfo?: {
    isReputable: boolean;
    hasAuthor: boolean;
    hasCitations: boolean;
  };
}

const getBiasTopologyPoint = (
  factorName: string,
  score: number
): {
  x: number;
  y: number;
  label: string;
  intensity: number;
} => {
  const name = factorName.toLowerCase();

  // ---- Level 1: Semantic base position (don't randomize) ----
  let baseX = 50;
  let baseY = 50;
  let label = factorName;

  if (name.includes("emotional") || name.includes("language")) {
    baseX = 30;
    baseY = 20;
    label = "Emotional Language";
  } else if (name.includes("contextual") || name.includes("omission")) {
    baseX = 70;
    baseY = 40;
    label = "Missing Context";
  } else if (name.includes("political") || name.includes("coding")) {
    baseX = 50;
    baseY = 30;
    label = "Political Messaging";
  } else if (name.includes("rhetorical") || name.includes("intensity")) {
    baseX = 25;
    baseY = 60;
    label = "Persuasive Tone";
  } else if (name.includes("source") || name.includes("selection")) {
    baseX = 80;
    baseY = 70;
    label = "Source Selection";
  }

  // ---- Level 2: Use score to control "distance from center" ----
  // score ∈ [0,100] → strength ∈ [0.3,1]
  const strength = Math.max(0.3, Math.min(score / 100, 1));

  // Pull from center (50,50) outward (preserves direction)
  const x = 50 + (baseX - 50) * strength;
  const y = 50 + (baseY - 50) * strength;

  return {
    x,
    y,
    label,
    intensity: strength, // For UI (size / glow)
  };
};

const inferMissingContext = (factors: CredibilityFactor[]) => {
  const omission = factors.find(f =>
    f.name.toLowerCase().includes('context')
  )?.score ?? 0;

  if (omission < 40) return null;

  if (omission >= 70) {
    return {
      level: 'High',
      items: [
        'Other important viewpoints are not shown',
        'Some affected groups are not mentioned',
        'Background context may be incomplete'
      ]
    };
  }

  return {
    level: 'Moderate',
    items: [
      'Limited contextual background',
      'Partial data framing'
    ]
  };
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const CredibilityAssessment: React.FC<CredibilityAssessmentProps> = ({
  credibilityScore,
  factors = [],
  redFlags = [],
  analystNote = null,
  sourceInfo,
}) => {
  const [displayPct, setDisplayPct] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const getStatusLabel = (score: number) => {
    if (score >= 85) return "Operationally Reliable";
    if (score >= 60) return "High Signal, Framing Risk Present";
    return "Low Reliability";
  };

  const statusLabel = getStatusLabel(credibilityScore);

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

  const topologyPoints = factors.map((factor) => {
    const coords = getBiasTopologyPoint(factor.name, factor.score);
    return {
      ...coords,
      score: factor.score,
      color: getScoreColor(factor.score),
      name: factor.name,
    };
  });

  const missingContext = inferMissingContext(factors);
  const structuralSignals = inferStructuralBiasFromFactors(factors);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <motion.div
        className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-500" />
            How Neutral Is This Article?
          </h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Automated review of neutrality and framing
          </span>
        </div>

        <div className="mb-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-2">
              <span className="text-5xl font-black text-white">{displayPct}</span>
              <span className="text-lg font-bold text-white/80">/100</span>
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Neutrality Score
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
            What This Means for You
          </div>
          <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            {analystNote?.guidance || "Detectable editorial framing. While factual, the selection of evidence suggests a specific narrative angle."}
          </div>
        </div>

        {missingContext && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <div className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                What readers may miss ({missingContext.level})
              </div>
            </div>

            <ul className="list-disc ml-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
              {missingContext.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Persuasive Pressure
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {factors.find(f => f.name.toLowerCase().includes('rhetorical'))?.score || 0}%
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Emotional Impact
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {factors.find(f => f.name.toLowerCase().includes('emotional'))?.score || 0}%
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        
        <motion.div
          className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-slate-400" />
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Perspective Structure
            </h4>
          </div>

          <div className="relative w-full h-64 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700">
            
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
                  className="text-slate-200 dark:text-slate-700"
                  opacity={x === 50 ? 0.5 : 0.2}
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
                  className="text-slate-200 dark:text-slate-700"
                  opacity={y === 50 ? 0.5 : 0.2}
                />
              ))}
            </svg>

            <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-slate-400 pb-1">
              Explicit ← → Implicit
            </div>
            <div className="absolute top-0 left-0 bottom-0 flex items-center justify-center">
              <div className="text-[10px] text-slate-400 transform -rotate-90 whitespace-nowrap">
                Emotional ← → Factual
              </div>
            </div>

            {topologyPoints.length > 0 ? (
              topologyPoints.map((point, idx) => (
                <motion.div
                  key={idx}
                  className="absolute"
                  style={{
                    left: `${point.x}%`,
                    top: `${100 - point.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onMouseEnter={() => setHoveredPoint(point.label)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <div
                    className="rounded-full border-2 border-white dark:border-slate-900 shadow-lg cursor-pointer transition-transform hover:scale-150"
                    style={{
                      backgroundColor: point.color,
                      width: `${6 + point.intensity * 10}px`,
                      height: `${6 + point.intensity * 10}px`,
                    }}
                  />
                  
                  {(hoveredPoint === point.label || topologyPoints.length <= 6) && (
                    <div className="absolute left-6 top-0 whitespace-nowrap text-[10px] font-semibold bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                      {point.label}
                      <span className="text-slate-400 ml-1">({point.score})</span>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400 italic">
                No bias dimensions detected
              </div>
            )}
          </div>

          <div className="mt-2 text-[10px] text-slate-400 italic text-center">
            This view shows structural bias patterns. Position reflects bias type, not precise measurement.
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-slate-600 dark:text-slate-400">Low Bias (80+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-600 dark:text-slate-400">Moderate (60-79)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-slate-600 dark:text-slate-400">Elevated (40-59)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-slate-600 dark:text-slate-400">High Bias</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Linguistic Fingerprints
          </h4>
          
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            The following terms detected in the text indicate specific editorial bias factors:
          </div>

          {redFlags.length > 0 ? (
            <div className="space-y-2">
              {redFlags.slice(0, 2).map((flag, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {flag}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400 italic">
              No significant linguistic bias markers detected.
            </div>
          )}
        </motion.div>

          <div className="mt-4 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Structural Bias Signals
              </h4>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Non-linguistic patterns that may shape interpretation beyond wording.
            </p>

            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
              {structuralSignals.map((signal, idx) => (
                <li key={idx}>{signal}</li>
              ))}
            </ul>
          </div>

        <motion.div
          className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-300 uppercase tracking-wide mb-3">
            Publisher Intent
          </h4>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-20">
                Primary Goal:
              </span>
              <span className="text-xs text-slate-800 dark:text-slate-200">
                {analystNote?.biasPattern || "Persuade"}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-20">
                Tone:
              </span>
              <span className="text-xs text-slate-800 dark:text-slate-200">
                Subjective / Persuasive
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className={`px-2 py-1 rounded-full text-[11px] font-medium border ${ (sourceInfo?.isReputable ? 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-slate-800 dark:text-cyan-200 dark:border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700') }`}>
                {sourceInfo?.isReputable ? 'Reputable' : 'Unknown Reputation'}
              </span>
              <span className={`px-2 py-1 rounded-full text-[11px] font-medium border ${ (sourceInfo?.hasAuthor ? 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-slate-800 dark:text-cyan-200 dark:border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700') }`}>
                {sourceInfo?.hasAuthor ? 'Author Identified' : 'No Author'}
              </span>
              <span className={`px-2 py-1 rounded-full text-[11px] font-medium border ${ (sourceInfo?.hasCitations ? 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-slate-800 dark:text-cyan-200 dark:border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700') }`}>
                {sourceInfo?.hasCitations ? 'Citations Present' : 'No Citations'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default CredibilityAssessment;

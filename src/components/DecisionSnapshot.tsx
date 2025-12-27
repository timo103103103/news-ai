import React from "react";
import { 
  AlertTriangle, 
  CheckCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Target, 
  Zap, 
  Activity,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

interface DecisionSnapshotProps {
  headline?: string;
  credibilityScore: number;
  manipulationScore?: number;
}

const DecisionSnapshot: React.FC<DecisionSnapshotProps> = ({
  headline,
  credibilityScore,
  manipulationScore = 0
}) => {
  const getVerdict = () => {
    if (credibilityScore >= 80) {
      return {
        title: "Verified Intelligence",
        subtitle: "High Fidelity Signal",
        tone: "positive",
        explanation: "Content is structured around verifiable data and neutral reporting. Editorial distance is maintained.",
        advice: "SAFE FOR REFERENCE",
        icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
        barColor: "bg-emerald-500"
      };
    }
    if (credibilityScore >= 60) {
      return {
        title: "Framed Narrative",
        subtitle: "Contextual Caution Required",
        tone: "caution",
        explanation: "Contains a factual core, but utilizes specific framing to steer interpretation toward a preferred conclusion.",
        advice: "VERIFY KEY CLAIMS",
        icon: <Target className="w-8 h-8 text-blue-500" />,
        barColor: "bg-blue-500"
      };
    }
    if (credibilityScore >= 40) {
      return {
        title: "Tactical Persuasion",
        subtitle: "Low Reliability Warning",
        tone: "warning",
        explanation: "Linguistic markers suggest an intent to persuade rather than inform. Significant context is omitted.",
        advice: "CROSS-REFERENCE MANDATORY",
        icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
        barColor: "bg-amber-500"
      };
    }
    return {
      title: "Compromised Content",
      subtitle: "High Distortion Risk",
      tone: "danger",
      explanation: "Structural analysis indicates high levels of manipulation, emotive language, or logical fallacies.",
      advice: "DISREGARD AS SOURCE",
      icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
      barColor: "bg-red-500"
    };
  };

  const verdict = getVerdict();

  const toneStyles = {
    positive: "border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    caution: "border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5 text-blue-700 dark:text-blue-400",
    warning: "border-amber-500/20 bg-amber-50/30 dark:bg-amber-500/5 text-amber-700 dark:text-amber-400",
    danger: "border-red-500/20 bg-red-50/30 dark:bg-red-500/5 text-red-700 dark:text-red-400",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl border-2 ${toneStyles[verdict.tone as keyof typeof toneStyles]} p-1 shadow-2xl shadow-slate-200 dark:shadow-none`}
      aria-label="Decision snapshot"
    >
      <div className="bg-white dark:bg-slate-900 rounded-[1.4rem] p-6 lg:p-8">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Verdict Block */}
          <div className="lg:col-span-5 flex items-start gap-6 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-8">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              {verdict.icon}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 flex items-center gap-2">
                 <Activity className="w-3 h-3" /> Final Assessment
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
                {verdict.title}
              </h2>
              <div className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-bold text-slate-500 uppercase">
                {verdict.subtitle}
              </div>
            </div>
          </div>

          {/* Explanation & Action Block */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analyst Summary</div>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {verdict.explanation}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Executive Directive</div>
                <div className="flex items-center gap-3">
                  <div className={`shrink-0 w-2 h-2 rounded-full ${verdict.barColor} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)]`} />
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {verdict.advice}
                  </span>
                </div>
              </div>
              
              {/* Critical Scores Mini-Map */}
              <div className="flex gap-4">
                <div className="text-center">
                   <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Veracity</div>
                   <div className="text-lg font-black text-slate-900 dark:text-white">{credibilityScore}%</div>
                </div>
                <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 self-center" />
                <div className="text-center">
                   <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Distortion</div>
                   <div className="text-lg font-black text-slate-900 dark:text-white">{manipulationScore}%</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Tactical Accent Line */}
        <div className="absolute top-0 right-0 p-4 opacity-10 select-none">
          <Zap className="w-24 h-24 rotate-12" />
        </div>
      </div>
    </motion.section>
  );
};

export default DecisionSnapshot;
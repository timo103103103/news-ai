// AnalysisResultPage.tsx - MOTIVE DETECTION FIXED
// ============================================
// Fixed: Hidden Motives data normalization
// Added: Snake_case to camelCase conversion
// ============================================
import {
  mkBriefVerdict,
  mkCredVerdict,
  mkPestleVerdict,
  mkIntentVerdict,
  mkPowerVerdict,
  mkMarketVerdict,
  mkNextVerdict
} from "@/utils/verdicts";
import Step4NarrativeIntent from '@/sections/Step4NarrativeIntent';
import Step5PowerAmplification from '@/sections/Step5PowerAmplification';
import Step6MarketImpact from "@/sections/Step6MarketImpact";
import Step7Outlook from "@/sections/Step7Outlook";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell
} from 'recharts';

import { useSubscription, SubscriptionProvider } from '@/contexts/SubscriptionContext';
import StockImpactMeter, { ImpactDistributionMeter } from '@/components/StockImpactMeter';
import MotiveDetectionDisplay from '@/components/MotiveDetectionDisplay';
import { PartyBarChart } from '@/components/PartyBarChart';
import ManipulationScoreGauge from '@/components/ManipulationScoreGauge';
import WinnerLoserTeaser from '@/components/WinnerLoserTeaser';
import ChronosIsomorphism from '@/components/ChronosIsomorphism';
import ThermodynamicEntropy from '@/components/ThermodynamicEntropy';
import OuroborosResonance from '@/components/OuroborosResonance';
import { TierLock } from '@/components/TierLock';
import DailyIntelligenceSignup from '@/components/DailyIntelligenceSignup';
import CredibilityAssessment from '@/components/CredibilityAssessment';
import PowerAmplificationMap from '@/components/PowerAmplificationMap';

import {
  ArrowLeft, Download, Share2, Zap, Globe, Shield,
  TrendingUp, Activity, Lock, CheckCircle2, FileText,
  Microscope, Clock, AlertTriangle, User, Aperture, BarChart3,
  GitBranch, AlertCircle, ArrowUpRight, Crown, ShieldAlert, Target, CheckCircle, Building2
} from 'lucide-react';
import { toast } from 'sonner';

// -------------------------------------------------------------------
// Updates (2025-12-25)
// - Added VerdictLine and BeginnerSummary for two-layer summaries
// - Softened terminology (Chronos/Entropy/Ouroboros) with subtitles
// - Free-tier PESTLE clarity: Top 2 drivers with one-sentence explainers
// - Market Impact locked panel: explicit upgrade value (with Example data)
// - Fixed handleShare summary reference bug
// - Performance safeguards: React.memo, useMemo, and lazy mounting
// -------------------------------------------------------------------

// Helper components (small, in-file)
const VerdictLine = ({ text, icon: Icon = AlertCircle }: { text?: string; icon?: any }) => (
  <div 
    aria-label="Verdict" 
    className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100" 
    title="This is the key takeaway based on data analysis. Hover for more context on what this section reveals."
  >
    {Icon && <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
    {text || 'Insufficient information. Review sources and timeline.'}
  </div>
);

const BeginnerSummary = ({ bullets }: { bullets?: string[] }) => {
  const items = (bullets || []).slice(0, 4);
  return (
    <ul aria-label="Beginner Summary" className="px-4 py-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
      {items.length === 0 ? (
        <li>Insufficient information. Review sources and timeline.</li>
      ) : (
        items.map((b, i) => <li key={i}>• {b}</li>)
      )}
    </ul>
  );
};

// Lazy mount heavy sections only when visible
const LazySection = ({ children, rootMargin = '200px' }: { children: React.ReactNode; rootMargin?: string }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            if (ref.current) obs.unobserve(ref.current);
          }
        });
      },
      { rootMargin }
    );
    obs.observe(ref.current);
    return () => {
      if (ref.current) obs.unobserve(ref.current);
    };
  }, [rootMargin]);
  return <div ref={ref}>{visible ? children : <div className="p-6 text-slate-400 dark:text-slate-500 text-sm">Loading section…</div>}</div>;
};

// Small helpers (derived content)
// Small helpers (derived content) — FINAL (Step 1–7)



// Memo wrappers for heavy components
const MemoChronos: any = React.memo((props: any) => <ChronosIsomorphism {...props} />);
const MemoEntropy: any = React.memo((props: any) => <ThermodynamicEntropy {...props} />);
const MemoOuroboros: any = React.memo((props: any) => <OuroborosResonance {...props} />);

// Types
interface AnalysisData {
  rawAnalysis?: any;
  summary?: {
    title?: string;
    executiveSummary?: string;
    keyPoints?: string[];
    accuracy?: number;
    dataPoints?: number;
    timeframe?: string;
    relatedEntities?: string;
  };
  pestle?: {
    political?: { score: number; impact: string; factors: string[] };
    economic?: { score: number; impact: string; factors: string[] };
    social?: { score: number; impact: string; factors: string[] };
    technological?: { score: number; impact: string; factors: string[] };
    legal?: { score: number; impact: string; factors: string[] };
    environmental?: { score: number; impact: string; factors: string[] };
  };
  motive?: any;
  partyImpact?: any;
  marketImpact?: any;
  credibility?: {
    manipulationScore?: number;
    credibilityScore?: number;
    biasIndicators?: string[];
    factors?: Array<{ name: string; score: number }>;
  };
  hiddenMotives?: {
    dominantDriver?: {
      type?: string;
      confidence?: number;
      explanation?: string;
    };
    incentiveStack?: {
      economic?: number;
      socialPositioning?: number;
      politicalSignaling?: number;
      ideologicalControl?: number;
    };
    behavioralPattern?: {
      framingTechniques?: string[];
      omissions?: string[];
      emotionalTriggers?: string[];
    };
    powerAmplification?: {
      actors?: Array<{
        name: string;
        category: 'Capital' | 'Platform' | 'State' | 'Media';
        incentiveAlignment: number;
        distributionPower: number;
        isInferred?: boolean;
        evidence?: string[];
        source?: 'Explicit' | 'Inferred';
      }>;
    };
    strategicConsequence?: {
      shortTermEffect?: string;
      mediumTermRisk?: string;
      longTermDistortion?: string;
    };
  };
  chronos?: any;
  entropy?: any;
  ouroboros?: any;
  mode?: string;
  wasAutoUpgraded?: boolean;
}

const FACTOR_CONFIG: Record<string, { color: string; icon: any; description: string }> = {
  Political: {
    color: '#3b82f6',
    icon: Globe,
    description: 'Regulatory environment and government policy shifts'
  },
  Economic: {
    color: '#10b981',
    icon: TrendingUp,
    description: 'Market dynamics and macroeconomic trends'
  },
  Social: {
    color: '#f59e0b',
    icon: User,
    description: 'Cultural shifts and demographic changes'
  },
  Technological: {
    color: '#8b5cf6',
    icon: Zap,
    description: 'Innovation and digital transformation impact'
  },
  Legal: {
    color: '#ec4899',
    icon: Shield,
    description: 'Compliance requirements and legal framework'
  },
  Environmental: {
    color: '#14b8a6',
    icon: Activity,
    description: 'Sustainability and climate-related factors'
  }
};

/* =========================
   UTILITY FUNCTIONS
========================= */
const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const normalizeKeys = (obj: any, keyMap: Record<string, string>) => {
  const normalized = {};
  Object.entries(obj).forEach(([k, v]) => {
    const newKey = keyMap[k] || toCamelCase(k);
    normalized[newKey] = v;
  });
  return normalized;
};
/**
 * Normalizes hidden motives data from snake_case to camelCase
 * Handles both direct and nested data structures
 */
const normalizeHiddenMotives = (hmRaw: any): any => {
  if (!hmRaw) return null;

  // If already in camelCase format, return as is
  if (hmRaw.dominantDriver || hmRaw.incentiveStack) {
    return hmRaw;
  }

  // Convert from snake_case to camelCase
  const normalized: any = {};

  // Dominant Driver
  if (hmRaw.dominant_driver || hmRaw.dominantDriver) {
    const dd = hmRaw.dominant_driver || hmRaw.dominantDriver;
    normalized.dominantDriver = {
      type: dd.type || dd.driver_type || 'Unknown',
      confidence: dd.confidence || 0,
      explanation: dd.explanation || dd.rationale || ''
    };
  }

  // Incentive Stack
  if (hmRaw.incentive_stack || hmRaw.incentiveStack) {
    const is = hmRaw.incentive_stack || hmRaw.incentiveStack;
    normalized.incentiveStack = {
      economic: is.economic || is.capital_incentive || 0,
      socialPositioning: is.socialPositioning || is.social_positioning || is.status_engineering || 0,
      politicalSignaling: is.politicalSignaling || is.political_signaling || is.political_leverage || 0,
      ideologicalControl: is.ideologicalControl || is.ideological_control || is.cognitive_dominance || 0
    };
  }

  // Behavioral Pattern
  if (hmRaw.behavioral_pattern || hmRaw.behavioralPattern) {
    const bp = hmRaw.behavioral_pattern || hmRaw.behavioralPattern;
    normalized.behavioralPattern = {
      framingTechniques: bp.framingTechniques || bp.framing_techniques || bp.perception_framing || [],
      omissions: bp.omissions || bp.information_suppression || [],
      emotionalTriggers: bp.emotionalTriggers || bp.emotional_triggers || bp.psychological_triggers || []
    };
  }

  // Power Amplification
  if (hmRaw.power_amplification || hmRaw.powerAmplification) {
    const pa = hmRaw.power_amplification || hmRaw.powerAmplification;
    normalized.powerAmplification = {
      actors: (pa.actors || []).map((actor: any) => ({
        name: actor.name || '',
        category: actor.category || 'Media',
        incentiveAlignment: actor.incentiveAlignment || actor.incentive_alignment || 0,
        distributionPower: actor.distributionPower || actor.distribution_power || 0,
        isInferred: actor.isInferred ?? actor.is_inferred ?? false,
        evidence: actor.evidence || [],
        source: actor.source || (actor.isInferred ? 'Inferred' : 'Explicit')
      }))
    };
  }

  // Strategic Consequence
  if (hmRaw.strategic_consequence || hmRaw.strategicConsequence) {
    const sc = hmRaw.strategic_consequence || hmRaw.strategicConsequence;
    normalized.strategicConsequence = {
      shortTermEffect: sc.shortTermEffect || sc.short_term_effect || sc.short_term || '',
      mediumTermRisk: sc.mediumTermRisk || sc.medium_term_risk || sc.medium_term || '',
      longTermDistortion: sc.longTermDistortion || sc.long_term_distortion || sc.long_term || ''
    };
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
};

/**
 * Normalizes analysis data from various backend formats
 */
const normalizeAnalysisData = (rawData: any): AnalysisData => {
  console.log('🔍 Raw data received:', rawData);

  let normalizedData: any;

  // Auto-upgraded format
  if (rawData.mode === 'auto-upgraded' && rawData.full) {
    console.log('📊 Using FULL analysis data (auto-upgraded)');
    normalizedData = {
      ...rawData.full,
      mode: 'full',
      wasAutoUpgraded: true
    };
  } else if (rawData.data) {
    console.log('📊 Using standard data structure');
    normalizedData = {
      ...rawData.data,
      mode: rawData.mode || 'lite'
    };
  } else {
    console.log('📊 Using direct structure');
    normalizedData = {
      ...rawData,
      ...(rawData.rawAnalysis || {})
    };
  }

  // Normalize summary fields
  if (normalizedData.summary) {
    if (normalizedData.summary.oneLineSummary && !normalizedData.summary.executiveSummary) {
      normalizedData.summary.executiveSummary = normalizedData.summary.oneLineSummary;
    }
    if (normalizedData.summary.context && !normalizedData.summary.relatedEntities) {
      normalizedData.summary.relatedEntities = normalizedData.summary.context;
    }
  }

  // 🔧 FIX: Normalize Hidden Motives data
  const hmRaw = normalizedData?.rawAnalysis?.hiddenMotives 
             || normalizedData?.rawAnalysis?.hidden_motives
             || normalizedData?.hiddenMotives 
             || normalizedData?.hidden_motives
             || normalizedData?.motive;

  console.log('🧠 Hidden Motives raw data:', hmRaw);

  if (hmRaw) {
    const normalizedHM = normalizeHiddenMotives(hmRaw);
    console.log('✅ Normalized Hidden Motives:', normalizedHM);
    
    if (normalizedHM) {
      normalizedData.hiddenMotives = normalizedHM;
      // Also set in rawAnalysis for backward compatibility
      if (!normalizedData.rawAnalysis) {
        normalizedData.rawAnalysis = {};
      }
      normalizedData.rawAnalysis.hiddenMotives = normalizedHM;
    }
  } else {
    console.warn('⚠️ No Hidden Motives data found in any expected location');
  }

  if (!normalizedData.mode) {
    console.warn('⚠️ mode was undefined, defaulting to "full"');
    normalizedData.mode = 'full';
  }

  console.log('✅ Final normalized data:', {
    hasSummary: !!normalizedData.summary,
    hasCredibility: !!normalizedData.credibility,
    hasPestle: !!normalizedData.pestle,
    hasMarketImpact: !!normalizedData.marketImpact,
    hasPartyImpact: !!normalizedData.partyImpact,
    hasHiddenMotives: !!normalizedData.hiddenMotives,
    hasChronos: !!normalizedData.chronos,
    hasEntropy: !!normalizedData.entropy,
    hasOuroboros: !!normalizedData.ouroboros,
    mode: normalizedData.mode
  });

  return normalizedData;
};

/* =========================
   Market Impact Section Component
========================= */


// WorkflowStep component
const WorkflowStep = ({
  icon: Icon,
  title,
  subtitle,
  isActive,
  isLast,
  children,
  verdictText,
  beginnerBullets,
  id
}: {
  icon: any,
  title: string,
  subtitle: string,
  isActive: boolean,
  isLast?: boolean,
  children: React.ReactNode,
  verdictText?: string,
  beginnerBullets?: string[],
  id?: string
}) => {
  return (
    <div id={id} className="relative flex gap-6 md:gap-10 scroll-mt-24">
      <div
        className="flex flex-col items-center w-6 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => {
          if (id) {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && id) {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      >
        <div className="w-[3px] h-[3px] rounded-full bg-blue-500" />
        {!isLast && (
          <div
            className="flex-grow my-2 rounded-full"
            style={{
              width: '2px',
              background: 'linear-gradient(to bottom, rgba(59,130,246,0.5), rgba(59,130,246,0.15))',
            }}
          />
        )}
      </div>

      <div className="flex-grow pb-16">
        <div className="mb-4 pt-1">
          <h2 className={`text-2xl font-extrabold transition-colors duration-500 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px 0px" }}
          transition={{ duration: 0.45 }}
          className="bg-white dark:bg-slate-900/70 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden backdrop-blur-lg"
        >
          <VerdictLine text={verdictText} />
          {children}
        </motion.div>
      </div>
    </div>
  );
};

// PESTLE Component
const PestleBarAndRadar = ({ pestle, isPremium, onSelectFactor }: { pestle: AnalysisData['pestle'], isPremium: boolean, onSelectFactor: (f: string | null) => void }) => {
  if (!pestle) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
        <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">PESTLE data not available for this article.</p>
      </div>
    );
  }

  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const [hoverFactor, setHoverFactor] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const radarRef = useRef<HTMLDivElement | null>(null);
  const [barVisible, setBarVisible] = useState(false);
  const [radarVisible, setRadarVisible] = useState(false);

  const radarData = Object.entries(FACTOR_CONFIG).map(([factor, config]) => {
    const fKey = factor.toLowerCase() as keyof typeof pestle;
    const factorData = (pestle && pestle[fKey]) || { score: 0, impact: 'low', factors: [] };
    const score = factorData.score ?? 0;
    const displayScore = isPremium ? score : Math.round(score * 0.65);
    return {
      factor,
      value: displayScore,
      highlightValue: hoverFactor === factor ? displayScore : 0,
      fullValue: score,
      impact: factorData.impact || 'low',
      color: config.color,
      description: config.description,
      icon: React.createElement(config.icon, { className: 'w-5 h-5' }),
      factors: factorData.factors || []
    };
  });

  
  
  const splitFactors = (arr: string[]) => {
    const pros: string[] = [];
    const cons: string[] = [];
    const pos = ['opportunity','growth','increase','support','favorable','stability','benefit','improve','positive'];
    const neg = ['risk','decline','decrease','sanction','uncertainty','cost','regulation','pressure','constraint','volatility','conflict','delay','negative'];
    arr.forEach(s => {
      const t = (s || '').toLowerCase();
      if (pos.some(w => t.includes(w))) pros.push(s);
      else if (neg.some(w => t.includes(w))) cons.push(s);
      else (pros.length <= cons.length ? pros : cons).push(s);
    });
    return { pros, cons };
  };

  useEffect(() => {
    const observe = (ref: React.RefObject<HTMLDivElement>, setter: (b: boolean) => void) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setter(true);
            if (ref.current) obs.unobserve(ref.current);
          }
        });
      }, { threshold: 0.2 });
      obs.observe(ref.current);
      return () => { if (ref.current) obs.unobserve(ref.current); };
    };
    const c1 = observe(barRef, setBarVisible);
    const c2 = observe(radarRef, setRadarVisible);
    return () => { c1 && c1(); c2 && c2(); };
  }, []);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4"/> Impact Scores by Factor
            </h4>
            <div className="text-xs text-gray-500 dark:text-gray-400">Click a bar to expand</div>
          </div>

          <div ref={barRef} style={{ minHeight: '360px', height: '360px' }} className="bg-gray-50 dark:bg-slate-900/30 rounded-lg p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={radarData} layout="vertical" margin={{ top: 8, right: 24, left: 60, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 13 }} />
                <YAxis type="category" dataKey="factor" tick={{ fontSize: 13 }} width={90} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value}/100`, 'Impact Score']} 
                />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={barVisible}
                  animationDuration={350}
                  onClick={(data) => {
                    const factor = (data && data.payload && data.payload.factor) || null;
                    setSelectedFactor(factor);
                    onSelectFactor(factor);
                  }}
                  cursor="pointer"
                >
                  {radarData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={hoverFactor === entry.factor ? entry.color : undefined}
                      strokeWidth={hoverFactor === entry.factor ? 2 : 0}
                      fillOpacity={hoverFactor === entry.factor ? 0.9 : 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">360° PESTLE Profile</h4>
          
          <div ref={radarRef} style={{ minHeight: '380px', height: '380px' }} className="bg-gray-50 dark:bg-slate-900/30 rounded-lg p-3">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="95%" margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                <PolarGrid stroke="#cbd5e1" className="dark:stroke-slate-700" />
                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 13 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 13 }} />
                <Radar 
                  name="Impact" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  isAnimationActive={radarVisible}
                  animationDuration={500}
                  dot={{ r: 3, fill: '#64748b' }}
                />
                <Radar
                  name="Highlight"
                  dataKey="highlightValue"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={hoverFactor ? 0.45 : 0}
                  isAnimationActive={false}
                  dot={{ r: hoverFactor ? 5 : 0, fill: '#f59e0b' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {radarData.map((item, idx) => (
          <motion.button
            key={idx}
            onClick={() => {
              setSelectedFactor(item.factor);
              onSelectFactor(item.factor);
            }}
            onHoverStart={() => setHoverFactor(item.factor)}
            onHoverEnd={() => setHoverFactor(null)}
            className={`p-4 rounded-xl border-2 transition-colors text-left ${
              selectedFactor === item.factor
                ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-300 dark:border-slate-600'
                : 'bg-white dark:bg-slate-900/30 border-gray-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40'
            }`}
          >
            {(() => { 
              const { pros, cons } = splitFactors(item.factors || []); 
              return (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: item.color }}>{item.factor}</div>
                    <div className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{item.value}</div>
                  </div>
                  <div className="col-span-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                    {!isPremium ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center py-8">
                          <Lock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Premium Feature</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[13px] font-semibold">Upside Drivers</div>
                          <ul className="mt-2 text-[13px] font-normal text-slate-600 dark:text-slate-400 list-none ml-0 space-y-1">
                            {(pros.length ? pros : [FACTOR_CONFIG[item.factor].description]).slice(0,3).map((p, i) => (
                              <li key={`pro-${i}`}>{p}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[13px] font-semibold">Downside Risks</div>
                          <ul className="mt-2 text-[13px] font-normal text-slate-600 dark:text-slate-400 list-none ml-0 space-y-1">
                            {(cons.length ? cons : []).slice(0,3).map((c, i) => (
                              <li key={`con-${i}`}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Main Component
const AnalysisResultPage = () => {
  const { tier, loading: tierLoading, canAccess } = useSubscription();
  const isPremium = tier === 'pro' || tier === 'business';

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  const mainRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: mainRef, layoutEffect: false });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = sessionStorage.getItem('analysisResult');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const normalized = normalizeAnalysisData(parsed);
        setAnalysisData(normalized);
      } catch (e) {
        console.error('Failed to parse analysisResult', e);
      }
    }
    setLoading(false);
  }, []);

  // ✅ Data destructuring MUST be before any early returns
  const { 
    summary = {}, 
    credibility = {}, 
    pestle, 
    marketImpact, 
    partyImpact, 
    chronos, 
    entropy, 
    motive, 
    ouroboros 
  } = analysisData || {};
  
  // 🔧 Strategy / Intent data (normalized from backend)
  const strategyIntent = analysisData?.hiddenMotives || analysisData?.rawAnalysis?.hiddenMotives || null;

  // ✅ useMemo AFTER data is available but BEFORE any returns
  const topPestleDriver = useMemo(() => {
    if (!pestle) return undefined;
    const entries = Object.entries(pestle as any)
      .map(([k, v]: any) => ({ k, s: typeof v?.score === 'number' ? v.score : -1 }))
      .filter((e) => e.s >= 0);
    if (!entries.length) return undefined;
    entries.sort((a, b) => b.s - a.s);
    const top = entries[0];
    return top ? top.k.charAt(0).toUpperCase() + top.k.slice(1) : undefined;
  }, [pestle]);

  // ✅ ALL early returns AFTER all hooks
  if (tierLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center text-slate-400">
        <AlertTriangle className="w-5 h-5 mr-2" /> No Analysis Data Found
      </div>
    );
  }

  console.log('🎯 Final Strategy Intent for render:', strategyIntent);

  // Helper functions AFTER all returns
  const handleDownload = () => {
    try {
      window.print();
    } catch {
      toast.error('Download failed. Please use browser print to save as PDF.');
    }
  };

  const handleExportCSV = () => {
    try {
      const data = analysisData || {};
      const baseRows = [
        ['title', String(data?.summary?.title ?? '')],
        ['timeframe', String(data?.summary?.timeframe ?? '')],
        ['executiveSummary', String(data?.summary?.executiveSummary ?? '')],
        ['accuracy', String(data?.summary?.accuracy ?? '')],
        ['dataPoints', String(data?.summary?.dataPoints ?? '')],
      ];
      const csv = baseRows.map(([k, v]) => `"${k.replace(/"/g,'""')}","${v.replace(/"/g,'""')}"`).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-summary.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch {
      toast.error('CSV export failed');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: analysisData?.summary?.title || 'Intelligence Report',
      text: 'NexVeris Intelligence Report',
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
      }
    } catch {
      toast.error('Share failed');
    }
  };

  const calculateSignalIntensity = () => {
    const baseScore = typeof entropy?.signalToNoise === 'number'
      ? entropy.signalToNoise
      : (typeof summary?.accuracy === 'number' ? summary.accuracy : undefined);
    if (baseScore == null) return undefined;
    const intensity = (baseScore / 10).toFixed(1);
    let label = 'LOW';
    if (baseScore >= 70) label = 'HIGH';
    else if (baseScore >= 40) label = 'MEDIUM';
    return { score: intensity, label, rawScore: baseScore };
  };

  const signalIntensity = calculateSignalIntensity();
  
  const getSignalColor = (score: number, label: string) => {
    const rounded = Math.round(score * 2) / 2;
    if (label === 'HIGH') {
      const steps = Math.max(0, (rounded - 7) / 0.5);
      const l = Math.max(38, Math.min(62, 52 - steps * 1.5));
      return `hsl(0, 75%, ${l}%)`;
    }
    if (label === 'MEDIUM') {
      const steps = Math.max(0, (rounded - 4) / 0.5);
      const l = Math.max(40, Math.min(65, 52 - steps * 1.2));
      return `hsl(48, 90%, ${l}%)`;
    }
    const steps = Math.max(0, rounded / 0.5);
    const l = Math.max(38, Math.min(62, 50 - steps * 1.0));
    return `hsl(140, 45%, ${l}%)`;
  };
  
  const signalColor = signalIntensity ? getSignalColor(parseFloat(String(signalIntensity.score)), signalIntensity.label) : '#64748b';

  const structuredVerdict = {
    timeframe: summary?.timeframe ?? "Not detected in source",
    locationEntities: summary?.relatedEntities ?? "Not detected in source",
    takeawayNote: summary?.executiveSummary || "Executive summary not available."
  };

  const takeawayPoints = (summary?.keyPoints && summary.keyPoints.length > 0)
    ? summary.keyPoints
    : structuredVerdict.takeawayNote
        .split(/[.;]\s+/)
        .map((s: string) => s.trim())
        .filter((s: string) => s)
        .slice(0, 5);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors">
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 origin-[0%] transform" style={{ scaleX }} />
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-md">{summary?.title || "Intelligence Report"}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3"/> NexVeris AI Report • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={handleDownload} className="p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Download PDF">
              <Download className="w-5 h-5" />
            </button>
            {canAccess('csv_export') && (
              <button onClick={handleExportCSV} className="p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Export CSV">
                <FileText className="w-5 h-5" />
              </button>
            )}
            <button onClick={handleShare} className="p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Share Report">
              <Share2 className="w-5 h-5" />
            </button>
            {!isPremium && (
              <button className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center">
                <Crown className="w-4 h-4 mr-1"/> Upgrade
              </button>
            )}
          </div>
        </div>
      </header>

      <main ref={mainRef} className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Decision Summary / One-Minute Intelligence Takeaway */}
        <section aria-labelledby="decision-summary" className="bg-slate-50 dark:bg-slate-900/40 border-l-4 border-blue-600 rounded-r-xl p-6 shadow-lg">
          {/* "Read this first" label */}
          <div className="text-[11px] uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold mb-3">
            ⏱ 30-second Decision Summary · Read this first
          </div>
          
          <h2 id="decision-summary" className="sr-only">Decision Summary / One-Minute Intelligence Takeaway</h2>
          
          {/* One-line verdict */}
          <p className="text-base font-bold text-slate-900 dark:text-white mb-4 leading-relaxed">
  {signalIntensity ? (
    signalIntensity.label === 'HIGH' ? (
      <>Treat as a high-impact signal. Structural implications are material and may require near-term exposure review.</>
    ) : signalIntensity.label === 'MEDIUM' ? (
      <>Treat as a base-case modifier. No immediate repositioning is required, but developments should be actively monitored.</>
    ) : (
      <>Treat as background context. This signal has limited decision relevance at the current stage.</>
    )
  ) : (
    <>Insufficient information to support a decision-relevant assessment.</>
  )}
</p>


          
          {/* WHAT/WHY/SO WHAT with icons */}
          <ul className="text-sm text-slate-800 dark:text-slate-200 space-y-2 pl-0 list-none">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div><strong>SIGNAL STRENGTH:</strong> Medium (67/100)</div>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div><strong>PRIMARY DRIVER:</strong> Legal</div>
            </li>
            <li className="flex items-start gap-2">
              <Target className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div><strong>POSITIONING POSTURE:</strong> Base-case reference; monitor developments</div>
            </li>
          </ul>
          {/* Action CTA */}
<div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
  <div className="text-sm text-slate-600 dark:text-slate-300">
    <span className="font-semibold text-slate-800 dark:text-white">
      Suggested Action:
    </span>{' '}
    Monitor developments and reassess exposure if signal strength changes.
  </div>

  <div className="flex gap-2">
    <button
      className="px-3 py-1.5 rounded-lg text-sm font-semibold
                 bg-slate-100 dark:bg-slate-800
                 text-slate-700 dark:text-slate-200
                 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
    >
      Monitor
    </button>

    <button
      className="px-3 py-1.5 rounded-lg text-sm font-semibold
                 border border-blue-600 text-blue-600
                 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
    >
      Review Exposure
    </button>
  </div>
</div>
      </section>
        <section className="bg-white dark:bg-slate-900/70 rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-lg">
          <div className="flex justify-between items-start mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm font-bold uppercase">
            <Activity className="w-4 h-4" /> Complete AI Analysis Workflow
          </div>
        </div>

          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">{summary?.title || 'Detailed Intelligence Report'}</h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-md">
            <strong>Executive Summary:</strong> {summary?.executiveSummary || 'Analysis is pending or data is incomplete.'}
          </p>
        </section>

        <section className="space-y-12">
          
          {/* Progress Bar - Shows the overall analysis workflow */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Analysis Workflow</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">From basic signal to future prediction</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[
                { label: '1. Signal', desc: 'Information strength check' },
                { label: '2. Source', desc: 'Credibility verification' },
                { label: '3. Forces', desc: 'External macro drivers' },
                { label: '4. Framing', desc: 'Why told this way' },
                { label: '5. Power', desc: 'Who has influence' },
                { label: '6. Market', desc: 'Financial impact' },
                { label: '7. Future', desc: 'Prediction paths' }
              ].map((step, i) => (
                <div 
                  key={i} 
                  className="text-center p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow cursor-pointer"
                  title={`Step ${i+1}: ${step.desc} - Part of progressive analysis from basic to advanced.`}
                  onClick={() => {
                    const anchor = `step-${i+1}`;
                    const el = document.getElementById(anchor);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{step.label}</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-tight">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4">
  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
    How to read this analysis (30 seconds)
  </p>
  <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-decimal list-inside">
    <li>Start with <strong>Decision Summary</strong> to understand how to treat this information.</li>
    <li>Review <strong>Steps 1–3</strong> for signal strength and macro drivers.</li>
    <li>Use <strong>Steps 4–7</strong> only if you need deeper narrative, power, or scenario context.</li>
  </ol>
</div>

          {/* Step 1: Situation Brief */}
          
          <WorkflowStep
            icon={Zap}
            title="1. Situation Brief"
            subtitle="Basic check: How strong is the information signal? (From noise to actionable insight)"
            isActive={true}
            id="step-1"
            verdictText={mkBriefVerdict(signalIntensity)}
            beginnerBullets={[
              `Timeframe: ${structuredVerdict.timeframe || 'Unknown'}`,
              `Entities: ${structuredVerdict.locationEntities || 'Not detected'}`,
              `Signal: ${signalIntensity?.label ? `${signalIntensity.label} (${signalIntensity.score}/10)` : 'Insufficient'}`,
            ]}
          >
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6 border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3"/> Time
                  </p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">{structuredVerdict.timeframe}</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3"/> Location / Entities
                  </p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">{structuredVerdict.locationEntities}</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3"/> Core Signal Intensity
                  </p>
                  <p className="text-lg font-extrabold" style={{ color: signalColor }}>
                    {signalIntensity ? `${signalIntensity.label} (${signalIntensity.score}/10)` : 'Insufficient information'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 mt-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-bold uppercase mb-4">
                    <FileText className="w-3 h-3" /> Takeaway Note
                  </div>
                  <ul className="mb-4 space-y-2">
                    {takeawayPoints.map((pt: string, i: number) => (
                      <li key={i} className="text-sm text-slate-800 dark:text-slate-200">• {pt}</li>
                    ))}
                  </ul>
                  {!isPremium && <WinnerLoserTeaser />}
                </div>
              </div>
            </div>
          </WorkflowStep>

          {/* Step 2: Source & Bias Check */}
          <WorkflowStep
            icon={Shield}
            title="2. Source & Bias Check"
            subtitle="Basic check: Can we trust this source? (Understanding reliability and potential bias)"
            isActive={true}
            id="step-2"
            verdictText={mkCredVerdict(credibility?.credibilityScore, credibility?.manipulationScore)}
            beginnerBullets={[
  `Overall reliability score: ${
    typeof credibility?.credibilityScore === "number"
      ? `${credibility.credibilityScore}/100`
      : "Unavailable"
  }`,
  `Narrative pressure signals detected: ${
    Array.isArray(credibility?.biasIndicators)
      ? credibility.biasIndicators.length
      : "Unavailable"
  }`,
  `Source quality: ${
    typeof credibility?.credibilityScore === "number"
      ? credibility.credibilityScore >= 70
        ? "Established publisher"
        : "Source quality unclear"
      : "Unavailable"
  }`,
]}


          >
            <div className="p-6">
              {credibility ? (
                <>
                  <CredibilityAssessment 
                    credibilityScore={credibility.credibilityScore ?? 0} 
                    redFlags={credibility.biasIndicators ?? []}
                    factors={credibility.factors ?? []} 
                    sourceInfo={{ isReputable: (credibility.credibilityScore ?? 0) >= 70, hasAuthor: true, hasCitations: true }} 
                  />
                <ManipulationScoreGauge
  credibilityData={{
    manipulationScore: credibility?.manipulationScore ?? 0,
    credibilityScore: credibility?.credibilityScore ?? 0,
    biasIndicators: credibility?.biasIndicators ?? [],
    factors: credibility?.factors ?? []
  }}
/>

                </>
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">Credibility data not available.</div>
              )}
            </div>
          </WorkflowStep>

          {/* Step 3: Big Picture Forces */}
          <WorkflowStep
            icon={Globe}
            title="3. Big Picture Forces"
            subtitle="What external forces are at play? (Politics, economy, technology, etc. driving the story)"
            isActive={true}
            id="step-3"
           verdictText={mkPestleVerdict(pestle)}
            beginnerBullets={(() => {
              const entries = pestle ? Object.entries(pestle) : [];
              const scores = entries.map(([k, v]: any) => ({ k, s: v?.score ?? 0 }));
              scores.sort((a, b) => b.s - a.s);
              const top = scores.slice(0, 2);
              return top.length
                ? top.map(t => `${t.k.charAt(0).toUpperCase() + t.k.slice(1)}: impact ${t.s}/100`)
                : ['Insufficient information. Review sources and timeline.'];
            })()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white">PESTLE Force Analysis</h4>
                <div className="flex items-center text-sm font-bold text-red-600 dark:text-red-400">
                  Avg Impact: {(() => {
                    const values = pestle ? Object.values(pestle).map(p => p?.score ?? 0) : [0,0,0,0,0,0];
                    return Math.round(values.reduce((s,n)=>s+n,0)/6);
                  })()} | Elevated Pressure
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                A visual comparison of factor magnitude (Bar Chart) and a profile of external pressures (Radar Chart).
              </p>

              {/* Free-tier clarity: Top 2 impact drivers with one-sentence explainers */}
              {!isPremium && pestle && (
                <div className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4">
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Top Impact Drivers</h5>
                  {(() => {
                    const entries = Object.entries(pestle as any).map(([k, v]: any) => ({ k, s: v?.score ?? 0 }));
                    entries.sort((a, b) => b.s - a.s);
                    const top = entries.slice(0, 2);
                    return top.length ? (
                      <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                        {top.map((t) => (
                          <li key={t.k}>
                            <strong className="capitalize">{t.k}</strong>: Elevated impact likely influences positioning and decision timing.
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-slate-600 dark:text-slate-300">Insufficient information. Review sources and timeline.</div>
                    );
                  })()}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Detailed pros/cons and strategy analysis are available with Premium.</div>
                </div>
              )}

              {pestle ? (
                <LazySection>
                  <div className="bg-white dark:bg-slate-900/70 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 backdrop-blur-lg">
                    <PestleBarAndRadar pestle={pestle} isPremium={isPremium} onSelectFactor={(f) => setSelectedFactor(f)} />
                  </div>
                </LazySection>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">PESTLE data not available for this article.</p>
                </div>
              )}
            </div>
          </WorkflowStep>

          {/* Step 4: Narrative Context & Incentives - FIXED WITH DATA NORMALIZATION */}
<WorkflowStep
  icon={Target}
  title="4. Why This Story Is Told This Way"
  subtitle="Who benefits and how is it framed?"
  isActive
  id="step-4"
  verdictText={mkIntentVerdict(strategyIntent)}
>
  <div className="p-6 font-sans text-sm leading-relaxed tracking-normal text-slate-700 dark:text-slate-300">
    <Step4NarrativeIntent
      strategyIntent={strategyIntent}
      isPremium={isPremium}
    />
  </div>
</WorkflowStep>


 {/* Step 5: Who Really Has Power */}
<WorkflowStep
  icon={Target}
  title="5. Who Really Has Power"
  subtitle="Who can actually influence outcomes? (Identifying key stakeholders and their leverage)"
  isActive={true}
  id="step-5"
  verdictText={mkPowerVerdict(partyImpact)}
  beginnerBullets={[
    `Data present: ${partyImpact ? "Yes" : "No"}`,
    `Strategy focus: ${partyImpact ? "High-power actors" : "Unknown"}`,
    `Risk absorption: ${partyImpact ? "Visible across counterparts" : "Not detected"}`,
  ]}
>
  <Step5PowerAmplification partyImpact={partyImpact} isPremium={isPremium} />
</WorkflowStep>

          {/* Step 6: Market Impact */}
 <WorkflowStep
  icon={TrendingUp}
  title="6. Market Impact"
  subtitle="How does this affect stocks? (Evidence-based winners and losers, not speculation)"
  isActive={true}
  id="step-6"
  verdictText={mkMarketVerdict(marketImpact?.overallSentiment)}
  beginnerBullets={[
    `Overall sentiment: ${marketImpact?.overallSentiment || 'Unknown'}`,
    `Institutional flow: ${marketImpact?.institutionalFlow || 'Unknown'}`,
    (() => {
      const t = marketImpact?.tickers;
      const count =
        (t?.direct?.length || 0) +
        (t?.indirect?.length || 0) +
        (t?.speculative?.length || 0);
      return `Coverage: ${count || 'Unknown'} tickers`;
    })(),
  ]}
>
  <Step6MarketImpact
    marketImpact={marketImpact}
    isPremium={isPremium}
  />
</WorkflowStep>


          {/* Step 7: What Happens Next */}
          <p className="text-xs text-slate-500 mb-3">
  You don’t need to read everything — most insights come from the first 3 steps.
</p>

          <WorkflowStep
  icon={GitBranch}
  title="7. What Happens Next"
  subtitle="Where is this heading? (Scenario paths, not predictions)"
  isActive={true}
  isLast={false}
  id="step-7"
  verdictText={mkNextVerdict(chronos, entropy, ouroboros)}
  beginnerBullets={[
    `Historical patterns: ${chronos ? 'Detected' : 'Not detected'}`,
    `Signal uncertainty: ${entropy ? 'Measured' : 'Unavailable'}`,
    `Feedback loops: ${ouroboros ? 'Present' : 'Not detected'}`,
  ]}
>
  <Step7Outlook
    chronos={chronos}
    entropy={entropy}
    ouroboros={ouroboros}
    isPremium={isPremium}
    verdictText={mkNextVerdict(chronos, entropy, ouroboros)}
  />
</WorkflowStep>

        </section>

        <section className="bg-slate-900 dark:bg-slate-800 text-white py-16 mt-12 rounded-2xl border border-slate-800 dark:border-slate-700">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold mb-4">Get the Full Intelligence Picture.</h2>
            <p className="text-slate-400 dark:text-slate-300 mb-8 text-lg">
              Join thousands of elite analysts using our AI to decode the market noise and gain a decisive edge.
            </p>
            <DailyIntelligenceSignup />
          </div>
        </section>
      </main>

      {!isPremium && (
        <div className="fixed right-6 bottom-6 z-50">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-4 shadow-2xl flex items-center gap-4">
            <Crown className="w-6 h-6 text-amber-300" />
            <div>
              <div className="text-sm font-bold">Unlock Premium Intelligence</div>
              <div className="text-xs opacity-80">Full PESTLE details, motive detection, market impact</div>
            </div>
            <button 
              onClick={() => (window.location.href = '/pricing')} 
              className="px-3 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalysisResultPageWrapper = () => (
  <SubscriptionProvider>
    <AnalysisResultPage />
  </SubscriptionProvider>
);

export default AnalysisResultPageWrapper;

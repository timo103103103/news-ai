// AnalysisResultPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell
} from 'recharts';

import { useSubscription, SubscriptionProvider } from '@/contexts/SubscriptionContext';
import StockImpactMeter from '@/components/StockImpactMeter';
import MotiveHeatmap from '@/components/MotiveHeatmap';
import PartyBarChart from '@/components/PartyBarChart';
import ManipulationScoreGauge from '@/components/ManipulationScoreGauge';
import WinnerLoserTeaser from '@/components/WinnerLoserTeaser';
import ChronosIsomorphism from '@/components/ChronosIsomorphism';
import ThermodynamicEntropy from '@/components/ThermodynamicEntropy';
import { TierLock } from '@/components/TierLock';
import DailyIntelligenceSignup from '@/components/DailyIntelligenceSignup';
import CredibilityAssessment from '@/components/CredibilityAssessment';
import DailyIntelligenceSignupCmp from '@/components/DailyIntelligenceSignup'; // alias if needed

// lucide icons (selected set)
import {
  ArrowLeft, Download, Share2, Zap, Globe, Shield,
  TrendingUp, Activity, Lock, CheckCircle2, FileText,
  Microscope, Clock, AlertTriangle, User, Aperture, BarChart3,
  GitBranch, AlertCircle, ArrowUpRight, Crown, ShieldAlert, Target
} from 'lucide-react';

// -----------------------------
// Types
// -----------------------------
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
  chronos?: any;
  entropy?: any;
}

// -----------------------------
// Small utilities
// -----------------------------
const FACTOR_CONFIG: Record<string, { color: string; icon: any; description: string }> = {
  Political: {
    color: '#3B82F6',
    icon: User,
    description: 'Government policies, regulations, and political stability affecting operations'
  },
  Economic: {
    color: '#10B981',
    icon: Target,
    description: 'Economic indicators, market conditions, and financial environment'
  },
  Social: {
    color: '#F59E0B',
    icon: TrendingUp,
    description: 'Cultural trends, demographics, and societal attitudes'
  },
  Technological: {
    color: '#8B5CF6',
    icon: Microscope,
    description: 'Innovation, automation, and technological disruption'
  },
  Legal: {
    color: '#EF4444',
    icon: FileText,
    description: 'Laws, compliance requirements, and legal frameworks'
  },
  Environmental: {
    color: '#06B6D4',
    icon: Aperture,
    description: 'Climate change, sustainability, and environmental regulations'
  },
};

const getImpactText = (impact: string, score: number) => {
  if (score >= 70 || impact === 'high') return 'High Impact';
  if (score >= 40 || impact === 'medium') return 'Medium Impact';
  return 'Low Impact';
};

// -----------------------------
// STEP PER-ROW: WorkflowStep (from script #1, adapted)
// -----------------------------
const WorkflowStep = ({
  icon: Icon,
  title,
  subtitle,
  isActive,
  isLast,
  children
}: {
  icon: any,
  title: string,
  subtitle: string,
  isActive: boolean,
  isLast?: boolean,
  children: React.ReactNode
}) => {
  return (
    <div className="relative flex gap-6 md:gap-10">
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-xl transition-colors duration-500 ${isActive ? 'bg-blue-600 border-white text-white ring-4 ring-blue-200' : 'bg-white border-slate-100 text-slate-400'}`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        {!isLast && (
          <div className="flex-grow w-0.5 bg-slate-200 my-2 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full bg-blue-500"
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true, margin: "-100px 0px" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </div>
        )}
      </div>

      <div className="flex-grow pb-16">
        <div className="mb-4 pt-1">
          <h2 className={`text-2xl font-extrabold transition-colors duration-500 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px 0px" }}
          transition={{ duration: 0.45 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

// -----------------------------
// PESTLE charts + cards (from script #2)
// -----------------------------
const PestleBarAndRadar = ({ pestle, isPremium, onSelectFactor }: { pestle: AnalysisData['pestle'], isPremium: boolean, onSelectFactor: (f: string | null) => void }) => {
  // create radarData from pestle + config
  const radarData = Object.entries(FACTOR_CONFIG).map(([factor, config]) => {
    const fKey = factor.toLowerCase() as keyof typeof pestle;
    const factorData = (pestle && pestle[fKey]) || { score: 0, impact: 'low', factors: [] };
    const score = factorData.score ?? 0;
    const displayScore = isPremium ? score : Math.round(score * 0.65);
    return {
      factor,
      value: displayScore,
      fullValue: score,
      impact: factorData.impact || 'low',
      color: config.color,
      description: config.description,
      icon: React.createElement(config.icon, { className: 'w-5 h-5' }),
      factors: factorData.factors || []
    };
  });

  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const radarRef = useRef<HTMLDivElement | null>(null);
  const [barVisible, setBarVisible] = useState(false);
  const [radarVisible, setRadarVisible] = useState(false);

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

  const getImpactBadge = (fullValue: number, impact: string) => {
    if (fullValue > 70 || impact === 'high') return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">HIGH</span>;
    if (fullValue > 40 || impact === 'medium') return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">MEDIUM</span>;
    return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">LOW</span>;
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Impact Scores by Factor</h4>
            <div className="text-xs text-gray-500">Click a bar to expand</div>
          </div>

          <div ref={barRef} className="h-56 bg-gray-50 rounded-lg p-3 flex items-center justify-center">
            <ResponsiveContainer width="95%" height="95%">
              <BarChart data={radarData} layout="vertical" margin={{ top: 4, right: 8, left: 60, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="factor" tick={{ fontSize: 11, fill: '#4B5563' }} width={75} />
                <RechartsTooltip formatter={(value: number) => [`${value}/100`, 'Impact Score']} />
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
                >
                  {radarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={selectedFactor === entry.factor ? 1 : 0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Why this matters</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {radarData.slice().sort((a,b)=>b.fullValue-a.fullValue).slice(0,3).map(f => (
                <div key={f.factor} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => { setSelectedFactor(f.factor); onSelectFactor(f.factor); }}>
                  <div style={{ color: f.color }}>{f.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{f.factor}</span>
                      {getImpactBadge(f.fullValue, f.impact)}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{f.description}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Related: {f.factors.slice(0,2).join(', ') || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Microscope className="w-4 h-4 text-purple-600"/> Holistic View</h4>
            <div className="text-xs text-gray-500">Normalized view</div>
          </div>
          <div ref={radarRef} className="h-56 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 flex items-center justify-center">
            <ResponsiveContainer width="95%" height="95%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fontSize: 10, fill: '#64748b' }} tickCount={5} />
                <Radar name="Impact Score" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.45} strokeWidth={2} isAnimationActive={radarVisible} animationDuration={400} />
                <RechartsTooltip formatter={(v:number)=>[`${v}/100`, 'Impact']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Key insights</h5>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{radarData.filter(f=>f.fullValue>70).length}</div>
                <div className="text-xs text-gray-600">High Impact</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{radarData.filter(f=>f.fullValue>40 && f.fullValue<=70).length}</div>
                <div className="text-xs text-gray-600">Medium Impact</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -----------------------------
// Main Page Component (merged)
// -----------------------------
const AnalysisResultPage = () => {
  const { tier } = useSubscription();
  const isPremium = tier === 'premium' || tier === 'enterprise';

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  // scroll progress for header
  const mainRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: mainRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResult');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAnalysisData(parsed.rawAnalysis || parsed);
      } catch (e) {
        console.error('Failed to parse analysisResult', e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
        <AlertTriangle className="w-5 h-5 mr-2" /> No Analysis Data Found
      </div>
    );
  }

  // convenience
  const { summary, credibility, pestle, marketImpact, partyImpact, chronos, entropy, motive } = analysisData;

  // structured verdict
  const structuredVerdict = {
    timeframe: summary?.timeframe || summary?.dataPoints ? summary?.timeframe : "Immediate to 3 months",
    locationEntities: summary?.relatedEntities || "Relevant actors & regions",
    takeawayNote: summary?.executiveSummary || "Executive summary not available."
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 origin-[0%] transform" style={{ scaleX }} />
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 truncate max-w-md">{summary?.title || "Intelligence Report"}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1"><FileText className="w-3 h-3"/> Intelligence Report • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg" title="Download PDF"><Download className="w-5 h-5" /></button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg" title="Share Report"><Share2 className="w-5 h-5" /></button>
            {!isPremium && <button className="px-3 py-1.5 bg-yellow-400 text-yellow-900 font-bold rounded-lg text-sm hover:bg-yellow-300 transition-colors flex items-center"><Zap className="w-4 h-4 mr-1"/> Upgrade</button>}
          </div>
        </div>
      </header>

      <main ref={mainRef} className="max-w-6xl mx-auto px-6 py-12 space-y-12">

        {/* Intro / Exec Summary */}
        <section className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm font-bold uppercase">
              <Activity className="w-4 h-4" /> Complete AI Analysis Workflow
            </div>
            <div className="flex items-center text-sm text-slate-500">Analyst: <User className="w-4 h-4 ml-2 mr-1"/> <span className="font-medium">Aether-AI v3.1</span></div>
          </div>

          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">{summary?.title || 'Detailed Intelligence Report'}</h2>
          <p className="text-xl text-slate-600 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 rounded-md">
            <strong>Executive Summary:</strong> {summary?.executiveSummary || 'Analysis is pending or data is incomplete.'}
          </p>
        </section>

        {/* 6-Step Workflow */}
        <section className="space-y-12">
          {/* Step 1: Strategic Verdict */}
          <WorkflowStep icon={Zap} title="1. Strategic Verdict" subtitle="The actionable synthesis of the core signal." isActive={true}>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6 border-slate-100">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs font-bold text-blue-700 uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Time</p>
                  <p className="text-lg font-extrabold text-slate-900">{structuredVerdict.timeframe}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs font-bold text-blue-700 uppercase mb-1 flex items-center gap-1"><Globe className="w-3 h-3"/> Location / Entities</p>
                  <p className="text-lg font-extrabold text-slate-900">{structuredVerdict.locationEntities}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs font-bold text-blue-700 uppercase mb-1 flex items-center gap-1"><Zap className="w-3 h-3"/> Core Signal Intensity</p>
                  <p className="text-lg font-extrabold text-slate-900">HIGH (9.1/10)</p>
                </div>
              </div>

              <div className="flex items-start gap-6 mt-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-bold uppercase mb-4">
                    <FileText className="w-3 h-3" /> Takeaway Note
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-yellow-500 pl-3">{structuredVerdict.takeawayNote}</h3>
                  {!isPremium && <WinnerLoserTeaser />}
                </div>
              </div>
            </div>
          </WorkflowStep>

          {/* Step 2: Verification */}
          <WorkflowStep icon={Shield} title="2. Verification Layer" subtitle="Assessing source credibility, bias, and manipulation risk." isActive={true}>
            <div className="p-6">
              {credibility ? (
                <>
                  <CredibilityAssessment credibilityScore={credibility.credibilityScore ?? 0} redFlags={credibility.biasIndicators ?? []} sourceInfo={{ isReputable: (credibility.credibilityScore ?? 0) >= 70, hasAuthor: true, hasCitations: true }} />
                  <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <ManipulationScoreGauge manipulationScore={credibility.manipulationScore ?? 0} biasIndicators={credibility.biasIndicators ?? []} />
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500">Credibility data not available.</div>
              )}
            </div>
          </WorkflowStep>

          {/* Step 3: Macro Drivers (PESTLE) */}
          <WorkflowStep icon={Globe} title="3. Macro Drivers" subtitle="Scanning the PESTLE landscape for external pressures and context." isActive={true}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-extrabold text-2xl text-slate-900 flex items-center">PESTLE Force Analysis</h4>
                <div className="flex items-center text-sm font-bold text-red-600">Avg Impact: {(() => {
                  const values = pestle ? Object.values(pestle).map(p => p?.score ?? 0) : [0,0,0,0,0,0];
                  const avg = Math.round(values.reduce((s,n)=>s+n,0)/6);
                  return avg;
                })()} | Critical Threat</div>
              </div>
              <p className="text-slate-600 mb-6">A visual comparison of factor magnitude (Bar Chart) and a profile of external pressures (Radar Chart).</p>

              {/* Reusable PESTLE charts */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <PestleBarAndRadar pestle={pestle} isPremium={isPremium} onSelectFactor={(f) => setSelectedFactor(f)} />
              </div>

              {/* Selected factor details or fallback */}
              {selectedFactor && pestle && (
                <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-blue-100">
                  {(() => {
                    const factorKey = selectedFactor.toLowerCase() as keyof typeof pestle;
                    const fData = pestle[factorKey];
                    const conf = FACTOR_CONFIG[selectedFactor as keyof typeof FACTOR_CONFIG];
                    if (!fData) return <div>No detailed data for this factor.</div>;
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${conf.color}20`, color: conf.color }}>
                              {React.createElement(conf.icon, { className: 'w-6 h-6' })}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{selectedFactor} — {fData.score}/100</h4>
                              <p className="text-sm text-gray-600">{conf.description}</p>
                            </div>
                          </div>

                          {isPremium ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h5 className="font-semibold text-sm text-gray-900 mb-2">Implications</h5>
                                <ul className="text-xs text-gray-700 list-disc list-inside">
                                  <li>Immediate operational pressure</li>
                                  <li>Potential regulatory action</li>
                                </ul>
                              </div>
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h5 className="font-semibold text-sm text-gray-900 mb-2">Risks</h5>
                                <ul className="text-xs text-gray-700 list-disc list-inside">
                                  <li>Market access disruption</li>
                                  <li>Short-term volatility</li>
                                </ul>
                              </div>
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h5 className="font-semibold text-sm text-gray-900 mb-2">Opportunities</h5>
                                <ul className="text-xs text-gray-700 list-disc list-inside">
                                  <li>Strategic repositioning</li>
                                  <li>Capability investment</li>
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                              <div className="flex items-center gap-3 mb-4">
                                <ShieldAlert className="w-6 h-6 text-blue-600" />
                                <div>
                                  <h5 className="font-semibold text-gray-900 text-sm">Premium Feature</h5>
                                  <p className="text-xs text-gray-600">Unlock detailed implications, risks and strategies for each PESTLE factor.</p>
                                </div>
                              </div>
                              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">Upgrade to Premium →</button>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-gray-900 mb-3">Key Factors Identified</h5>
                            <ul className="space-y-2 text-sm text-gray-700">
                              {fData.factors && fData.factors.length > 0 ? fData.factors.map((x:string, i:number) => <li key={i}>• {x}</li>) : <li>—</li>}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          </WorkflowStep>

          {/* Step 4: Motive Detection */}
          <WorkflowStep icon={Microscope} title="4. Motive Detection" subtitle="Uncovering the hidden agenda and underlying bias behind the narrative." isActive={true}>
            <div className="p-6">
              {isPremium ? (
                motive ? <MotiveHeatmap motiveData={motive} /> : <div className="p-8 text-center text-slate-500">Motive data not available.</div>
              ) : (
                <TierLock feature="motive_analysis" className="min-h-[300px] bg-slate-50">
                  <div className="p-8 text-center">
                    <Lock className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">Unlock Motive Analysis</h3>
                    <p className="text-slate-600">See the <strong>hidden agenda</strong> and primary bias driving this information.</p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Upgrade to Premium</button>
                  </div>
                </TierLock>
              )}
            </div>
          </WorkflowStep>

          {/* Step 5: Market Projections */}
          <WorkflowStep icon={TrendingUp} title="5. Market Projections" subtitle="Quantifying the financial and political impact on specific assets and entities." isActive={true}>
            <div className="p-6">
              {isPremium ? (
                marketImpact ? <StockImpactMeter marketImpactData={marketImpact} /> : <div className="p-8 text-center text-slate-500">Market impact data not available.</div>
              ) : (
                <TierLock feature="market_impact" className="min-h-[300px] bg-slate-50">
                  <div className="p-8 text-center">
                    <TrendingUp className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">Access Financial Impact</h3>
                    <p className="text-slate-600">Quantify the projected stock movement and political exposure based on this report.</p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Upgrade to Premium</button>
                  </div>
                </TierLock>
              )}

              {/* Party / Stakeholder */}
              <div className="mt-6">
                {isPremium ? (
                  partyImpact ? <PartyBarChart partyImpactData={partyImpact} /> : <div className="p-6 text-center text-slate-500">Stakeholder impact not available.</div>
                ) : (
                  <TierLock feature="stakeholder_impact" className="min-h-[180px]">
                    <div className="p-6 text-center text-slate-500">Upgrade to see stakeholder impact.</div>
                  </TierLock>
                )}
              </div>
            </div>
          </WorkflowStep>

          {/* Step 6: Predictive Modeling */}
          <WorkflowStep icon={Clock} title="6. Predictive Modeling" subtitle="Looking ahead using historical isomorphism and narrative entropy." isActive={true} isLast={true}>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-6 bg-blue-50/50">
                <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Aperture className="w-4 h-4 text-purple-600"/> Narrative Entropy</h4>
                <p className="text-sm text-slate-600 mb-4">Measures the predictability and stability of the information over time. Low entropy suggests high stability.</p>
                {entropy ? <ThermodynamicEntropy data={entropy} /> : <div className="p-4 text-slate-500">Entropy data not available.</div>}
              </div>

              <div className="p-6 bg-blue-50/50">
                <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-600"/> Historical Patterns (Chronos)</h4>
                <p className="text-sm text-slate-600 mb-4">Identifies similar events in history (isomorphisms) to project potential outcomes.</p>
                {chronos ? <ChronosIsomorphism data={chronos} /> : <div className="p-4 text-slate-500">Chronos data not available.</div>}
              </div>
            </div>
          </WorkflowStep>
        </section>

        {/* Footer CTA */}
        <section className="bg-slate-900 text-white py-16 mt-12 rounded-2xl">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold mb-4">Get the Full Intelligence Picture.</h2>
            <p className="text-slate-400 mb-8 text-lg">Join thousands of elite analysts using our AI to decode the market noise and gain a decisive edge.</p>
            
          </div>
        </section>

      </main>

      {/* Upgrade sticky CTA for non-premium */}
      {!isPremium && (
        <div className="fixed right-6 bottom-6 z-50">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-4 shadow-2xl flex items-center gap-4">
            <Crown className="w-6 h-6 text-amber-300" />
            <div>
              <div className="text-sm font-bold">Unlock Premium Intelligence</div>
              <div className="text-xs opacity-80">Full PESTLE details, motive detection, market impact</div>
            </div>
            <button onClick={() => (window.location.href = '/pricing')} className="px-3 py-2 bg-white text-blue-600 rounded-lg font-semibold">Upgrade</button>
          </div>
        </div>
      )}
    </div>
  );
};

// wrapper with provider
const AnalysisResultPageWrapper = () => (
  <SubscriptionProvider>
    <AnalysisResultPage />
  </SubscriptionProvider>
);

export default AnalysisResultPageWrapper;

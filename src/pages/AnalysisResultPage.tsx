// AnalysisResultPage.tsx - COMPLETE VERSION WITH ALL 7 SECTIONS
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell
} from 'recharts';

import { useSubscription, SubscriptionProvider } from '@/contexts/SubscriptionContext';
import StockImpactMeter, { ImpactDistributionMeter } from '@/components/StockImpactMeter';
import MotiveDetectionDisplay from '@/components/MotiveDetectionDisplay';
import PartyBarChart from '@/components/PartyBarChart';
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
}

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

/* =========================
   Market Impact Section Component
========================= */

interface MarketImpactSectionProps {
  marketImpact: {
    tickers: {
      direct: any[];
      indirect: any[];
      speculative: any[];
    };
    analystNote?: string;
    logicChain?: {
      primaryTrigger?: string;
      transmissionPath?: string[];
      affectedThemes?: string[];
    };
    overallSentiment?: string;
    institutionalFlow?: string;
  };
  className?: string;
}

function MarketImpactSection({ marketImpact, className = "" }: MarketImpactSectionProps) {
  const { tickers, analystNote, logicChain, overallSentiment, institutionalFlow } = marketImpact;
  
  // Calculate total tickers
  const totalTickers = (tickers?.direct?.length || 0) + 
                       (tickers?.indirect?.length || 0) + 
                       (tickers?.speculative?.length || 0);

  // Sentiment color mapping
  const sentimentColor = overallSentiment === 'Bullish' ? 'text-green-600 dark:text-green-400' :
                        overallSentiment === 'Bearish' ? 'text-red-600 dark:text-red-400' :
                        'text-slate-600 dark:text-slate-400';

  return (
    <section className={`bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Market Impact
        </h3>
        {overallSentiment && (
          <span className={`text-sm font-semibold ${sentimentColor}`}>
            {overallSentiment} {institutionalFlow && `· ${institutionalFlow}`}
          </span>
        )}
      </div>

      {/* Analyst Note */}
      {analystNote && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg mb-4 border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-500" />
            Analyst Perspective
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">{analystNote}</p>
        </div>
      )}

      {/* Logic Chain */}
      {logicChain && logicChain.primaryTrigger && (
        <div className="mb-4 text-sm bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Reasoning Chain</h4>
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">▸</span>
              <span><strong className="text-blue-900 dark:text-blue-300">Trigger:</strong> {logicChain.primaryTrigger}</span>
            </li>
            {logicChain.transmissionPath?.map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-2 pl-4">
                <span className="text-slate-400 dark:text-slate-500 mt-0.5">→</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
          {logicChain.affectedThemes && logicChain.affectedThemes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {logicChain.affectedThemes.map((theme: string, i: number) => (
                <span key={i} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Impact Distribution + Ticker Cards */}
      {totalTickers > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Distribution Meter */}
          <div className="md:col-span-1">
            <ImpactDistributionMeter
              direct={tickers?.direct?.length || 0}
              indirect={tickers?.indirect?.length || 0}
              speculative={tickers?.speculative?.length || 0}
            />
          </div>

          {/* Ticker Cards by Tier */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['direct', 'indirect', 'speculative'] as const).map((tier) => {
              const tierTickers = tickers?.[tier] || [];
              const tierColors = {
                direct: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300' },
                indirect: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300' },
                speculative: { bg: 'bg-slate-50 dark:bg-slate-800/50', border: 'border-slate-200 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300' }
              };
              const colors = tierColors[tier];

              return (
                <div key={tier} className="space-y-3">
                  <h4 className={`text-sm font-semibold capitalize mb-2 ${colors.text}`}>
                    {tier} Targets ({tierTickers.length})
                  </h4>
                  
                  {tierTickers.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">No equities found</p>
                  ) : (
                    tierTickers.map((ticker: any) => (
                      <div
                        key={ticker.symbol}
                        className={`border rounded-lg p-3 text-xs ${colors.bg} ${colors.border} hover:shadow-md transition-shadow cursor-pointer`}
                        onClick={() => window.open(`https://finance.yahoo.com/quote/${ticker.symbol}`, '_blank')}
                      >
                        {/* Symbol, Sentiment, and Evidence Badge */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <strong className="text-base font-bold text-slate-900 dark:text-white">
                            {ticker.symbol}
                          </strong>

                          {/* Sentiment Badge */}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                            ${ticker.sentiment === 'Bullish' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                              ticker.sentiment === 'Bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {ticker.sentiment}
                          </span>

                          {/* Evidence Badge */}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wide
                              ${ticker.tier === 'Direct'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                                : ticker.tier === 'Indirect'
                                ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                : 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                              }`}
                          >
                            {ticker.tier === 'Direct'
                              ? 'EXPLICIT'
                              : ticker.tier === 'Indirect'
                              ? 'AI INFERRED'
                              : 'STRUCTURAL'}
                          </span>
                        </div>

                        {/* Company Name */}
                        {ticker.name && (
                          <div className="text-slate-600 dark:text-slate-400 font-medium mb-2 text-xs">
                            {ticker.name}
                          </div>
                        )}

                        {/* Impact Mechanism */}
                        <div className="text-slate-700 dark:text-slate-300 mb-2 font-medium">
                          {ticker.impactMechanism || 'Market Impact'}
                        </div>

                        {/* Confidence & Time Horizon */}
                        <div className="flex gap-2 mb-2 flex-wrap">
                          {ticker.confidence !== undefined && (
                            <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded font-semibold">
                              {ticker.confidence}% confidence
                            </span>
                          )}
                          {ticker.timeHorizon && (
                            <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-medium">
                              {ticker.timeHorizon}
                            </span>
                          )}
                        </div>

                        {/* Risk Flag */}
                        {ticker.riskFlag && (
                          <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs">
                            <span className="text-amber-700 dark:text-amber-300 font-semibold">⚠️ {ticker.riskFlag}</span>
                          </div>
                        )}

                        {/* Evidence Basis - Always show, different content per tier */}
                        <div className="text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">Evidence Basis:</span>
                          
                          {/* Direct: Show sourceSentence as quote */}
                          {ticker.tier === 'Direct' && ticker.evidence?.sourceSentence && (
                            <p className="italic mt-1">
                              "{ticker.evidence.sourceSentence}"
                            </p>
                          )}

                          {/* Indirect/Speculative: Show inferenceBasis */}
                          {ticker.tier !== 'Direct' && ticker.evidence?.inferenceBasis && (
                            <p className="mt-1">
                              {ticker.evidence.inferenceBasis}
                            </p>
                          )}

                          {/* Fallback if no evidence provided */}
                          {!ticker.evidence?.sourceSentence && !ticker.evidence?.inferenceBasis && (
                            <p className="mt-1 text-slate-400 dark:text-slate-500 italic">
                              No evidence details available
                            </p>
                          )}
                        </div>

                        {/* Speculative Risk Disclaimer */}
                        {ticker.tier === 'Speculative' && (
                          <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            Low-confidence structural inference · Not an explicit mention
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-10 text-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-900/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
          <Activity className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h5 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No Verified Equities Detected</h5>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This article does not explicitly mention publicly traded companies or stock symbols.
          </p>
        </div>
      )}
    </section>
  );
}

// WorkflowStep component
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
      <div className="relative flex flex-col items-center flex-shrink-0 w-12">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={isActive ? { scale: [1, 1.06, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
          transition={isActive ? { duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } : { duration: 0.6 }}
          className={`z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-xl transition-colors duration-500 ${isActive ? 'bg-blue-600 border-white dark:border-slate-800 text-white ring-4 ring-blue-200 dark:ring-blue-900' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        <div className={`flex-grow w-1 my-2 relative overflow-hidden rounded-full ${isActive ? 'bg-blue-300 dark:bg-blue-900' : 'bg-slate-200 dark:bg-slate-700'}`}>
          <motion.div
            className="absolute top-0 left-0 w-full bg-blue-500 rounded-full"
            initial={{ height: "0%" }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true, margin: "-100px 0px" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 opacity-30 rounded-full" style={{ backgroundImage: 'linear-gradient(to bottom, transparent 0%, rgba(59,130,246,0.35) 50%, transparent 100%)' }} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 dark:bg-blue-300 rotate-45 rounded-sm shadow-[0_0_6px_rgba(59,130,246,0.25)] dark:shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse" />
        </div>
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
          {children}
        </motion.div>
      </div>
    </div>
  );
};

// PESTLE Component
const PestleBarAndRadar = ({ pestle, isPremium, onSelectFactor }: { pestle: AnalysisData['pestle'], isPremium: boolean, onSelectFactor: (f: string | null) => void }) => {
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
  const { tier } = useSubscription();
  const isPremium = tier === 'pro' || tier === 'business';

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  const mainRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: mainRef });

  const handleDownload = () => {
    try {
      window.print();
    } catch {
      toast.error('Download failed. Please use browser print to save as PDF.');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: summary?.title || 'Intelligence Report',
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
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = sessionStorage.getItem('analysisResult');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAnalysisData({
          ...parsed,
          ...(parsed.rawAnalysis || {}),
        });
      } catch (e) {
        console.error('Failed to parse analysisResult', e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
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

  const { summary, credibility, pestle, marketImpact, partyImpact, chronos, entropy, motive, ouroboros } = analysisData;
  const hm = analysisData?.rawAnalysis?.hiddenMotives ?? analysisData?.hiddenMotives ?? null;

  const calculateSignalIntensity = () => {
    const signalScore = entropy?.signalToNoise ?? summary?.accuracy ?? 0;
    const intensity = (signalScore / 10).toFixed(1);
    
    let label = 'LOW';
    if (signalScore >= 70) label = 'HIGH';
    else if (signalScore >= 40) label = 'MEDIUM';
    
    return { score: intensity, label: label, rawScore: signalScore };
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
  
  const signalColor = getSignalColor(parseFloat(String(signalIntensity.score)), signalIntensity.label);

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
                <FileText className="w-3 h-3"/> Intelligence Report • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={handleDownload} className="p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Download PDF">
              <Download className="w-5 h-5" />
            </button>
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
          {/* Step 1: Situation Brief */}
          <WorkflowStep icon={Zap} title="1. Situation Brief" subtitle="The current state of affairs — key actors, timing, and signal intensity.
" isActive={true}>
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
                    {signalIntensity.label} ({signalIntensity.score}/10)
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
          <WorkflowStep icon={Shield} title="2. Source & Bias Check" subtitle="How reliable this information is – and how the narrative may be shaping your reaction." isActive={true}>
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
                    score={(credibility?.manipulationScore ?? 0) as number} 
                    indicators={(credibility?.biasIndicators ?? []) as string[]} 
                  />
                </>
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">Credibility data not available.</div>
              )}
            </div>
          </WorkflowStep>

          {/* Step 3: Big Picture Forces */}
          <WorkflowStep icon={Globe} title="3. Big Picture Forces" subtitle="The political, economic, and social forces quietly influencing this story." isActive={true}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white">PESTLE Force Analysis</h4>
                <div className="flex items-center text-sm font-bold text-red-600 dark:text-red-400">
                  Avg Impact: {(() => {
                    const values = pestle ? Object.values(pestle).map(p => p?.score ?? 0) : [0,0,0,0,0,0];
                    return Math.round(values.reduce((s,n)=>s+n,0)/6);
                  })()} | Critical Threat
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                A visual comparison of factor magnitude (Bar Chart) and a profile of external pressures (Radar Chart).
              </p>

              {pestle ? (
                <div className="bg-white dark:bg-slate-900/70 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 backdrop-blur-lg">
                  <PestleBarAndRadar pestle={pestle} isPremium={isPremium} onSelectFactor={(f) => setSelectedFactor(f)} />
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">PESTLE data not available for this article.</p>
                </div>
              )}
            </div>
          </WorkflowStep>

          {/* Step 4: Hidden Motives */}
          <WorkflowStep icon={Microscope} title="4. Hidden Motives" subtitle="What this narrative is really optimizing for – beyond what it says." isActive={true}>
            <div className="p-6 space-y-8">
              <div className="bg-white dark:bg-slate-900/70 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                  Dominant Narrative Driver
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {hm?.dominantDriver?.type || "Unknown Driver"}
                  <span className="ml-3 text-blue-600 dark:text-blue-400 text-lg">
                    {hm?.dominantDriver?.confidence ?? 0}%
                  </span>
                </h3>
                <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm max-w-2xl">
                  {hm?.dominantDriver?.explanation || "No explanation available for the dominant driver."}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-3">Incentive Stack</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Economic", key: "economic", value: hm?.incentiveStack?.economic ?? 0, color: "bg-blue-600" },
                    { label: "Social Positioning", key: "socialPositioning", value: hm?.incentiveStack?.socialPositioning ?? 0, color: "bg-indigo-500" },
                    { label: "Political Signaling", key: "politicalSignaling", value: hm?.incentiveStack?.politicalSignaling ?? 0, color: "bg-amber-500" },
                    { label: "Ideological Control", key: "ideologicalControl", value: hm?.incentiveStack?.ideologicalControl ?? 0, color: "bg-purple-500" }
                  ].map((m) => (
                    <div key={m.key} className="bg-white dark:bg-slate-900/70 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">{m.label}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{m.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${m.color} transition-all duration-300`} style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/70 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold uppercase text-blue-600 dark:text-blue-300 mb-4">Behavioral Pattern</h4>
                {(() => {
                  const bp = hm?.behavioralPattern;
                  const hasFraming = bp?.framingTechniques?.length > 0;
                  const hasOmissions = bp?.omissions?.length > 0;
                  const hasTriggers = bp?.emotionalTriggers?.length > 0;
                  const hasAnyData = hasFraming || hasOmissions || hasTriggers;

                  if (!hasAnyData) {
                    return <p className="text-sm text-slate-500 dark:text-slate-400 italic">No behavioral patterns detected in this article.</p>;
                  }

                  return (
                    <div className="space-y-4">
                      {hasFraming && (
                        <div>
                          <h5 className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            Framing Techniques
                          </h5>
                          <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside pl-2">
                            {bp.framingTechniques.map((tech, i) => <li key={i}>{tech}</li>)}
                          </ul>
                        </div>
                      )}
                      {hasOmissions && (
                        <div>
                          <h5 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            Critical Omissions
                          </h5>
                          <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside pl-2">
                            {bp.omissions.map((om, i) => <li key={i}>{om}</li>)}
                          </ul>
                        </div>
                      )}
                      {hasTriggers && (
                        <div>
                          <h5 className="text-xs font-semibold text-blue-600 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            Emotional Triggers
                          </h5>
                          <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside pl-2">
                            {bp.emotionalTriggers.map((trig, i) => <li key={i}>{trig}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {hm?.powerAmplification?.actors && (
                <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Power Amplification Map</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                      This map shows which actors have both the incentive and the platform power to amplify this narrative.
                    </p>
                  </div>
                  <PowerAmplificationMap actors={hm.powerAmplification.actors ?? []} />
                </div>
              )}
            </div>
          </WorkflowStep>

          {/* Step 5: Who Really Has Power */}
          <WorkflowStep icon={Target} title="5. Who Really Has Power" subtitle="Who can influence outcomes, who is affected, and who actually matters." isActive={true}>
            <div className="p-6">
              {isPremium ? (
                <>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" /> Power-Interest Strategy Map
                  </h4>
                  {partyImpact ? (
                    <PartyBarChart partyImpactData={partyImpact} />
                  ) : (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                      <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">No stakeholder impact data available.</p>
                    </div>
                  )}
                </>
              ) : (
                <TierLock feature="stakeholder_impact" className="min-h-[300px] bg-slate-50 dark:bg-slate-900/40">
                  <div className="p-8 text-center">
                    <Target className="w-12 h-12 text-purple-300 dark:text-purple-500 mx-auto mb-4" />
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Access Stakeholder Strategy</h3>
                    <p className="text-slate-600 dark:text-slate-300">See power-interest positioning and optimal engagement strategies.</p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                      Upgrade to Premium
                    </button>
                  </div>
                </TierLock>
              )}
            </div>
          </WorkflowStep>

          {/* Step 6: Market Impact */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
  Evidence labels distinguish between explicit mentions and AI-inferred market impact.
</p>
<div className="flex gap-3 mt-3 flex-wrap text-[11px]">
  <span className="flex items-center gap-1">
    🟢 <b>EXPLICIT</b> – mentioned in article
  </span>
  <span className="flex items-center gap-1">
    🔵 <b>AI INFERRED</b> – industry / competition logic
  </span>
  <span className="flex items-center gap-1">
    🟠 <b>STRUCTURAL</b> – low-confidence thematic inference
  </span>
</div>
          <WorkflowStep icon={TrendingUp} title="6. Market Impact" subtitle="Verified stock tickers with evidence-based analysis - no fabrication." isActive={true}>
            <div className="p-6">
              {isPremium ? (
                <>
                  {marketImpact && marketImpact.tickers && (
                    (marketImpact.tickers.direct?.length > 0 || 
                     marketImpact.tickers.indirect?.length > 0 || 
                     marketImpact.tickers.speculative?.length > 0) ||
                    // Backwards compatibility: check for old array format
                    (Array.isArray(marketImpact.tickers) && marketImpact.tickers.length > 0)
                  ) ? (
                    // Check if new format (object with direct/indirect/speculative)
                    marketImpact.tickers.direct !== undefined ? (
                      <MarketImpactSection marketImpact={marketImpact} />
                    ) : (
                      // Fallback to old StockImpactMeter for backwards compatibility
                      <StockImpactMeter data={marketImpact} />
                    )
                  ) : (
                    <div className="p-10 text-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-900/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                      <Activity className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <h5 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No Verified Equities Detected</h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        This article does not explicitly mention publicly traded companies or stock symbols.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <TierLock feature="market_impact" className="min-h-[300px] bg-slate-50 dark:bg-slate-900/40">
                  <div className="p-8 text-center">
                    <TrendingUp className="w-12 h-12 text-blue-300 dark:text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Access Financial Impact Analysis</h3>
                    <p className="text-slate-600 dark:text-slate-300">See verified stock tickers with confidence scores and evidence-based reasoning.</p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                      Upgrade to Premium
                    </button>
                  </div>
                </TierLock>
              )}
            </div>
          </WorkflowStep>

          {/* Step 7: What Happens Next - NEW SECTION WITH 3 MODELS */}
          <WorkflowStep icon={GitBranch} title="7. What Happens Next" subtitle="Likely paths forward based on history, information quality, and feedback effects." isActive={true} isLast={true}>
            <div className="p-6 h-full">
              {isPremium ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[700px]">
                  
                  {/* 1. CHRONOS ISOMORPHISM (The Past: Scenario Modeling) */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-md border border-slate-200 dark:border-slate-800 relative overflow-visible">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-blue-500"></div>
                    <div className="absolute -top-3 left-4">
                      <div className="px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide bg-emerald-600 text-white rounded-b-md shadow-sm">PAST</div>
                    </div>
                    {chronos ? (
                      <ChronosIsomorphism data={chronos} />
                    ) : (
                      <div className="p-4 text-slate-500 dark:text-slate-400 text-center">Chronos data not available.</div>
                    )}
                  </div>

                  {/* 2. THERMODYNAMIC ENTROPY (The Present: Credibility Check) */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-md border border-slate-200 dark:border-slate-800 relative overflow-visible">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-500"></div>
                    <div className="absolute -top-3 left-4">
                      <div className="px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide bg-blue-600 text-white rounded-b-md shadow-sm">PRESENT</div>
                    </div>
                    {entropy ? (
                      <ThermodynamicEntropy data={entropy} />
                    ) : (
                      <div className="p-4 text-slate-500 dark:text-slate-400 text-center">Entropy data not available.</div>
                    )}
                  </div>

                  {/* 3. OUROBOROS RESONANCE (The Future: Causal Chains) */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-md border-2 border-purple-500/20 relative overflow-visible">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-rose-500 to-rose-500"></div>
                    <div className="absolute -top-3 left-4">
                      <div className="px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide bg-rose-600 text-white rounded-b-md shadow-sm">FUTURE</div>
                    </div>
                    {ouroboros ? (
                      <OuroborosResonance data={ouroboros} />
                    ) : (
                      <div className="p-4 text-slate-500 dark:text-slate-400 text-center">Ouroboros data not available.</div>
                    )}
                  </div>

                </div>
              ) : (
                <TierLock feature="predictive_modeling" className="min-h-[300px] bg-slate-50 dark:bg-slate-900/40">
                  <div className="p-8 text-center">
                    <Clock className="w-12 h-12 text-blue-300 dark:text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Unlock Predictive Trajectory</h3>
                    <p className="text-slate-600 dark:text-slate-300">See the combined historical context, causal chain, and credibility check for a complete future outlook.</p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                      Upgrade to Premium
                    </button>
                  </div>
                </TierLock>
              )}
            </div>
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

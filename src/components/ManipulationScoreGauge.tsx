import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Scale, 
  BrainCircuit, 
  MessageSquare, 
  FileText, 
  Users, 
  Activity, 
  AlertCircle,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { TierLock } from './TierLock';

// --- Interfaces ---

interface ManipulationScoreGaugeProps {
  credibilityData?: {
    manipulationScore: number; // 0-100 (Higher = More manipulation)
    credibilityScore: number; // 0-100 (Higher = More credible)
    biasIndicators: string[]; 
    factors: Array<{ 
      name: string; 
      score: number; // 0-100
    }>;
  };
  className?: string;
}

interface BiasDimension {
  subject: string;
  A: number; // The score for this dimension
  fullMark: number;
}

interface AnalystReport {
  objectivityScore: number; // 0-100 (Higher is better)
  biasLevel: 'Neutral' | 'Leaning' | 'Strongly Biased' | 'Propagandistic';
  editorialTone: string;
  radarData: BiasDimension[];
  linguisticTriggers: string[];
  verdict: string;
}

// --- Analytic Helper Functions ---

const calculateObjectivity = (manipulationScore: number) => 100 - manipulationScore;

const getBiasLevel = (score: number): AnalystReport['biasLevel'] => {
  if (score >= 85) return 'Neutral';
  if (score >= 65) return 'Leaning';
  if (score >= 40) return 'Strongly Biased';
  return 'Propagandistic';
};

const getBiasColor = (level: AnalystReport['biasLevel']) => {
  switch (level) {
    case 'Neutral': return '#059669'; // Emerald 600
    case 'Leaning': return '#2563EB'; // Blue 600
    case 'Strongly Biased': return '#D97706'; // Amber 600
    case 'Propagandistic': return '#DC2626'; // Red 600
  }
};

const categorizeFactorsToDimensions = (factors: { name: string; score: number }[]): BiasDimension[] => {
  const getScore = (keyword: string) => {
    const found = factors.find(f => f.name.toLowerCase().includes(keyword));
    return found ? found.score : 0;
  };

  const baseRisk = factors.reduce((acc, curr) => acc + curr.score, 0) / (factors.length || 1);

  return [
    { subject: 'Emotional Loading', A: getScore('emotion') || baseRisk * 1.2, fullMark: 100 },
    { subject: 'Sourcing Bias', A: getScore('source') || baseRisk * 0.9, fullMark: 100 },
    { subject: 'Rhetorical Intensity', A: getScore('bias') || baseRisk * 1.1, fullMark: 100 },
    { subject: 'Political Coding', A: getScore('politic') || baseRisk, fullMark: 100 },
    { subject: 'Contextual Omission', A: getScore('fact') || baseRisk * 0.8, fullMark: 100 },
  ];
};

const generateAnalystVerdict = (score: number, indicators: string[]) => {
  if (score >= 80) return "The editorial voice maintains high neutrality. Arguments are structured around data with minimal emotive language.";
  if (score >= 60) return "Detectable editorial framing. While factual, the selection of evidence suggests a specific narrative angle.";
  if (score >= 40) return "Significant subjective layering. The author actively directs the reader's conclusion through loaded language and selective sourcing.";
  return "Compromised objectivity. The text functions primarily as advocacy or persuasion rather than informational reporting.";
};

export default function ManipulationScoreGauge({ 
  credibilityData, 
  className = '' 
}: ManipulationScoreGaugeProps) {
  const [report, setReport] = useState<AnalystReport | null>(null);

  useEffect(() => {
    if (credibilityData) {
      const objScore = calculateObjectivity(credibilityData.manipulationScore);
      const biasLevel = getBiasLevel(objScore);
      const radarData = categorizeFactorsToDimensions(credibilityData.factors);
      
      setReport({
        objectivityScore: objScore,
        biasLevel,
        editorialTone: biasLevel === 'Neutral' ? 'Objective / Analytical' : 'Subjective / Persuasive',
        radarData,
        linguisticTriggers: credibilityData.biasIndicators || [],
        verdict: generateAnalystVerdict(objScore, credibilityData.biasIndicators)
      });
    }
  }, [credibilityData]);

  if (!report) return null;

  const biasColor = getBiasColor(report.biasLevel);

  const pieData = [
    { name: 'Objectivity', value: report.objectivityScore, color: biasColor },
    { name: 'Bias', value: 100 - report.objectivityScore, color: '#F3F4F6' },
  ];

  return (
    <TierLock feature="manipulation_score" className={className}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden font-sans">
        
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm text-slate-700 dark:text-slate-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Editorial Objectivity Analysis</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Automated Linguistic & Rhetorical Review</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm">
            <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: biasColor }} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{report.biasLevel} Classification</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          <div className="lg:col-span-4 p-6 border-r border-slate-100 dark:border-slate-700 flex flex-col justify-between">
            
            <div className="relative mb-6">
              <div style={{ height: '192px', width: '100%' }} className="relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                  <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">{report.objectivityScore}<span className="text-lg text-slate-400 dark:text-slate-500">/100</span></span>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Objectivity Index</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Rhetorical Load
                </span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  {report.radarData.find(x => x.subject === 'Rhetorical Intensity')?.A.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-400 dark:bg-slate-500" 
                  style={{ width: `${report.radarData.find(x => x.subject === 'Rhetorical Intensity')?.A}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-sm mt-4">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Emotional Resonance
                </span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  {report.radarData.find(x => x.subject === 'Emotional Loading')?.A.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-400 dark:bg-slate-500" 
                  style={{ width: `${report.radarData.find(x => x.subject === 'Emotional Loading')?.A}%` }}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 bg-slate-50/50 dark:bg-slate-800/30">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              Bias Dimension Topology
            </h4>
            
            <div style={{ height: '256px', width: '100%' }} className="relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={report.radarData}>
                  <PolarGrid gridType="polygon" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} className="dark:fill-slate-400" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Bias Profile"
                    dataKey="A"
                    stroke={biasColor}
                    fill={biasColor}
                    fillOpacity={0.2}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: biasColor, fontWeight: 'bold' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="absolute top-0 right-0 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded text-[10px] text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm max-w-[120px]">
                *Graph expands outward based on intensity of detected bias factors.
              </div>
            </div>

            <div className="mt-2 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm relative">
              <div className="absolute top-0 left-4 -translate-y-1/2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                Analyst Verdict
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-2">
                {report.verdict}
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 p-6 border-l border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
             <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Linguistic Fingerprints
            </h4>

            {report.linguisticTriggers.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  The following terms detected in the text indicate specific editorial framing:
                </p>
                {report.linguisticTriggers.slice(0, 5).map((trigger, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 px-3 py-2 rounded border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 text-amber-500 dark:text-amber-400 mt-1 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">"{trigger}"</span>
                  </div>
                ))}
                {report.linguisticTriggers.length > 5 && (
                  <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 pt-2">
                    + {report.linguisticTriggers.length - 5} additional markers
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 dark:text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Clean Pattern</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">No significant bias markers detected.</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
               <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Publisher Intent
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1">
                <BookOpen className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                <span>Primary Goal: <span className="font-semibold text-slate-800 dark:text-slate-200">{report.biasLevel === 'Neutral' ? 'Inform' : 'Persuade'}</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Activity className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                <span>Tone: <span className="font-semibold text-slate-800 dark:text-slate-200">{report.editorialTone}</span></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </TierLock>
  );
}
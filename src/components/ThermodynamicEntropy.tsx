import React, { useState } from 'react';
import { 
  RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  Zap, 
  Thermometer, 
  Eye, 
  EyeOff, 
  FlaskConical, 
  Atom,
  Wind
} from 'lucide-react';

// --- Types ---
interface EntropyProps {
  data?: {
    articleTitle: string;
    wordCount: number;
    factCount: number;
    speculationCount: number;
    signalToNoise: number;
    entropyLevel: number;
    caloricValue: number;
    cognitiveLoad: 'Low' | 'Moderate' | 'High';
    emotionalHeat: 'Low' | 'Moderate' | 'High';
    recommendation: string;
    segments: Array<{
      text: string;
      type: 'fact' | 'speculation';
    }>;
  };
  className?: string;
}

export default function ThermodynamicEntropy({ 
  data,
  className = ''
}: EntropyProps) {
  const [hazeEnabled, setHazeEnabled] = useState(true);

  // ✅ FIXED: Show placeholder when no data available
  if (!data) {
    return (
      <div className={className}>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <FlaskConical className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Thermodynamic Signal-Entropy</h3>
          <p className="text-gray-600 dark:text-gray-400">No signal-entropy analysis available for this article.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            This analysis measures the ratio of factual content to speculation.
          </p>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Validate required data fields
  if (!data.segments || data.segments.length === 0) {
    return (
      <div className={className}>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <FlaskConical className="w-12 h-12 text-amber-500 dark:text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Incomplete Analysis</h3>
          <p className="text-gray-600 dark:text-gray-400">Insufficient data for entropy visualization.</p>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Use real data directly (no fallback operators)
  const articleTitle = data.articleTitle;
  const wordCount = data.wordCount;
  const factCount = data.factCount;
  const speculationCount = data.speculationCount;
  const signalToNoise = data.signalToNoise;
  const entropyLevel = data.entropyLevel;
  const caloricValue = data.caloricValue;
  const cognitiveLoad = data.cognitiveLoad;
  const emotionalHeat = data.emotionalHeat;
  const recommendation = data.recommendation;
  const segments = data.segments;

  const gaugeData = [
    { name: 'Entropy (Noise)', value: entropyLevel, fill: '#f43f5e' }, // Red
    { name: 'Signal (Utility)', value: signalToNoise, fill: '#10b981' }, // Emerald
  ];

  // Convert cognitive load to percentage
  const cognitiveLoadPercent = cognitiveLoad === 'High' ? 75 : cognitiveLoad === 'Moderate' ? 45 : 20;
  const emotionalHeatPercent = emotionalHeat === 'High' ? 75 : emotionalHeat === 'Moderate' ? 45 : 20;

  return (
    <div className={className}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden font-sans">
        
        {/* Header: The Physics Lab */}
        <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 tracking-tight">Thermodynamic Signal-Entropy</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Cognitive hygiene and utility analysis</p>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="flex flex-col items-end">
               <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Actionable Joules</span>
               <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold">
                 <Zap className="w-4 h-4 fill-current" />
                 {caloricValue} AJ
               </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT: The Text "Haze" Visualizer */}
          <div className="lg:col-span-8 p-8 border-r border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-serif text-xl font-bold text-slate-900 dark:text-white">{articleTitle}</h4>
              
              {/* The Haze Toggle Switch */}
              <button 
                onClick={() => setHazeEnabled(!hazeEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  hazeEnabled 
                    ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {hazeEnabled ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {hazeEnabled ? 'Speculation Haze: ON' : 'Show Full Noise'}
              </button>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                {segments.map((sentence, idx) => (
                  <span 
                    key={idx}
                    className={`transition-all duration-500 ${
                      sentence.type === 'speculation' && hazeEnabled
                        ? 'text-transparent bg-slate-200 dark:bg-slate-700 blur-[2px] select-none opacity-50' // The "Haze" Effect
                        : sentence.type === 'speculation'
                        ? 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' // Highlighted noise when off
                        : 'text-slate-800 dark:text-slate-200 bg-emerald-50/50 dark:bg-emerald-900/20' // Valid signal
                    } px-1 rounded mx-0.5`}
                  >
                    {sentence.text}{" "}
                  </span>
                ))}
              </p>
              
              {hazeEnabled && (
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 italic">
                  <Wind className="w-3 h-3" />
                  <span>"Haze" filter is active. {entropyLevel}% of text is non-actionable speculation.</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: The Thermodynamics Gauges */}
          <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center">
            
            <div style={{ height: '192px', width: '100%' }} className="relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="60%" 
                  outerRadius="100%" 
                  barSize={10} 
                  data={gaugeData} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                    isAnimationActive={false}
                    label={{ position: 'insideStart', fill: '#fff' }}
                  />
                  <Legend 
                    iconSize={10} 
                    layout="vertical" 
                    verticalAlign="middle" 
                    wrapperStyle={{top: 0, left: 0}}
                  />
                  <RechartsTooltip />
                </RadialBarChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                <div className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">{signalToNoise}%</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">Signal density</div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="w-full space-y-4 mt-4">
              
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Atom className="w-3 h-3" /> Cognitive Cost
                  </span>
                  <span className="text-xs font-bold text-rose-500 dark:text-rose-400">{cognitiveLoad}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full">
                  <div 
                    className="h-full bg-rose-500 dark:bg-rose-400 rounded-full" 
                    style={{ width: `${cognitiveLoadPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3 h-3" /> Emotional Heat
                  </span>
                  <span className="text-xs font-bold text-amber-500 dark:text-amber-400">{emotionalHeat}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full">
                  <div 
                    className="h-full bg-amber-500 dark:bg-amber-400 rounded-full" 
                    style={{ width: `${emotionalHeatPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded border border-emerald-100 dark:border-emerald-800 text-center">
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">Recommendation</div>
                <div className="text-xs text-emerald-800 dark:text-emerald-300">
                  {recommendation}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

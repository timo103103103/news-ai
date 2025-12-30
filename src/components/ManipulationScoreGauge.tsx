import React, { useMemo } from 'react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Cell, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  Fingerprint, 
  ShieldAlert, 
  Target, 
  Zap, 
  Activity, 
  AlertCircle,
  Eye,
  Search
} from 'lucide-react';

interface ManipulationScoreGaugeProps {
  credibilityData?: {
    manipulationScore: number;
    credibilityScore: number;
    biasIndicators: string[];
    factors: Array<{ name: string; score: number }>;
  };
  className?: string;
}

export const ManipulationScoreGauge: React.FC<ManipulationScoreGaugeProps> = ({ credibilityData, className = "" }) => {
  const data = credibilityData || {
    manipulationScore: 0,
    credibilityScore: 0,
    biasIndicators: [],
    factors: []
  };

  // Dev-only warning for missing data
  if (!credibilityData && import.meta.env.DEV) {
    console.warn("ManipulationScoreGauge: credibilityData missing");
  }

  // Radar Data for Dimensional Analysis
  const radarData = useMemo(() => {
    const dimensions = [
      { subject: 'Linguistic Neutrality', A: 100 - (data.manipulationScore * 0.8), fullMark: 100 },
      { subject: 'Sourcing Depth', A: data.credibilityScore, fullMark: 100 },
      { subject: 'Logic Consistency', A: Math.max(30, 100 - (data.biasIndicators.length * 10)), fullMark: 100 },
      { subject: 'Editorial Distance', A: 100 - data.manipulationScore, fullMark: 100 },
      { subject: 'Attribution Quality', A: data.factors.find(f => f.name.includes('Source'))?.score || 50, fullMark: 100 },
    ];
    return dimensions;
  }, [data]);

  return (
    <div className={`w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-600">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900 dark:text-white">Language & Bias Analysis</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">How wording influences perception</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xl font-black ${data.manipulationScore > 50 ? 'text-red-500' : 'text-emerald-500'}`}>
            {data.manipulationScore}%
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">Distortion Index</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Dimension Radar - Fixed size to avoid ResponsiveContainer height calculation issues */}
        <div className="h-[240px] w-full flex items-center justify-center">
          <RadarChart
            width={300}
            height={240}
            cx={150}
            cy={120}
            outerRadius={90}
            data={radarData}
          >
            <PolarGrid stroke="#94a3b8" strokeOpacity={0.2} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
            <Radar
              name="Article Fingerprint"
              dataKey="A"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.4}
            />
          </RadarChart>
        </div>

        {/* Tactical Indicators */}
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Eye className="w-3 h-3" /> Visual Distortion Markers
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Emotional Framing</span>
                <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${data.manipulationScore}%` }} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Confirmation Bias</span>
                <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, data.biasIndicators.length * 20)}%` }} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Factual Density</span>
                <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${data.credibilityScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Verdict</div>
              <div className={`text-xs font-black uppercase mt-1 ${data.manipulationScore > 40 ? 'text-orange-500' : 'text-emerald-500'}`}>
                {data.manipulationScore > 40 ? 'Tactical Push' : 'Objective Report'}
              </div>
            </div>
            <div className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Signals</div>
              <div className="text-xs font-black text-slate-900 dark:text-white uppercase mt-1">
                {data.biasIndicators.length} Markers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManipulationScoreGauge;
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  History, 
  GitBranch, 
  Repeat, 
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

// --- Types ---
interface ChronosProps {
  data?: {
    currentEvent: string;
    matchedEvent: string;
    similarityScore: number;
    timePattern: string;
    cyclicality: number;
    historicalOutcomes: Array<{
      outcome: string;
      probability: number;
    }>;
    analystNote: string;
  };
  className?: string;
}

// --- Generate Time Series Data ---
const generateTimeData = (pattern: string = 'Correction') => {
  // Create realistic price movement based on pattern type
  return Array.from({ length: 20 }, (_, i) => {
    const base = 100;
    let current = null;
    let historical = 100;

    if (pattern.toLowerCase().includes('bubble')) {
      // Bubble: rapid rise then crash
      historical = i < 12 ? base + i * 5 : base + 60 - (i - 12) * 8;
      current = i < 12 ? base + i * 5 + Math.sin(i) * 3 : null;
    } else if (pattern.toLowerCase().includes('crisis')) {
      // Crisis: sudden drop
      historical = i < 8 ? base - i * 3 : base - 24 + (i - 8) * 2;
      current = i < 12 ? base - i * 3 + Math.sin(i) * 2 : null;
    } else if (pattern.toLowerCase().includes('recovery')) {
      // Recovery: gradual rise
      historical = base + i * 3 + Math.sin(i) * 5;
      current = i < 12 ? base + i * 3 + Math.sin(i) * 3 : null;
    } else {
      // Default: Correction pattern
      historical = 100 + Math.sin(i / 3) * 15 + i * 1.5;
      current = i < 12 ? 100 + Math.sin(i / 3) * 12 + i * 1.8 : null;
    }

    return {
      day: `T+${i}`,
      currentPrice: current,
      historicalPrice: historical,
      divergence: i > 12
    };
  });
};

export default function ChronosIsomorphism({ 
  data,
  className = '' 
}: ChronosProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // ✅ FIXED: Only generate chart data if real data exists
    if (data && data.timePattern) {
      setChartData(generateTimeData(data.timePattern));
    } else {
      setChartData([]);
    }
  }, [data]);

  // ✅ FIXED: Show placeholder when no data available
  if (!data) {
    return (
      <div className={className}>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chronos Isomorphism</h3>
          <p className="text-gray-600">No historical pattern matching data available for this article.</p>
          <p className="text-sm text-gray-500 mt-2">
            This analysis identifies similar historical events and predicts potential outcomes.
          </p>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Use real data directly (no fallback operators)
  const currentEvent = data.currentEvent;
  const matchedEvent = data.matchedEvent;
  const similarityScore = data.similarityScore;
  const cyclicality = data.cyclicality;
  const outcomes = data.historicalOutcomes;
  const analystNote = data.analystNote;

  // ✅ FIXED: Don't render if critical data is missing
  if (!chartData.length || !outcomes || outcomes.length === 0) {
    return (
      <div className={className}>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Incomplete Pattern Data</h3>
          <p className="text-gray-600">Historical pattern analysis is incomplete for this event.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-slate-900 text-slate-100 rounded-xl shadow-2xl overflow-hidden border border-slate-700 font-mono">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-950 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-wider text-amber-50">CHRONOS ISOMORPHISM</h3>
              <p className="text-xs text-slate-400">Temporal Pattern Matching Engine</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Structural Match</div>
            <div className="text-3xl font-bold text-amber-500">{similarityScore}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          
          {/* Main Visualization: The Ghost Chart */}
          <div className="lg:col-span-2 p-6 border-r border-slate-800 relative">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-300">Present: {currentEvent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-amber-500/50 border-b border-dashed border-amber-500"></div>
                  <span className="text-amber-500/70">Ghost: {matchedEvent}</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#475569" tick={{fontSize: 10}} />
                  <YAxis stroke="#475569" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  {/* The Historical "Ghost" Line */}
                  <Line 
                    type="monotone" 
                    dataKey="historicalPrice" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={false}
                    opacity={0.6}
                    name="Historical Precedent"
                  />
                  {/* The Current Reality Line */}
                  <Line 
                    type="monotone" 
                    dataKey="currentPrice" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#3b82f6' }}
                    name="Current Trend"
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Overlay Label for Future */}
              <div className="absolute right-10 top-1/3 text-right">
                <div className="text-xs text-amber-500/60 font-bold uppercase tracking-widest mb-1">Projected Path</div>
                <div className="text-[10px] text-slate-500 max-w-[120px]">
                  Based on {matchedEvent} algorithmic fractal
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Sidebar */}
          <div className="p-6 space-y-6 bg-slate-900/50">
            
            {/* Metric 1: Novelty/Cyclicality */}
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-2 text-slate-300">
                <Repeat className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase">Cyclicality Index</span>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                This event is <span className="text-white font-bold">{cyclicality > 60 ? 'NOT unique' : 'relatively unusual'}</span>. 
                {cyclicality > 60 ? ' It follows a standard economic cycle.' : ' It has some novel characteristics.'}
              </p>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${cyclicality}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Black Swan</span>
                <span>Routine Cycle</span>
              </div>
            </div>

            {/* Metric 2: Outcome Probability */}
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-3 text-slate-300">
                <GitBranch className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold uppercase">Historical Outcomes</span>
              </div>
              
              <div className="space-y-3">
                {outcomes.map((outcome, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">{outcome.outcome}</span>
                      <span className="text-purple-400 font-bold">{outcome.probability}%</span>
                    </div>
                    {idx === outcomes.length - 1 && (
                      <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                        {outcomes.map((o, i) => (
                          <div 
                            key={i}
                            className="h-full bg-purple-500 inline-block" 
                            style={{ width: `${o.probability}%` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Analyst Verdict */}
            <div className="border-t border-slate-700 pt-4">
               <div className="flex items-start gap-2">
                 <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                 <div>
                   <span className="text-xs font-bold text-amber-500 uppercase">Wisdom Injection</span>
                   <p className="text-xs text-slate-400 mt-1 leading-relaxed italic">
                     "{analystNote}"
                   </p>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
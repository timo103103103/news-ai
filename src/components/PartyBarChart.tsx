import { useState, useEffect, useMemo } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceLine, Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShieldAlert, Handshake, Target, Crown, Eye, Shield,
  AlertTriangle, Briefcase, TrendingUp, TrendingDown, Zap, Lightbulb,
  ThumbsUp, ThumbsDown, Minus
} from 'lucide-react';

// ✅ UPDATED DATA INTERFACE - 3 Measurable Parameters
interface PartyBarChartProps {
  partyImpactData?: {
    stakeholders: Array<{
      name: string;
      power: number; // Ability to influence (0-100)
      interest: number; // How much they care (0-100)
      sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed'; // Support vs Opposition
      role: string;
    }>;
    avgPower?: number;
    majorWinners?: string[];
    majorLosers?: string[];
  };
  className?: string;
}

type Quadrant = 'manage_closely' | 'keep_satisfied' | 'keep_informed' | 'monitor';
type Sentiment = 'positive' | 'negative' | 'neutral' | 'mixed';

interface StakeholderStrategy {
  quadrant: Quadrant;
  label: string;
  action: string;
  communication: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface ProcessedStakeholder {
  id: string;
  name: string;
  power: number;
  interest: number;
  sentiment: Sentiment;
  originalPower: number;
  originalInterest: number;
  risk: number;
  role: string;
  color: string;
  sentimentColor: string;
  strategy: StakeholderStrategy;
  isWinner?: boolean;
  isLoser?: boolean;
  avgScore: number;
  dominance: number;
  uniqueColor: string;
  uniqueLightColor: string;
}

type RawSentiment = string | null | undefined;

// ✅ FIX: Normalize sentiment to prevent crashes
const normalizeSentiment = (raw: RawSentiment): Sentiment => {
  const s = String(raw ?? 'neutral').trim().toLowerCase();

  if (['positive', 'supportive', 'pro'].includes(s)) return 'positive';
  if (['negative', 'opposition', 'opposed', 'anti'].includes(s)) return 'negative';
  if (['mixed', 'ambivalent', 'unclear'].includes(s)) return 'mixed';

  return 'neutral';
};

// Sentiment configuration
const SENTIMENT_CONFIG: Record<Sentiment, {
  label: string;
  color: string;
  lightColor: string;
  icon: any;
  description: string;
}> = {
  positive: {
    label: 'Supportive',
    color: '#10B981',
    lightColor: '#D1FAE5',
    icon: ThumbsUp,
    description: 'Pushes for / supports the outcome'
  },
  negative: {
    label: 'Opposition',
    color: '#EF4444',
    lightColor: '#FEE2E2',
    icon: ThumbsDown,
    description: 'Pushes against / opposes the outcome'
  },
  neutral: {
    label: 'Neutral',
    color: '#6B7280',
    lightColor: '#F3F4F6',
    icon: Minus,
    description: 'Neither for nor against'
  },
  mixed: {
    label: 'Mixed',
    color: '#F59E0B',
    lightColor: '#FEF3C7',
    icon: TrendingUp,
    description: 'Variable stance / mixed signals'
  }
};

const ALL_FILTER_COLOR = '#6366F1';

// Quadrant configuration
const QUADRANT_CONFIG: Record<Quadrant, { 
  label: string; 
  shortLabel: string;
  color: string; 
  bg: string;
  icon: any;
  description: string;
}> = {
  manage_closely: { 
    label: 'Key Players', 
    shortLabel: 'Manage Closely',
    color: '#8B5CF6',
    bg: 'bg-purple-50',
    icon: Crown,
    description: 'High power · high interest → Can & will move outcomes. Engage closely.'
  },
  keep_satisfied: { 
    label: 'Context Setters', 
    shortLabel: 'Keep Satisfied',
    color: '#3B82F6',
    bg: 'bg-blue-50',
    icon: Shield,
    description: 'High power · low interest → Can act but may not. Keep satisfied.'
  },
  keep_informed: { 
    label: 'Active Observers', 
    shortLabel: 'Keep Informed',
    color: '#10B981',
    bg: 'bg-emerald-50',
    icon: Eye,
    description: 'Low power · high interest → Care deeply but limited influence. Inform & mobilize.'
  },
  monitor: { 
    label: 'Crowd', 
    shortLabel: 'Monitor',
    color: '#6B7280',
    bg: 'bg-gray-50',
    icon: Users,
    description: 'Low power · low interest → Limited impact. Monitor for changes.'
  },
};

// Calculate median value
const getMedian = (values: number[]): number => {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
};

// Normalize to 0-100 scale for visualization
const normalizeToScale = (value: number, min: number, max: number): number => {
  if (max === min) return 50;
  return ((value - min) / (max - min)) * 100;
};

// Calculate risk based on power + interest + sentiment alignment
const calculateRisk = (power: number, interest: number, sentiment: Sentiment): number => {
  const baseRisk = (power + interest) / 2;
  const powerWeight = power > 70 ? 1.3 : 1.0;
  const interestWeight = interest > 70 ? 1.2 : 1.0;
  
  const sentimentWeight = sentiment === 'negative' ? 1.3 : 
                         sentiment === 'positive' ? 0.9 :
                         sentiment === 'mixed' ? 1.1 : 1.0;
  
  return Math.min(100, baseRisk * powerWeight * interestWeight * sentimentWeight);
};

const getRiskColor = (risk: number): string => {
  if (risk > 75) return '#EF4444';
  if (risk > 50) return '#F59E0B';
  if (risk > 25) return '#3B82F6';
  return '#10B981';
};

// Analyze stakeholder based on MEDIAN thresholds
const analyzeStakeholder = (
  power: number, 
  interest: number,
  medianPower: number,
  medianInterest: number
): StakeholderStrategy => {
  const highPower = power >= medianPower;
  const highInterest = interest >= medianInterest;
  
  let quadrant: Quadrant;
  let action: string;
  let communication: string;
  let priority: 'critical' | 'high' | 'medium' | 'low';
  
  if (highPower && highInterest) {
    quadrant = 'manage_closely';
    action = 'Engage closely with frequent, direct updates';
    communication = 'This actor is critical. They have both the power to influence outcomes and the motivation to act. Engage them directly and frequently. Understand their concerns, address them proactively, and ensure they feel heard.';
    priority = 'critical';
  } else if (highPower && !highInterest) {
    quadrant = 'keep_satisfied';
    action = 'Meet their needs but don\'t over-communicate';
    communication = 'This actor can influence outcomes but may not be actively engaged. Ensure their basic needs are met to prevent opposition, but avoid overwhelming them with information that doesn\'t concern their interests.';
    priority = 'high';
  } else if (!highPower && highInterest) {
    quadrant = 'keep_informed';
    action = 'Inform regularly to mobilize support';
    communication = 'This actor cares deeply but has limited direct influence. Keep them well-informed—they can influence others indirectly, build coalitions, or shift public opinion. Empower them with information.';
    priority = 'medium';
  } else {
    quadrant = 'monitor';
    action = 'Monitor for shifts in power or interest';
    communication = 'This actor currently has limited influence and engagement. Monitor for changes—if their power or interest increases, upgrade your engagement strategy accordingly.';
    priority = 'low';
  }
  
  return {
    quadrant,
    label: QUADRANT_CONFIG[quadrant].label,
    action,
    communication,
    priority
  };
};

// Color generation
const COLOR_PALETTES = {
  vibrant: [
    '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', 
    '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#A855F7'
  ],
  pastel: [
    '#DDD6FE', '#FBCFE8', '#BFDBFE', '#D1FAE5', '#FEF3C7',
    '#FEE2E2', '#E0E7FF', '#CCFBF1', '#FFEDD5', '#F3E8FF'
  ]
};

const getUniqueColor = (index: number): { dark: string; light: string } => {
  const vibrantIndex = index % COLOR_PALETTES.vibrant.length;
  const pastelIndex = index % COLOR_PALETTES.pastel.length;
  return {
    dark: COLOR_PALETTES.vibrant[vibrantIndex],
    light: COLOR_PALETTES.pastel[pastelIndex]
  };
};

export default function PartyBarChart({ partyImpactData, className = '' }: PartyBarChartProps) {
  // ✅ FIXED: No longer need tier variable - TierLock uses feature-based access
  const [selectedStakeholder, setSelectedStakeholder] = useState<ProcessedStakeholder | null>(null);
  const [hoveredStakeholder, setHoveredStakeholder] = useState<string | null>(null);
  const [hoveredQuadrant, setHoveredQuadrant] = useState<Quadrant | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment | 'all'>('all');

  // Process data with MEDIAN normalization
  const processedData = useMemo(() => {
    if (!partyImpactData?.stakeholders || partyImpactData.stakeholders.length === 0) {
      return [];
    }

    const rawStakeholders = partyImpactData.stakeholders;
    const powers = rawStakeholders.map(s => s.power);
    const interests = rawStakeholders.map(s => s.interest);
    const medianPower = getMedian(powers);
    const medianInterest = getMedian(interests);
    const minPower = Math.min(...powers);
    const maxPower = Math.max(...powers);
    const minInterest = Math.min(...interests);
    const maxInterest = Math.max(...interests);

    return rawStakeholders.map((stakeholder, idx) => {
      const normalizedPower = normalizeToScale(stakeholder.power, minPower, maxPower);
      const normalizedInterest = normalizeToScale(stakeholder.interest, minInterest, maxInterest);
      
      // ✅ FIX: normalize + hard fallback
      const sentiment = normalizeSentiment(stakeholder.sentiment);
      const sentimentConfig = SENTIMENT_CONFIG[sentiment] ?? SENTIMENT_CONFIG.neutral;
      
      const strategy = analyzeStakeholder(normalizedPower, normalizedInterest, 50, 50);
      const risk = calculateRisk(normalizedPower, normalizedInterest, sentiment);
      const avgScore = (normalizedPower + normalizedInterest) / 2;
      const dominance = avgScore;
      const colors = getUniqueColor(idx);

      return {
        id: `${stakeholder.name}-${idx}`,
        name: stakeholder.name,
        power: normalizedPower,
        interest: normalizedInterest,
        sentiment,
        sentimentColor: sentimentConfig.color,
        originalPower: stakeholder.power,
        originalInterest: stakeholder.interest,
        risk,
        role: stakeholder.role,
        color: colors.dark,
        strategy,
        isWinner: partyImpactData.majorWinners?.includes(stakeholder.name),
        isLoser: partyImpactData.majorLosers?.includes(stakeholder.name),
        avgScore,
        dominance,
        uniqueColor: colors.dark,
        uniqueLightColor: colors.light,
      };
    });
  }, [partyImpactData]);

  const categorized = useMemo(() => {
    const result: Record<Quadrant, ProcessedStakeholder[]> = {
      manage_closely: [],
      keep_satisfied: [],
      keep_informed: [],
      monitor: []
    };
    processedData.forEach((stakeholder) => {
      result[stakeholder.strategy.quadrant].push(stakeholder);
    });
    return result;
  }, [processedData]);

  const sentimentCounts = useMemo(() => {
    const counts: Record<Sentiment, number> = {
      positive: 0,
      negative: 0,
      neutral: 0,
      mixed: 0
    };
    processedData.forEach((s) => {
      counts[s.sentiment]++;
    });
    return counts;
  }, [processedData]);

  const filteredData = useMemo(() => {
    if (sentimentFilter === 'all') return processedData;
    return processedData.filter(s => s.sentiment === sentimentFilter);
  }, [processedData, sentimentFilter]);

  useEffect(() => {
    if (processedData.length > 0 && !selectedStakeholder) {
      setSelectedStakeholder(processedData[0]);
    }
  }, [processedData, selectedStakeholder]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const data = payload[0].payload as ProcessedStakeholder;
    const sentimentConfig = SENTIMENT_CONFIG[data.sentiment] ?? SENTIMENT_CONFIG.neutral;
    const Icon = sentimentConfig.icon;

    return (
      <div 
        className="bg-white dark:bg-slate-900 border-2 rounded-lg shadow-2xl p-4 max-w-xs"
        style={{ borderColor: data.uniqueColor }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.uniqueColor }} />
          <h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{data.name}</h4>
        </div>
        <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">{data.role}</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-slate-400">Power:</span>
            <span className="font-semibold text-gray-900 dark:text-slate-100">{data.power.toFixed(0)}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-slate-400">Interest:</span>
            <span className="font-semibold text-gray-900 dark:text-slate-100">{data.interest.toFixed(0)}/100</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-slate-400">Sentiment:</span>
            <div className="flex items-center gap-1">
              <Icon className="w-3 h-3" style={{ color: data.sentimentColor }} />
              <span className="font-semibold" style={{ color: data.sentimentColor }}>
                {sentimentConfig.label}
              </span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-slate-400">Risk:</span>
            <span className="font-semibold" style={{ color: getRiskColor(data.risk) }}>
              {data.risk.toFixed(0)}/100
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
          <p className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wide mb-1">Strategic Quadrant</p>
          <p className="text-xs font-bold" style={{ color: data.color }}>{data.strategy.label}</p>
        </div>
      </div>
    );
  };

  if (!partyImpactData || processedData.length === 0) {
    return (
      <div className={`bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-slate-800 p-12 text-center ${className}`}>
        <ShieldAlert className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-slate-400">No stakeholder data available</p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden ${className}`}>
        <div className="p-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Faction Friction</h3>
              <p className="text-sm text-blue-100 mt-0.5">Who has the power · who cares · who's pushing for what</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Filter by Sentiment:</span>
            <button
              onClick={() => setSentimentFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                sentimentFilter === 'all' ? 'bg-gray-800 text-white shadow-md' : 'bg-white dark:bg-slate-900/60 text-gray-600 dark:text-slate-300 border border-gray-300 dark:border-slate-700'
              }`}
              style={{
                backgroundColor: sentimentFilter === 'all' ? ALL_FILTER_COLOR : undefined,
                color: sentimentFilter === 'all' ? 'white' : ALL_FILTER_COLOR
              }}
            >
              All ({processedData.length})
            </button>
            {(Object.keys(SENTIMENT_CONFIG) as Sentiment[]).map((sentiment) => {
              const config = SENTIMENT_CONFIG[sentiment];
              const count = sentimentCounts[sentiment];
              const Icon = config.icon;
              return (
                <button
                  key={sentiment}
                  onClick={() => setSentimentFilter(sentiment)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    sentimentFilter === sentiment ? 'shadow-md text-white' : 'bg-white dark:bg-slate-900/60 border border-gray-300 dark:border-slate-700'
                  }`}
                  style={{
                    backgroundColor: sentimentFilter === sentiment ? config.color : undefined,
                    color: sentimentFilter === sentiment ? 'white' : config.color
                  }}
                >
                  <Icon className="w-3 h-3" />
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-4">Strategic Quadrants (Median-Based)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(categorized) as Quadrant[]).map((quadrant) => {
              const config = QUADRANT_CONFIG[quadrant];
              const count = categorized[quadrant].length;
              const Icon = config.icon;
              return (
                <motion.div
                  key={quadrant}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onMouseEnter={() => setHoveredQuadrant(quadrant)}
                  onMouseLeave={() => setHoveredQuadrant(null)}
                  className={`${config.bg} dark:bg-slate-900/60 border-2 ${hoveredQuadrant === quadrant ? 'border-gray-400 dark:border-slate-600' : 'border-transparent'} p-4 rounded-lg transition-all cursor-pointer`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                      <Icon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-slate-200">{config.label}</h3>
                      <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                        {count} stakeholder{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">{config.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row min-h-[600px]">
          <div className="lg:w-2/3 p-5 border-r border-gray-100 dark:border-slate-800">
            <div className="flex items-start">
              <div className="flex-1 min-h-[520px]" style={{ height: '520px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#334155" />
                    <ReferenceLine x={50} stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" />
                    <ReferenceLine y={50} stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" />
                    <XAxis 
                      type="number" 
                      dataKey="interest" 
                      name="Interest Intensity" 
                      domain={[0, 100]} 
                      label={{ value: 'Interest Intensity (How much they care) →', position: 'insideBottomRight', offset: -5, style: { fontSize: 11, fontWeight: 600, fill: '#4B5563' }}} 
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="power" 
                      name="Power Level" 
                      domain={[0, 100]} 
                      label={{ value: '↑ Power Level (Ability to influence)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fontWeight: 600, fill: '#4B5563' }}} 
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter 
                      data={filteredData} 
                      fill="#8B5CF6"
                      onClick={(data) => setSelectedStakeholder(data)}
                      onMouseEnter={(data) => setHoveredStakeholder(data.name)}
                      onMouseLeave={() => setHoveredStakeholder(null)}
                    >
                      {filteredData.map((entry, index) => {
                        const isHovered = hoveredStakeholder === entry.name;
                        const baseRadius = 8 + (entry.dominance / 100) * 22;
                        const quadrantHovered = !!hoveredQuadrant && entry.strategy.quadrant === hoveredQuadrant;
                        const bubbleRadius = baseRadius * (isHovered ? 3 : quadrantHovered ? 1.6 : 1);
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.uniqueLightColor}
                            stroke={entry.uniqueColor}
                            strokeWidth={isHovered ? 4 : quadrantHovered ? 3 : 2}
                            opacity={hoveredQuadrant ? (entry.strategy.quadrant === hoveredQuadrant ? 1 : 0.3) : (isHovered ? 1 : 0.85)}
                            r={bubbleRadius}
                            style={{ 
                              cursor: 'pointer',
                              filter: isHovered ? `drop-shadow(0 0 20px ${entry.uniqueColor}) drop-shadow(0 0 40px ${entry.uniqueColor})` : quadrantHovered ? `drop-shadow(0 0 12px ${entry.uniqueColor})` : 'none',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        );
                      })}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 p-5 max-h-[600px] overflow-y-auto">
            <AnimatePresence mode="wait">
              {selectedStakeholder ? (
                <motion.div key="detail-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">
                  <div
                    className="mb-4 p-4 rounded-lg border-2 shadow-sm"
                    style={{
                      backgroundColor: (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
                        ? 'rgba(51, 65, 85, 0.85)' /* slate-700/85 */
                        : selectedStakeholder.uniqueLightColor,
                      borderColor: selectedStakeholder.uniqueColor
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-slate-100">{selectedStakeholder.name}</h4>
                      <button onClick={() => setSelectedStakeholder(null)} className="text-gray-400 dark:text-slate-300 hover:text-gray-600 dark:hover:text-slate-200 transition-colors text-sm font-medium">Close</button>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300">{selectedStakeholder.role}</p>
                    <div className="flex items-center gap-2 mt-3">
                      {selectedStakeholder.isWinner && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded">MAJOR WINNER</span>
                      )}
                      {selectedStakeholder.isLoser && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold rounded">MAJOR LOSER</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900/60 rounded-lg p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h4 className="font-semibold text-gray-900 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-600" />
                        Power Metrics
                      </h4>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-slate-400">Power Level</span>
                          <span className="font-bold text-purple-600">{selectedStakeholder.power.toFixed(0)}/100</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600 transition-all duration-700" style={{ width: `${selectedStakeholder.power}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Ability to influence outcomes</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/60 rounded-lg p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-slate-400">Interest Intensity</span>
                          <span className="font-bold text-emerald-600">{selectedStakeholder.interest.toFixed(0)}/100</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full transition-all duration-700" style={{ width: `${selectedStakeholder.interest}%`, backgroundColor: '#10b981' }} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">How much they care / are affected</p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-slate-400">Sentiment Position</span>
                          <div className="flex items-center gap-1">
                            {(() => {
                              const sentimentKey = selectedStakeholder.sentiment ?? 'neutral';
                              const sentimentConfig = SENTIMENT_CONFIG[sentimentKey] ?? SENTIMENT_CONFIG.neutral;
                              const Icon = sentimentConfig.icon;
                              return <Icon className="w-3 h-3" style={{ color: selectedStakeholder.sentimentColor }} />;
                            })()}
                            <span className="font-bold px-2 py-0.5 rounded text-xs" style={{ backgroundColor: (SENTIMENT_CONFIG[selectedStakeholder.sentiment] ?? SENTIMENT_CONFIG.neutral).lightColor, color: selectedStakeholder.sentimentColor }}>
                              {(SENTIMENT_CONFIG[selectedStakeholder.sentiment] ?? SENTIMENT_CONFIG.neutral).label}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full transition-all duration-700" style={{ width: '100%', backgroundColor: selectedStakeholder.sentimentColor }} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          {(SENTIMENT_CONFIG[selectedStakeholder.sentiment] ?? SENTIMENT_CONFIG.neutral).description}
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-slate-400">Risk Level</span>
                          <span className="font-bold px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: getRiskColor(selectedStakeholder.risk) }}>
                            {selectedStakeholder.risk.toFixed(0)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full transition-all duration-700" style={{ width: `${selectedStakeholder.risk}%`, backgroundColor: getRiskColor(selectedStakeholder.risk) }} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Combined risk based on power, interest & sentiment</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/60 rounded-lg p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h4 className="font-semibold text-gray-900 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        Strategic Recommendation
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-slate-400 font-medium">Quadrant:</span>
                          <span className="ml-2 text-gray-900 dark:text-slate-200 font-bold">{selectedStakeholder.strategy.label}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-slate-400 font-medium">Action:</span>
                          <span className="ml-2 text-gray-900 dark:text-slate-200">{selectedStakeholder.strategy.action}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-slate-400 font-medium">Communication:</span>
                          <p className="mt-1 text-gray-700 dark:text-slate-300 leading-relaxed">{selectedStakeholder.strategy.communication}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="list-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-4">
                    {sentimentFilter === 'all' ? `All Stakeholders (${processedData.length})` : `${SENTIMENT_CONFIG[sentimentFilter].label} Stakeholders (${filteredData.length})`}
                  </h4>
                  <div className="space-y-4">
                    {(Object.keys(categorized) as Quadrant[]).map((quadrant) => {
                      const config = QUADRANT_CONFIG[quadrant];
                      const stakeholders = categorized[quadrant];
                      if (stakeholders.length === 0) return null;
                      const Icon = config.icon;
                      return (
                        <div key={quadrant} className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="w-4 h-4" style={{ color: config.color }} />
                            <h5 className="font-semibold text-gray-900 dark:text-slate-200 text-sm">{config.label} ({stakeholders.length})</h5>
                          </div>
                          <div className="space-y-2">
                            {stakeholders.map((stakeholder) => {
                              const SentIcon = SENTIMENT_CONFIG[stakeholder.sentiment].icon;
                              const isHovered = hoveredStakeholder === stakeholder.name;
                              return (
                                <motion.button
                                  key={stakeholder.id}
                                  whileHover={{ scale: 1.02, x: 4 }}
                                  onClick={() => setSelectedStakeholder(stakeholder)}
                                  onMouseEnter={() => setHoveredStakeholder(stakeholder.name)}
                                  onMouseLeave={() => setHoveredStakeholder(null)}
                                  className={`w-full text-left rounded-lg p-3 transition-all group border-2 ${isHovered ? 'shadow-xl border-gray-900 scale-105' : 'border-transparent shadow-sm hover:shadow-md'}`}
                                  style={{ backgroundColor: stakeholder.uniqueLightColor, borderColor: stakeholder.uniqueColor }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className={`font-semibold text-sm transition-colors ${isHovered ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-white'}`} style={{ color: isHovered ? stakeholder.uniqueColor : undefined }}>{stakeholder.name}</span>
                                        {stakeholder.isWinner && <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold rounded">WIN</span>}
                                        {stakeholder.isLoser && <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold rounded">LOSE</span>}
                                        <SentIcon className="w-3 h-3" style={{ color: stakeholder.sentimentColor }} />
                                      </div>
                                      <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">{stakeholder.role}</p>
                                      <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">Dominance: {stakeholder.dominance.toFixed(0)}/100</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getRiskColor(stakeholder.risk) }} />
                                      <span className="text-xs text-gray-400 dark:text-slate-500">→</span>
                                    </div>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900/60 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm flex-shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Intelligence Recommendation</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Prioritize <strong className="text-purple-700">Key Players</strong> with high power & interest — they will move outcomes.
                Watch <strong className="text-blue-700">Context Setters</strong> — powerful but disengaged (for now).
                Engage <strong className="text-emerald-700">Active Observers</strong> — high interest means mobilization potential.
                Track <strong>sentiment shifts</strong> — opposition increases risk, support creates opportunity.
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}

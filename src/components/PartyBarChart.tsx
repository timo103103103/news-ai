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
import { useSubscription } from '../contexts/SubscriptionContext';
import { TierLock } from './TierLock';

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
  avgScore: number; // Average of power + interest for bubble size
  dominance: number; // How dominant in the news (0-100)
  uniqueColor: string;
  uniqueLightColor: string;
}

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
    color: '#10B981', // Green
    lightColor: '#D1FAE5',
    icon: ThumbsUp,
    description: 'Pushes for / supports the outcome'
  },
  negative: {
    label: 'Opposition',
    color: '#EF4444', // Red
    lightColor: '#FEE2E2',
    icon: ThumbsDown,
    description: 'Pushes against / opposes the outcome'
  },
  neutral: {
    label: 'Neutral',
    color: '#6B7280', // Gray
    lightColor: '#F3F4F6',
    icon: Minus,
    description: 'Neither for nor against'
  },
  mixed: {
    label: 'Mixed',
    color: '#F59E0B', // Amber
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
  
  // Opposition sentiment increases risk
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
  if (power >= medianPower && interest >= medianInterest) {
    return {
      quadrant: 'manage_closely',
      label: 'Key Player',
      action: 'Active Collaboration',
      communication: 'Daily/Weekly updates. Involve in decision making. Monitor sentiment shifts.',
      priority: 'critical'
    };
  } else if (power >= medianPower && interest < medianInterest) {
    return {
      quadrant: 'keep_satisfied',
      label: 'Context Setter',
      action: 'Risk Mitigation',
      communication: 'Keep satisfied. Avoid antagonizing. Can become active if interest rises.',
      priority: 'high'
    };
  } else if (power < medianPower && interest >= medianInterest) {
    return {
      quadrant: 'keep_informed',
      label: 'Active Observer',
      action: 'Engagement & Mobilization',
      communication: 'Regular updates. Leverage as advocates if supportive, address concerns if opposed.',
      priority: 'medium'
    };
  } else {
    return {
      quadrant: 'monitor',
      label: 'Crowd Member',
      action: 'Passive Monitoring',
      communication: 'General updates only. Monitor for interest/power changes.',
      priority: 'low'
    };
  }
};

export default function PartyBarChart({ partyImpactData, className = '' }: PartyBarChartProps) {
  const { canAccess } = useSubscription();
  const [selectedStakeholder, setSelectedStakeholder] = useState<ProcessedStakeholder | null>(null);
  const [hoveredQuadrant, setHoveredQuadrant] = useState<Quadrant | null>(null);
  const [hoveredStakeholder, setHoveredStakeholder] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment | 'all'>('all');

  console.log('🤝 PartyBarChart - Raw API Data:', partyImpactData);

  // Process stakeholder data with MEDIAN-BASED positioning
  const { processedData, medianPower, medianInterest, powerThreshold, interestThreshold, sentimentCounts } = useMemo(() => {
    if (!partyImpactData?.stakeholders || partyImpactData.stakeholders.length === 0) {
      console.warn('⚠️ No stakeholder data from API');
      return { 
        processedData: [], 
        medianPower: 0, 
        medianInterest: 0,
        powerThreshold: 50,
        interestThreshold: 50,
        sentimentCounts: { positive: 0, negative: 0, neutral: 0, mixed: 0 }
      };
    }

    const stakeholders = partyImpactData.stakeholders;
    console.log('✅ Processing', stakeholders.length, 'stakeholders from API');

    // Extract all values
    const allPowers = stakeholders.map(s => s.power || 0);
    const allInterests = stakeholders.map(s => s.interest || 0);

    // Calculate medians
    const medPower = getMedian(allPowers);
    const medInterest = getMedian(allInterests);

    // Get min/max for normalization
    const minPower = Math.min(...allPowers);
    const maxPower = Math.max(...allPowers);
    const minInterest = Math.min(...allInterests);
    const maxInterest = Math.max(...allInterests);

    console.log('📊 Data Analysis:', {
      power: { min: minPower, median: medPower, max: maxPower },
      interest: { min: minInterest, median: medInterest, max: maxInterest }
    });

    // Calculate threshold positions on 0-100 scale
    const powerThresh = normalizeToScale(medPower, minPower, maxPower);
    const interestThresh = normalizeToScale(medInterest, minInterest, maxInterest);

    // Count sentiments
    const sentCounts = {
      positive: stakeholders.filter(s => s.sentiment === 'positive').length,
      negative: stakeholders.filter(s => s.sentiment === 'negative').length,
      neutral: stakeholders.filter(s => s.sentiment === 'neutral').length,
      mixed: stakeholders.filter(s => s.sentiment === 'mixed').length
    };

    const processed = stakeholders.map((stakeholder, index) => {
      const origPower = stakeholder.power || 0;
      const origInterest = stakeholder.interest || 0;
      const sentiment = stakeholder.sentiment || 'neutral';

      // Determine strategy
      const strategy = analyzeStakeholder(origPower, origInterest, medPower, medInterest);
      const risk = calculateRisk(origPower, origInterest, sentiment);
      
      // Dominance uses raw values (0–100) for accurate positioning
      const dominance = (origPower + origInterest) / 2;
      const avgScore = dominance;
      const hue = Math.round((360 / stakeholders.length) * index);
      const uniqueColor = `hsl(${hue}, 70%, 45%)`;
      const uniqueLightColor = `hsl(${hue}, 70%, 88%)`;

      console.log(`  ${stakeholder.name}:`, {
        power: origPower,
        interest: origInterest,
        sentiment,
        dominance: dominance.toFixed(1),
        quadrant: strategy.quadrant
      });
      
        return {
          id: `stakeholder-${index}`,
          name: stakeholder.name,
          power: origPower,
          interest: origInterest,
          sentiment,
          originalPower: origPower,
          originalInterest: origInterest,
          risk,
          role: stakeholder.role || 'Stakeholder',
          color: QUADRANT_CONFIG[strategy.quadrant].color,
          sentimentColor: SENTIMENT_CONFIG[sentiment].color,
          strategy,
          avgScore, // Dominance score for bubble size
          dominance, // How dominant in the news
          uniqueColor,
          uniqueLightColor,
          isWinner: partyImpactData.majorWinners?.includes(stakeholder.name),
          isLoser: partyImpactData.majorLosers?.includes(stakeholder.name),
        };
    });

    console.log('✅ Processed stakeholders:', processed);
    
    return { 
      processedData: processed, 
      medianPower: medPower,
      medianInterest: medInterest,
      powerThreshold: powerThresh,
      interestThreshold: interestThresh,
      sentimentCounts: sentCounts
    };
  }, [partyImpactData]);

  // Filter by sentiment
  const filteredData = useMemo(() => {
    if (sentimentFilter === 'all') return processedData;
    return processedData.filter(s => s.sentiment === sentimentFilter);
  }, [processedData, sentimentFilter]);

  // Group by quadrant
  const categorized = useMemo(() => {
    return {
      manage_closely: filteredData.filter(s => s.strategy.quadrant === 'manage_closely'),
      keep_satisfied: filteredData.filter(s => s.strategy.quadrant === 'keep_satisfied'),
      keep_informed: filteredData.filter(s => s.strategy.quadrant === 'keep_informed'),
      monitor: filteredData.filter(s => s.strategy.quadrant === 'monitor'),
    };
  }, [filteredData]);

  // Custom tooltip with all 3 parameters
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const SentimentIcon = SENTIMENT_CONFIG[data.sentiment].icon;
      
      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4">
          <p className="font-bold text-gray-900 mb-3">{data.name}</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-semibold">Power Level:</span>
              <span className="font-bold text-gray-900">{data.originalPower.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-semibold">Interest Intensity:</span>
              <span className="font-bold text-gray-900">{data.originalInterest.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-gray-600 font-semibold">Sentiment:</span>
              <div className="flex items-center gap-1">
                <SentimentIcon className="w-3 h-3" style={{ color: data.sentimentColor }} />
                <span 
                  className="font-bold px-2 py-0.5 rounded text-xs"
                  style={{ 
                    backgroundColor: SENTIMENT_CONFIG[data.sentiment].lightColor,
                    color: data.sentimentColor
                  }}
                >
                  {SENTIMENT_CONFIG[data.sentiment].label}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-semibold">Risk:</span>
              <span 
                className="font-bold px-2 py-0.5 rounded text-xs text-white"
                style={{ backgroundColor: getRiskColor(data.risk) }}
              >
                {data.risk.toFixed(0)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-gray-600 font-semibold">Strategy:</span>
              <p className="text-gray-900 mt-1">{data.strategy.label}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Show message if no data
  if (!partyImpactData || !partyImpactData.stakeholders || partyImpactData.stakeholders.length === 0) {
    return (
      <TierLock feature="party_barchart" className="min-h-[600px]">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Stakeholder Data Available</h3>
          <p className="text-gray-600">
            The analysis didn't identify any stakeholders for this article.
          </p>
        </div>
      </TierLock>
    );
  }

  return (
    <TierLock feature="party_barchart" className="min-h-[640px]">
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 via-blue-50 to-emerald-50">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                  <Handshake className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Power–Interest Strategy Map</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                3 measurable parameters: <strong>Power Level</strong> (ability to influence), 
                <strong> Interest Intensity</strong> (how much they care), 
                <strong> Sentiment</strong> (support vs opposition).
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                  {processedData.length} Stakeholders
                </div>
                <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  Median Power: {medianPower.toFixed(1)}
                </div>
                <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                  Median Interest: {medianInterest.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Filter Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 uppercase">Filter by Sentiment:</span>
            
            <button
              onClick={() => setSentimentFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                sentimentFilter === 'all'
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
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
                    sentimentFilter === sentiment
                      ? 'shadow-md text-white'
                      : 'bg-white border border-gray-300 hover:border-gray-400'
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

        {/* Quadrant Summary Cards */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Strategic Quadrants (Median-Based)</h4>
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
                  className={`${config.bg} border-2 ${hoveredQuadrant === quadrant ? 'border-gray-400' : 'border-transparent'} p-4 rounded-lg transition-all cursor-pointer`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Icon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{config.label}</h3>
                      <span className="text-xs text-gray-500 font-medium">
                        {count} stakeholder{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{config.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row max-w-full">
          
          {/* LEFT: Scatter Plot Matrix */}
          <div className="lg:w-2/3 p-5 border-r border-gray-100">
            <div className="flex items-start">
              <div className="flex-1" style={{ height: '520px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                
                {/* Reference lines at MEDIAN */}
                <ReferenceLine 
                  x={50} 
                  stroke="#9CA3AF" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                />
                <ReferenceLine 
                  y={50} 
                  stroke="#9CA3AF" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                />
                
                <XAxis 
                  type="number" 
                  dataKey="interest" 
                  name="Interest Intensity" 
                  domain={[0, 100]} 
                  label={{ 
                    value: 'Interest Intensity (How much they care) →', 
                    position: 'insideBottomRight', 
                    offset: -5, 
                    style: { fontSize: 11, fontWeight: 600, fill: '#4B5563' }
                  }} 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="power" 
                  name="Power Level" 
                  domain={[0, 100]} 
                  label={{ 
                    value: '↑ Power Level (Ability to influence)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { fontSize: 11, fontWeight: 600, fill: '#4B5563' }
                  }} 
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
                          filter: isHovered
                            ? `drop-shadow(0 0 20px ${entry.uniqueColor}) drop-shadow(0 0 40px ${entry.uniqueColor})`
                            : quadrantHovered
                              ? `drop-shadow(0 0 12px ${entry.uniqueColor})`
                              : 'none',
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

          {/* RIGHT: Stakeholder List */}
          <div className="lg:w-1/3 bg-gray-50/50 p-4 flex flex-col max-h-[560px] overflow-y-auto">
            <AnimatePresence mode="wait">
              {selectedStakeholder ? (
                <motion.div
                  key={selectedStakeholder.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1"
                >
                  <button
                    onClick={() => setSelectedStakeholder(null)}
                    className="text-sm text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-1"
                  >
                    ← Back to list
                  </button>

                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {selectedStakeholder.name}
                        </h3>
                        <p className="text-sm text-gray-500">{selectedStakeholder.role}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {selectedStakeholder.isWinner && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                            WINNER
                          </span>
                        )}
                        {selectedStakeholder.isLoser && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                            LOSER
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3 Key Metrics */}
                    <div className="space-y-3 mb-6">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Power Level</span>
                          <span className="font-bold text-gray-900">{selectedStakeholder.originalPower.toFixed(1)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700"
                            style={{ width: `${selectedStakeholder.power}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Ability to influence the situation</p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Interest Intensity</span>
                          <span className="font-bold text-gray-900">{selectedStakeholder.originalInterest.toFixed(1)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-700"
                            style={{ width: `${selectedStakeholder.interest}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">How much they care / are affected</p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Sentiment Position</span>
                          <div className="flex items-center gap-1">
                            {(() => {
                              const Icon = SENTIMENT_CONFIG[selectedStakeholder.sentiment].icon;
                              return <Icon className="w-3 h-3" style={{ color: selectedStakeholder.sentimentColor }} />;
                            })()}
                            <span 
                              className="font-bold px-2 py-0.5 rounded text-xs"
                              style={{ 
                                backgroundColor: SENTIMENT_CONFIG[selectedStakeholder.sentiment].lightColor,
                                color: selectedStakeholder.sentimentColor
                              }}
                            >
                              {SENTIMENT_CONFIG[selectedStakeholder.sentiment].label}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-700"
                            style={{ 
                              width: '100%',
                              backgroundColor: selectedStakeholder.sentimentColor
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {SENTIMENT_CONFIG[selectedStakeholder.sentiment].description}
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Risk Level</span>
                          <span 
                            className="font-bold px-2 py-0.5 rounded text-xs text-white"
                            style={{ backgroundColor: getRiskColor(selectedStakeholder.risk) }}
                          >
                            {selectedStakeholder.risk.toFixed(0)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-700"
                            style={{ 
                              width: `${selectedStakeholder.risk}%`,
                              backgroundColor: getRiskColor(selectedStakeholder.risk)
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Combined risk based on power, interest & sentiment</p>
                      </div>
                    </div>

                    {/* Strategy Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        Strategic Recommendation
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 font-medium">Quadrant:</span>
                          <span className="ml-2 text-gray-900 font-bold">{selectedStakeholder.strategy.label}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Action:</span>
                          <span className="ml-2 text-gray-900">{selectedStakeholder.strategy.action}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Communication:</span>
                          <p className="mt-1 text-gray-700 leading-relaxed">{selectedStakeholder.strategy.communication}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1"
                >
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    {sentimentFilter === 'all' 
                      ? `All Stakeholders (${processedData.length})`
                      : `${SENTIMENT_CONFIG[sentimentFilter].label} Stakeholders (${filteredData.length})`
                    }
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
                            <h5 className="font-semibold text-gray-900 text-sm">
                              {config.label} ({stakeholders.length})
                            </h5>
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
                                  className={`w-full text-left rounded-lg p-3 transition-all group border-2 ${
                                    isHovered 
                                      ? 'shadow-xl border-gray-900 scale-105' 
                                      : 'border-transparent shadow-sm hover:shadow-md'
                                  }`}
                                  style={{
                                    backgroundColor: stakeholder.uniqueLightColor,
                                    borderColor: stakeholder.uniqueColor
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span 
                                          className={`font-semibold text-sm transition-colors ${
                                            isHovered ? 'text-gray-900' : 'text-gray-800'
                                          }`}
                                          style={{ 
                                            color: isHovered ? stakeholder.uniqueColor : undefined 
                                          }}
                                        >
                                          {stakeholder.name}
                                        </span>
                                        {stakeholder.isWinner && (
                                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                                            WIN
                                          </span>
                                        )}
                                        {stakeholder.isLoser && (
                                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">
                                            LOSE
                                          </span>
                                        )}
                                        <SentIcon 
                                          className="w-3 h-3" 
                                          style={{ color: stakeholder.sentimentColor }}
                                        />
                                      </div>
                                      <p className="text-xs text-gray-600 mt-0.5">{stakeholder.role}</p>
                                      <p className="text-[10px] text-gray-500 mt-1">
                                        Dominance: {stakeholder.dominance.toFixed(0)}/100
                                      </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: getRiskColor(stakeholder.risk) }}
                                      />
                                      <span className="text-xs text-gray-400">→</span>
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

        {/* Intelligence Recommendation Footer */}
        <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-emerald-50 border-t border-gray-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg text-white shadow-md flex-shrink-0">
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
    </TierLock>
  );
}
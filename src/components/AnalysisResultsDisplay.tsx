import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription, SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell 
} from 'recharts';
import StockImpactMeter from '@/components/StockImpactMeter';
import MotiveHeatmap from '@/components/MotiveHeatmap';
import PartyBarChart from '@/components/PartyBarChart';
import ManipulationScoreGauge from '@/components/ManipulationScoreGauge';
import WinnerLoserTeaser from '@/components/WinnerLoserTeaser';
import { TierLock } from '@/components/TierLock';
import SubscriptionManager from '@/components/SubscriptionManager';
import { 
  Loader2, Download, Share2, RefreshCw, ArrowLeft, 
  CheckCircle2, AlertTriangle, FileText, Sparkles, Crown, Settings,
  TrendingUp, Shield, Users, Target, Zap, DollarSign, Cpu, Leaf, Gavel,
  Info, ArrowUpRight, ShieldAlert, Microscope, ChevronRight, ThumbsUp
} from 'lucide-react';
import DailyIntelligenceSignup from '@/components/DailyIntelligenceSignup';
import CredibilityAssessment from '../components/CredibilityAssessment';

// 🔥 UPDATED: Point to your backend server
const API_BASE_URL = 'https://news-backend-production-ba81.up.railway.app';

// 🎨 PESTLE Factor Configuration
const FACTOR_CONFIG: Record<string, { color: string; icon: any; description: string }> = {
  Political: { 
    color: '#3B82F6', 
    icon: Users,
    description: 'Government policies, regulations, and political stability affecting operations'
  },
  Economic: { 
    color: '#10B981', 
    icon: DollarSign,
    description: 'Economic indicators, market conditions, and financial environment'
  },
  Social: { 
    color: '#F59E0B', 
    icon: TrendingUp,
    description: 'Cultural trends, demographics, and societal attitudes'
  },
  Technological: { 
    color: '#8B5CF6', 
    icon: Cpu,
    description: 'Innovation, automation, and technological disruption'
  },
  Legal: { 
    color: '#EF4444', 
    icon: Gavel,
    description: 'Laws, compliance requirements, and legal frameworks'
  },
  Environmental: { 
    color: '#06B6D4', 
    icon: Leaf,
    description: 'Climate change, sustainability, and environmental regulations'
  },
};

// Strategic insights generator
const generateStrategicInsights = (
  factor: string, 
  score: number, 
  impact: string, 
  factors: string[]
) => {
  const isHighImpact = score > 70 || impact === 'high';
  const isMediumImpact = (score > 40 && score <= 70) || impact === 'medium';
  
  if (isHighImpact) {
    return {
      implications: [
        `Critical ${factor.toLowerCase()} shifts creating urgent pressure`,
        ...factors.slice(0, 2).map(f => `${f} requires immediate attention`)
      ],
      risks: [
        'Regulatory fines or sanctions possible',
        'Loss of market access due to non-compliance',
        'Significant operational disruption likely'
      ],
      opportunities: [
        'First-mover advantage in new frameworks',
        'Strategic positioning before competitors',
        'Lobbying for favorable policy outcomes'
      ]
    };
  } else if (isMediumImpact) {
    return {
      implications: [
        `Moderate ${factor.toLowerCase()} changes affecting planning`,
        ...factors.slice(0, 2).map(f => `${f} should be monitored`)
      ],
      risks: [
        'Gradual market share erosion',
        'Competitive disadvantage if ignored',
        'Medium-term strategic misalignment'
      ],
      opportunities: [
        'Proactive adaptation advantages',
        'Build resilience into operations',
        'Partnerships to navigate changes'
      ]
    };
  }
  
  return {
    implications: [
      `Minor ${factor.toLowerCase()} factors with limited impact`,
      'Background monitoring sufficient'
    ],
    risks: [
      'Low immediate risk',
      'May escalate if neglected long-term'
    ],
    opportunities: [
      'Maintain awareness',
      'Allocate resources elsewhere'
    ]
  };
};

interface AnalysisData {
  rawAnalysis: string | any;
  summary?: {
    title: string;
    executiveSummary: string;
    keyPoints: string[];
    accuracy: number;
    dataPoints: number;
  };
  pestle?: {
    political: { score: number; impact: string; factors: string[] };
    economic: { score: number; impact: string; factors: string[] };
    social: { score: number; impact: string; factors: string[] };
    technological: { score: number; impact: string; factors: string[] };
    legal: { score: number; impact: string; factors: string[] };
    environmental: { score: number; impact: string; factors: string[] };
  };
  motive?: {
    primaryMotive: string;
    motiveScore: number;
    patterns: string[];
    avgIntensity: number;
    analysis?: string;
  };
  partyImpact?: {
    stakeholders: Array<{
      name: string;
      power: number;
      interest: number;
      sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
      role: string;
    }>;
    avgPower: number;
    majorWinners?: string[];
    majorLosers?: string[];
  };
  marketImpact?: {
    overallImpact: string;
    impactScore: number;
    affectedSectors: string[];
    stockSymbols: string[];
    timeframe: string;
    predictions?: {
      shortTerm: number;
      mediumTerm: number;
      longTerm: number;
    };
    confidence?: number;
    volatility?: number;
  };
  credibility?: {
    manipulationScore: number;
    credibilityScore: number;
    biasIndicators: string[];
    factors: Array<{
      name: string;
      score: number;
    }>;
  };
}

const AnalysisResultPage = () => {
  const { tier } = useSubscription();
  const isPremium = tier === 'premium' || tier === 'enterprise';
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const radarRef = useRef<HTMLDivElement | null>(null);
  const [barVisible, setBarVisible] = useState(false);
  const [radarVisible, setRadarVisible] = useState(false);

  useEffect(() => {
    console.log('🔍 AnalysisResultPage: Loading data from sessionStorage...');
    const storedData = sessionStorage.getItem('analysisResult');
    
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        console.log('✅ Data loaded successfully:', parsed);
        console.log('📊 PESTLE data:', parsed.rawAnalysis?.pestle);
        setAnalysisData(parsed.rawAnalysis || parsed);
      } catch (error) {
        console.error('❌ Failed to parse analysis data:', error);
      }
    } else {
      console.warn('⚠️ No data found in sessionStorage with key: analysisResult');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const observe = (ref: React.RefObject<HTMLDivElement>, setVisible: (v: boolean) => void) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisible(true);
              if (ref.current) obs.unobserve(ref.current);
            }
          });
        },
        { threshold: 0.2 }
      );
      obs.observe(ref.current);
      return () => {
        if (ref.current) obs.unobserve(ref.current);
      };
    };

    const cleanupBar = observe(barRef, setBarVisible);
    const cleanupRadar = observe(radarRef, setRadarVisible);
    return () => {
      cleanupBar && cleanupBar();
      cleanupRadar && cleanupRadar();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-600">No analysis data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {analysisData.summary?.title || 'Analysis Report'}
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              {analysisData.summary?.executiveSummary || 'Generating insights...'}
            </p>
            {analysisData.summary?.keyPoints && analysisData.summary.keyPoints.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Key Takeaways
                </h2>
                <p className="text-sm text-gray-600 mb-3">Derived from the executive summary above</p>
                <ul className="space-y-3">
                  {analysisData.summary.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">{idx + 1}</span>
                      </div>
                      <span className="text-gray-700 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>

          {/* Credibility Assessment - NEW DESIGN */}
          {analysisData.credibility && (() => {
            const credibilityScore = analysisData.credibility.credibilityScore;
            const redFlags = analysisData.credibility.biasIndicators || [];
            const hasAuthorScore = analysisData.credibility.factors?.find(f => f?.name?.toLowerCase().includes('author') || f?.name?.toLowerCase().includes('source'))?.score ?? 0;
            const hasCitationsScore = analysisData.credibility.factors?.find(f => f?.name?.toLowerCase().includes('citation') || f?.name?.toLowerCase().includes('evidence') || f?.name?.toLowerCase().includes('reference'))?.score ?? 0;
            const sourceInfo = {
              hasAuthor: hasAuthorScore >= 60,
              hasCitations: hasCitationsScore >= 60,
              isReputable: credibilityScore >= 70,
            };

            return (
              <>
                <CredibilityAssessment credibilityScore={credibilityScore} redFlags={redFlags} sourceInfo={sourceInfo} />
              </>
            );
          })()}

          {/* PESTLE Quick Overview - 4 Summary Cards */}
          {analysisData.pestle && (() => {
            const pestleScores = Object.entries(FACTOR_CONFIG).map(([factor, config]) => {
              const factorKey = factor.toLowerCase() as keyof typeof analysisData.pestle;
              const factorData = analysisData.pestle![factorKey];
              return {
                factor,
                score: factorData?.score || 0,
                impact: factorData?.impact || 'low',
                factors: factorData?.factors || [],
                color: config.color
              };
            }).sort((a, b) => b.score - a.score);

            const primaryFactor = pestleScores[0];
            const secondaryFactor = pestleScores[1];
            const avgScore = Math.round(pestleScores.reduce((sum, f) => sum + f.score, 0) / 6);

            const getImpactText = (impact: string, score: number) => {
              if (score >= 70 || impact === 'high') return 'High Impact';
              if (score >= 40 || impact === 'medium') return 'Medium Impact';
              return 'Low Impact';
            };

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  PESTLE Quick Overview
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: What's Happening */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900">What's Happening</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      This news primarily involves <span className="font-semibold" style={{ color: primaryFactor.color }}>
                        {primaryFactor.factor}
                      </span> factors ({primaryFactor.score}/100), indicating {getImpactText(primaryFactor.impact, primaryFactor.score).toLowerCase()} to the relevant sectors.
                    </p>
                  </div>

                  {/* Card 2: Impact Assessment */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900">Impact Assessment</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold" style={{ color: primaryFactor.color }}>
                        {primaryFactor.factor}
                      </span> aspects show {getImpactText(primaryFactor.impact, primaryFactor.score).toLowerCase()}, with <span className="font-semibold" style={{ color: secondaryFactor.color }}>
                        {secondaryFactor.factor}
                      </span> ({secondaryFactor.score}/100) as secondary concern.
                    </p>
                  </div>

                  {/* Card 3: Key Factors */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900">Key Factors</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Primary evidence includes: {primaryFactor.factors.slice(0, 2).join(', ')}.
                    </p>
                  </div>

                  {/* Card 4: Overall Conclusion */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900">Overall Conclusion</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Average environmental impact: {avgScore}/100. {primaryFactor.factor} impact is {getImpactText(primaryFactor.impact, primaryFactor.score).toLowerCase()}, requiring strategic attention.
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          

          {/* PESTLE INTEGRATED COMPONENT */}
          {analysisData.pestle && (() => {
            const isPremium = tier === 'premium' || tier === 'enterprise';
            
            // Prepare radar data
            const radarData = Object.entries(FACTOR_CONFIG).map(([factor, config]) => {
              const factorKey = factor.toLowerCase() as keyof typeof analysisData.pestle;
              const factorData = analysisData.pestle![factorKey];
              const realScore = factorData?.score || 0;
              const displayScore = isPremium ? realScore : Math.round(realScore * 0.65);
              
              const IconComponent = config.icon;
              
              return {
                factor,
                value: displayScore,
                fullValue: realScore,
                impact: factorData?.impact || 'low',
                color: config.color,
                description: config.description,
                icon: <IconComponent className="w-5 h-5" />,
                factors: factorData?.factors || [],
                analysis: generateStrategicInsights(factor, realScore, factorData?.impact || 'low', factorData?.factors || [])
              };
            });

            const avgVolatility = Math.round(radarData.reduce((sum, f) => sum + f.fullValue, 0) / 6);
            const criticalThreat = radarData.reduce((max, f) => f.fullValue > max.fullValue ? f : max);

            const getImpactBadge = (factor: typeof radarData[0]) => {
              if (factor.fullValue > 70 || factor.impact === 'high') {
                return (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full animate-pulse shadow-md ring-2 ring-red-300">
                    HIGH
                  </span>
                );
              } else if (factor.fullValue > 40 || factor.impact === 'medium') {
                return (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full animate-pulse shadow ring-2 ring-yellow-300">
                    MEDIUM
                  </span>
                );
              }
              return (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full animate-pulse ring-2 ring-green-300">
                  LOW
                </span>
              );
            };

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      🎯 PESTLE Environmental Scan
                      {!isPremium && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          Preview Mode
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Macro-environmental factors influencing strategic position
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{avgVolatility}</div>
                      <div className="text-xs text-gray-600">Avg Impact</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">{criticalThreat.factor}</div>
                      <div className="text-xs text-gray-600">Critical Threat</div>
                    </div>
                  </div>
                </div>

                {/* Main Layout: Bar Chart (Left) + Radar Chart (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  
                  {/* LEFT: Bar Chart with Reasons */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        Impact Scores by Factor
                      </h4>
                    </div>

                    {/* Bar Chart */}
                    <div ref={barRef} className="h-56 bg-gray-50 rounded-lg p-3 flex items-center justify-center" style={{ width: '100%' }}>
                      <ResponsiveContainer width="95%" height="95%">
                        <BarChart data={radarData} layout="vertical" margin={{ top: 4, right: 8, left: 60, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <YAxis 
                            type="category" 
                            dataKey="factor" 
                            tick={{ fontSize: 11, fill: '#4B5563' }}
                            width={75}
                          />
                          <RechartsTooltip 
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                            formatter={(value: number) => [`${value}/100`, 'Impact Score']}
                          />
                          <Bar 
                            dataKey="value" 
                            radius={[0, 4, 4, 0]}
                            onClick={(data: any) => setSelectedFactor((data?.factor ?? data?.payload?.factor) || null)}
                            cursor="pointer"
                            isAnimationActive={barVisible}
                            animationBegin={0}
                            animationDuration={350}
                            animationEasing="ease-out"
                          >
                            {radarData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                opacity={selectedFactor === entry.factor ? 1 : 0.8}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Strategic Reasons */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">WHY THIS MATTERS</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {radarData
                          .slice()
                          .sort((a, b) => b.fullValue - a.fullValue)
                          .slice(0, 3)
                          .map((factor) => (
                          <div
                            key={factor.factor}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => setSelectedFactor(factor.factor)}
                          >
                            <div style={{ color: factor.color }}>
                              {factor.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">{factor.factor}</span>
                                {getImpactBadge(factor)}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{factor.description}</p>
                              <p className="text-[11px] text-gray-500 mt-1">Related: {factor.factors.slice(0, 2).join(', ')}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                      
                    </div>
                  </div>

                  {/* RIGHT: Radar Chart */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Microscope className="w-4 h-4 text-purple-600" />
                        Holistic View
                      </h4>
                    </div>

                    {/* Radar Chart */}
                    <div ref={radarRef} className="h-56 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 flex items-center justify-center" style={{ width: '100%' }}>
                      <ResponsiveContainer width="95%" height="95%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#cbd5e1" strokeWidth={1} />
                          <PolarAngleAxis 
                            dataKey="factor" 
                            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                          />
                          <PolarRadiusAxis 
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            tickCount={5}
                          />
                          <Radar
                            name="Impact Score"
                            dataKey="value"
                            stroke="#3B82F6"
                            fill="#3B82F6"
                            fillOpacity={0.5}
                            strokeWidth={2}
                            isAnimationActive={radarVisible}
                            animationBegin={0}
                            animationDuration={400}
                            animationEasing="ease-out"
                          />
                          <RechartsTooltip 
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                            formatter={(value: number) => [`${value}/100`, 'Impact']}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Key Insights */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Key Insights
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {radarData.filter(f => f.fullValue > 70).length}
                          </div>
                          <div className="text-xs text-gray-600">High Impact</div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="text-lg font-bold text-yellow-600">
                            {radarData.filter(f => f.fullValue > 40 && f.fullValue <= 70).length}
                          </div>
                          <div className="text-xs text-gray-600">Medium Impact</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Factor Details */}
                <AnimatePresence>
                  {selectedFactor && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 pt-6"
                    >
                      {(() => {
                        const factor = radarData.find(f => f.factor === selectedFactor);
                        if (!factor) return null;

                        return (
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-12 h-12 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: `${factor.color}20`, color: factor.color }}
                                >
                                  {factor.icon}
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">{factor.factor} Analysis</h4>
                                  <p className="text-sm text-gray-600">{factor.description}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedFactor(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                ✕
                              </button>
                            </div>

                            {isPremium ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Implications */}
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Info className="w-4 h-4 text-blue-600" />
                                    <h5 className="font-semibold text-gray-900 text-sm">Implications</h5>
                                  </div>
                                  <ul className="space-y-2">
                                    {factor.analysis.implications.map((item, idx) => (
                                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Risks */}
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                    <h5 className="font-semibold text-gray-900 text-sm">Risks</h5>
                                  </div>
                                  <ul className="space-y-2">
                                    {factor.analysis.risks.map((item, idx) => (
                                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                                        <span className="text-red-600 mt-0.5">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Opportunities */}
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center gap-2 mb-3">
                                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                                    <h5 className="font-semibold text-gray-900 text-sm">Opportunities</h5>
                                  </div>
                                  <ul className="space-y-2">
                                    {factor.analysis.opportunities.map((item, idx) => (
                                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                                <div className="flex items-center gap-3 mb-4">
                                  <ShieldAlert className="w-6 h-6 text-blue-600" />
                                  <div>
                                    <h5 className="font-semibold text-gray-900 text-sm">Premium Feature</h5>
                                    <p className="text-xs text-gray-600">Detailed Strategic Analysis</p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 mb-4">
                                  Unlock implications, risks, and opportunities for each PESTLE factor with a premium subscription.
                                </p>
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                                  Upgrade to Premium →
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Premium Upgrade CTA */}
                {!isPremium && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 text-sm mb-1">
                          Upgrade for Full Strategic Insights
                        </h5>
                        <p className="text-xs text-gray-600 mb-3">
                          Get unobfuscated scores, detailed factor analysis, and AI-powered strategic recommendations
                        </p>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                          Upgrade to Premium →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* Detailed PESTLE Factor Explanations */}
          {analysisData.pestle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-blue-600" />
                Detailed PESTLE Analysis
              </h2>
              
              <div className="space-y-6">
                {Object.entries(FACTOR_CONFIG).map(([factor, config]) => {
                  const factorKey = factor.toLowerCase() as keyof typeof analysisData.pestle;
                  const factorData = analysisData.pestle![factorKey];
                  const IconComponent = config.icon;
                  
                  if (!factorData || !factorData.factors || factorData.factors.length === 0) return null;

                  return (
                    <div key={factor} className="border-l-4 pl-6 py-2" style={{ borderColor: config.color }}>
                      <div className="flex items-start gap-4 mb-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${config.color}20`, color: config.color }}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{factor}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold" style={{ color: config.color }}>
                                {factorData.score}
                              </span>
                              <span className="text-sm text-gray-600">/100</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{config.description}</p>
                          
                          {/* Impact Badge */}
                          <div className="inline-flex items-center gap-2 mb-4">
                            <span className="text-sm font-medium text-gray-700">Impact Level:</span>
                            {factorData.score >= 70 || factorData.impact === 'high' ? (
                              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                                HIGH
                              </span>
                            ) : factorData.score >= 40 || factorData.impact === 'medium' ? (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full">
                                MEDIUM
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                LOW
                              </span>
                            )}
                          </div>

                          {/* Key Factors List */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Factors Identified:</h4>
                            <ul className="space-y-2">
                              {factorData.factors.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span style={{ color: config.color }} className="font-bold mt-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ========================================= */}
          {/* PREMIUM FEATURES SECTION */}
          {/* ========================================= */}

          {(() => {
            console.log('🔐 Premium Features Debug:', {
              isPremium,
              tier,
              hasMarketImpact: !!analysisData?.marketImpact,
              hasMotive: !!analysisData?.motive,
              hasPartyImpact: !!analysisData?.partyImpact,
              hasCredibility: !!analysisData?.credibility
            });
            return null;
          })()}

          {/* 1. Market Impact - Always Visible */}
          {/* 2. Motive Analysis - Always Visible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {isPremium ? (
              // Premium: Show full component or placeholder
              analysisData?.motive ? (
                <MotiveHeatmap motiveData={analysisData.motive} />
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Motive Analysis</h3>
                  <p className="text-gray-600">No motive data available for this article.</p>
                </div>
              )
            ) : (
              // Free: Show teaser with lock
              <TierLock feature="motive_analysis" className="min-h-[400px]">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Motive Analysis</h3>
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </TierLock>
            )}
          </motion.div>

          {/* 3. Stakeholder Impact - Always Visible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {isPremium ? (
              // Premium: Show full component or placeholder
              analysisData?.partyImpact ? (
                <PartyBarChart partyImpactData={analysisData.partyImpact} />
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Stakeholder Impact</h3>
                  <p className="text-gray-600">No stakeholder data available for this article.</p>
                </div>
              )
            ) : (
              // Free: Show teaser with lock
              <TierLock feature="stakeholder_impact" className="min-h-[400px]">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stakeholder Impact</h3>
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </TierLock>
            )}
          </motion.div>

          {/* 4. Manipulation Score - Always Visible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {isPremium ? (
              // Premium: Show full component or placeholder
              analysisData?.credibility?.manipulationScore !== undefined ? (
                <ManipulationScoreGauge 
                  credibilityData={analysisData.credibility}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                  <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manipulation Score</h3>
                  <p className="text-gray-600">No manipulation data available for this article.</p>
                </div>
              )
            ) : (
              // Free: Show teaser with lock
              <TierLock feature="manipulation_score" className="min-h-[400px]">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Manipulation Score</h3>
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </TierLock>
            )}
          </motion.div>

          {/* 5. Winner/Loser Network - Special Treatment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <WinnerLoserTeaser />
          </motion.div>

          {/* 6. Market Impact (Stock) - Moved to Bottom - Always Visible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {isPremium ? (
              // Premium: Show full component or placeholder
              analysisData?.marketImpact ? (
                <StockImpactMeter 
                  data={{
                    overallSentiment: (analysisData.marketImpact.overallImpact?.toLowerCase() === 'bullish' ? 'Bullish' : analysisData.marketImpact.overallImpact?.toLowerCase() === 'bearish' ? 'Bearish' : 'Neutral'),
                    institutionalFlow: 'Neutral',
                    analystNote: 'AI-predicted market impact from news event',
                    tickers: (analysisData.marketImpact.stockSymbols || []).map((sym: string) => ({
                      symbol: sym,
                      name: sym,
                      price: 0,
                      change: 0,
                      sentiment: 'Neutral',
                      tier: 'Speculative',
                      confidence: 50,
                      reasoning: 'Mentioned in analysis'
                    }))
                  }}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Impact Analysis</h3>
                  <p className="text-gray-600">No market impact data available for this article.</p>
                </div>
              )
            ) : (
              // Free: Show teaser with lock
              <TierLock feature="market_impact" className="min-h-[400px]">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Impact Analysis</h3>
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </TierLock>
            )}
          </motion.div>

          {/* Upgrade CTA Banner - Free Users Only */}
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-white">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                      <Crown className="w-8 h-8 text-amber-300" />
                      Unlock Premium Intelligence
                    </h2>
                    <p className="text-blue-100 text-lg">
                      Get full access to all analysis tools and insights
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-amber-300" />
                      <h4 className="font-semibold">Market Impact Analysis</h4>
                    </div>
                    <p className="text-sm text-blue-100">See which stocks and sectors are affected by breaking news</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-amber-300" />
                      <h4 className="font-semibold">Motive Detection</h4>
                    </div>
                    <p className="text-sm text-blue-100">Uncover hidden agendas and bias patterns in articles</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-amber-300" />
                      <h4 className="font-semibold">Stakeholder Network</h4>
                    </div>
                    <p className="text-sm text-blue-100">Map relationships between winners and losers</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldAlert className="w-5 h-5 text-amber-300" />
                      <h4 className="font-semibold">Manipulation Score</h4>
                    </div>
                    <p className="text-sm text-blue-100">Detect emotional manipulation and propaganda tactics</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      window.location.href = '/pricing';
                    }}
                    className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl text-lg flex items-center gap-3"
                  >
                    <Crown className="w-5 h-5" />
                    Upgrade to Premium
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                  <div className="text-blue-100">
                    <div className="text-2xl font-bold">$19/month</div>
                    <div className="text-sm">or $190/year (save 17%)</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Daily Intelligence Signup */}
          <DailyIntelligenceSignup />
        </div>
      </div>
    </div>
  );
};

const AnalysisResultPageWrapper = () => (
  <SubscriptionProvider>
    <AnalysisResultPage />
  </SubscriptionProvider>
);

export default AnalysisResultPageWrapper;

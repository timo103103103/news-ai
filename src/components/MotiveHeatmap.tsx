import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, TrendingUp, DollarSign, Target, Shield, Users, 
  AlertTriangle, ArrowRight, Lightbulb, Microscope, Zap
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import TierLock from './TierLock';

// ✅ REAL DATA INTERFACE - Matches backend analyze.js structure
interface MotiveHeatmapProps {
  motiveData?: {
    primaryMotive: string;
    motiveScore: number; // 0-100
    patterns: string[]; // Array of detected motive patterns
    avgIntensity: number; // 0-100
    analysis?: string; // Optional detailed analysis
  };
  className?: string;
}

interface MotiveAnalysis {
  implications: string[];
  behaviors: string[];
  counters: string[];
}

interface MotiveCategory {
  id: string;
  motive: string;
  intensity: number; // 0-100
  category: 'Financial' | 'Ideological' | 'Social' | 'Strategic' | 'Security' | 'Personal';
  description: string;
  impact: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
  color: string;
  analysis: MotiveAnalysis;
}

// --- Configuration ---
const CATEGORY_COLORS: Record<string, string> = {
  Financial: 'bg-emerald-500',
  Ideological: 'bg-purple-500',
  Social: 'bg-cyan-500',
  Strategic: 'bg-blue-600',
  Security: 'bg-red-500',
  Personal: 'bg-amber-500',
};

const CATEGORY_BG: Record<string, string> = {
  Financial: 'bg-emerald-50 text-emerald-800',
  Ideological: 'bg-purple-50 text-purple-800',
  Social: 'bg-cyan-50 text-cyan-800',
  Strategic: 'bg-blue-50 text-blue-800',
  Security: 'bg-red-50 text-red-800',
  Personal: 'bg-amber-50 text-amber-800',
};

// Archetype detailed information
const ARCHETYPE_INFO: Record<string, {
  name: string;
  description: string;
  behavior: string;
  risk: string;
}> = {
  'The Expansionist': {
    name: 'The Expansionist',
    description: 'Driven primarily by strategic goals of influence and power expansion.',
    behavior: 'Systematic, calculated messaging designed to shift public opinion toward specific policy outcomes.',
    risk: 'May obscure true costs or risks in favor of narrative momentum.'
  },
  'The Mercenary': {
    name: 'The Mercenary',
    description: 'Motivated by financial gain and economic interests.',
    behavior: 'Content focused on market opportunities, investments, or profit-driven angles.',
    risk: 'May downplay ethical concerns or long-term societal impacts for short-term gains.'
  },
  'The Evangelist': {
    name: 'The Evangelist',
    description: 'Pushing ideological beliefs and values above all else.',
    behavior: 'Emotionally charged language, appeals to identity, and in-group/out-group dynamics.',
    risk: 'Can create echo chambers and resist contradictory evidence.'
  },
  'The Guardian': {
    name: 'The Guardian',
    description: 'Focused on protection, security, and defending against threats.',
    behavior: 'Uses fear appeals, threat framing, and protective language.',
    risk: 'May amplify dangers beyond realistic proportions to justify actions.'
  },
  'The Influencer': {
    name: 'The Influencer',
    description: 'Seeks social validation, consensus-building, and popularity.',
    behavior: 'Appeals to trends, social proof, and majority opinions.',
    risk: 'May prioritize virality over accuracy or depth.'
  },
  'The Pragmatist': {
    name: 'The Pragmatist',
    description: 'Appears to be driven by a mix of motives with no single clear driver.',
    behavior: 'Opportunistic, adapting messaging to the situation.',
    risk: 'Can be unpredictable and hard to analyze long-term goals.'
  }
};

// Map motive patterns to categories
const categorizeMotivePattern = (pattern: string): 'Financial' | 'Ideological' | 'Social' | 'Strategic' | 'Security' | 'Personal' => {
  const lowerPattern = pattern.toLowerCase();
  if (lowerPattern.includes('profit') || lowerPattern.includes('revenue') || lowerPattern.includes('financial') || lowerPattern.includes('economic')) {
    return 'Financial';
  }
  if (lowerPattern.includes('belief') || lowerPattern.includes('value') || lowerPattern.includes('principle') || lowerPattern.includes('ideolog')) {
    return 'Ideological';
  }
  if (lowerPattern.includes('social') || lowerPattern.includes('community') || lowerPattern.includes('public') || lowerPattern.includes('people')) {
    return 'Social';
  }
  if (lowerPattern.includes('strategy') || lowerPattern.includes('dominance') || lowerPattern.includes('market') || lowerPattern.includes('competitive')) {
    return 'Strategic';
  }
  if (lowerPattern.includes('security') || lowerPattern.includes('safety') || lowerPattern.includes('protect') || lowerPattern.includes('defense')) {
    return 'Security';
  }
  return 'Personal';
};

const getIconForCategory = (category: string): React.ReactNode => {
  switch (category) {
    case 'Financial': return <DollarSign className="w-4 h-4" />;
    case 'Strategic': return <Target className="w-4 h-4" />;
    case 'Security': return <Shield className="w-4 h-4" />;
    case 'Social': return <Users className="w-4 h-4" />;
    case 'Ideological': return <Zap className="w-4 h-4" />;
    default: return <Brain className="w-4 h-4" />;
  }
};

// Generate strategic analysis based on pattern
const generateAnalysis = (pattern: string, category: string, intensity: number): MotiveAnalysis => {
  if (category === 'Financial') {
    return {
      implications: [
        `${pattern} driving financial decision-making`,
        'High sensitivity to cost-benefit analysis'
      ],
      behaviors: [
        'Likely to prioritize ROI over other factors',
        'Resistant to non-monetary incentives'
      ],
      counters: [
        'Frame proposals in terms of net profit impact',
        'Highlight long-term financial risks'
      ]
    };
  }
  
  if (category === 'Ideological' || category === 'Social') {
    return {
      implications: [
        `${pattern} aligned with group identity`,
        'Resistance to factual correction if it contradicts belief'
      ],
      behaviors: [
        'Viral dissemination of aligned content',
        'High emotional engagement with related topics'
      ],
      counters: [
        'Appeal to shared core values',
        'Avoid direct confrontation of beliefs'
      ]
    };
  }
  
  if (category === 'Strategic') {
    return {
      implications: [
        `${pattern} indicates calculated positioning`,
        'Long-term planning evident in actions'
      ],
      behaviors: [
        'Systematic approach to achieving goals',
        'Adapts tactics while maintaining strategy'
      ],
      counters: [
        'Present alternative strategic pathways',
        'Demonstrate alignment with larger goals'
      ]
    };
  }
  
  if (category === 'Security') {
    return {
      implications: [
        `${pattern} revealing defensive posture`,
        'High risk aversion behavior'
      ],
      behaviors: [
        'Resource hoarding tendencies',
        'Preemptive protective measures'
      ],
      counters: [
        'Provide guarantees and safety nets',
        'Demonstrate stability and reliability'
      ]
    };
  }
  
  return {
    implications: [
      `${pattern} showing mixed strategic signals`,
      'Opportunistic behavior pattern'
    ],
    behaviors: [
      'Adapts quickly to new information',
      'Low loyalty to specific approaches'
    ],
    counters: [
      'Focus on immediate wins',
      'Monitor for sudden strategic pivots'
    ]
  };
};

export default function MotiveHeatmap({ 
  motiveData, 
  className = '' 
}: MotiveHeatmapProps) {
  const [processedMotives, setProcessedMotives] = useState<MotiveCategory[]>([]);
  const [selectedMotive, setSelectedMotive] = useState<MotiveCategory | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // ✅ Process real data from backend
    if (motiveData && motiveData.patterns && motiveData.patterns.length > 0) {
      const processed: MotiveCategory[] = motiveData.patterns.map((pattern, idx) => {
        const category = categorizeMotivePattern(pattern);
        // Use real intensity or calculate from score and position
        const intensity = idx === 0 
          ? motiveData.motiveScore 
          : Math.max(30, motiveData.avgIntensity - (idx * 10));
        
        const impact: 'low' | 'medium' | 'high' = 
          intensity > 70 ? 'high' : intensity > 40 ? 'medium' : 'low';
        
        return {
          id: `motive-${idx}`,
          motive: pattern,
          intensity: Math.min(100, intensity),
          category,
          description: `${pattern} detected in content analysis`,
          impact,
          icon: getIconForCategory(category),
          color: CATEGORY_COLORS[category],
          analysis: generateAnalysis(pattern, category, intensity)
        };
      });
      
      // Sort by intensity
      processed.sort((a, b) => b.intensity - a.intensity);
      
      setProcessedMotives(processed);
      setSelectedMotive(processed[0]);
      setIsLoaded(true);
    } else {
      // Fallback if no data provided
      const fallbackData: MotiveCategory[] = [{
        id: 'default',
        motive: 'Information Dissemination',
        intensity: 50,
        category: 'Social',
        description: 'General communication intent',
        impact: 'medium',
        icon: <Users className="w-4 h-4" />,
        color: CATEGORY_COLORS.Social,
        analysis: generateAnalysis('Information Dissemination', 'Social', 50)
      }];
      
      setProcessedMotives(fallbackData);
      setSelectedMotive(fallbackData[0]);
      setIsLoaded(true);
    }
  }, [motiveData]);

  // Calculate dominant archetype based on real data
  const dominantArchetype = useMemo(() => {
    if (!processedMotives.length) return 'Analyzing...';
    const top = processedMotives[0];
    
    switch (top.category) {
      case 'Strategic': return 'The Expansionist';
      case 'Financial': return 'The Mercenary';
      case 'Ideological': return 'The Evangelist';
      case 'Security': return 'The Guardian';
      case 'Social': return 'The Influencer';
      default: return 'The Pragmatist';
    }
  }, [processedMotives]);

  // ✅ Primary motive from real data
  const primaryMotive = motiveData?.primaryMotive || 'Unknown';
  const overallScore = motiveData?.motiveScore || 0;
  const avgIntensity = motiveData?.avgIntensity || 0;

  if (!isLoaded) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[500px] flex flex-col gap-4 ${className}`}>
        <div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse" />
        <div className="flex-1 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <TierLock feature="motive_heatmap" className={className}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full min-h-[600px]">
        
        {/* Header with Real Data */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-gray-50 to-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Psychological Motive Map</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">Deep-dive analysis of underlying drivers and intent</p>
            
            {/* ✅ Show primary motive from real data */}
            <div className="flex items-center gap-3 mt-3">
              <div className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                Primary: {primaryMotive}
              </div>
              <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                Score: {overallScore}/100
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dominant Archetype</span>
            <div className="text-xl font-bold text-gray-800">{dominantArchetype}</div>
            <div className="text-sm text-gray-500 mt-1">Avg Intensity: {avgIntensity}%</div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-col lg:flex-row flex-1">
          
          {/* LEFT: Heatmap Grid */}
          <div className="lg:w-1/2 p-6 border-r border-gray-100">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Detected Motive Patterns ({processedMotives.length})
            </h4>
            
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-2 gap-3 h-[400px]">
              {processedMotives.map((item, idx) => (
                <motion.button
                  key={item.id}
                  layoutId={item.id}
                  onClick={() => setSelectedMotive(item)}
                  className={`relative rounded-xl p-4 text-left transition-all duration-200 group overflow-hidden border-2 ${
                    idx === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
                  } ${
                    selectedMotive?.id === item.id 
                      ? 'border-gray-800 ring-1 ring-gray-800 shadow-lg scale-[1.01] z-10' 
                      : 'border-transparent hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  {/* Background Bar for Intensity */}
                  <div 
                    className={`absolute bottom-0 left-0 h-1.5 transition-all duration-500 ${item.color}`} 
                    style={{ width: `${item.intensity}%` }} 
                  />
                  <div className={`absolute inset-0 opacity-[0.03] ${item.color}`} />

                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-lg text-white shadow-sm ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{item.intensity}%</span>
                    </div>
                    
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block ${CATEGORY_BG[item.category]}`}>
                        {item.category}
                      </span>
                      <h5 className={`font-bold text-gray-800 leading-tight ${idx === 0 ? 'text-xl' : 'text-sm'}`}>
                        {item.motive}
                      </h5>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center flex items-center justify-center gap-1">
              <Lightbulb className="w-3 h-3" /> Click a tile to view deep analysis
            </p>
          </div>

          {/* RIGHT: Deep Analysis Panel */}
          <div className="lg:w-1/2 bg-gray-50/50 p-6 flex flex-col">
            <AnimatePresence mode="wait">
              {selectedMotive ? (
                <motion.div
                  key={selectedMotive.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Selected Analysis</h4>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${selectedMotive.color}`} />
                      <h2 className="text-2xl font-bold text-gray-900">{selectedMotive.motive}</h2>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed border-l-2 border-gray-200 pl-4 italic">
                      "{selectedMotive.description}"
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Intensity:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-700 ${selectedMotive.color}`}
                          style={{ width: `${selectedMotive.intensity}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{selectedMotive.intensity}%</span>
                    </div>
                  </div>

                  {/* Insight Cards */}
                  <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                    
                    {/* Implications */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-blue-700">
                        <Microscope className="w-4 h-4" />
                        <h5 className="font-semibold text-sm">Strategic Implications</h5>
                      </div>
                      <ul className="space-y-2">
                        {selectedMotive.analysis.implications.map((imp, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Predictive Behavior */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-amber-700">
                        <TrendingUp className="w-4 h-4" />
                        <h5 className="font-semibold text-sm">Predicted Behavior Patterns</h5>
                      </div>
                      <ul className="space-y-2">
                        {selectedMotive.analysis.behaviors.map((beh, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" /> {beh}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Strategic Counters */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-emerald-700">
                        <Shield className="w-4 h-4" />
                        <h5 className="font-semibold text-sm">Recommended Counter-Strategies</h5>
                      </div>
                      <ul className="space-y-2">
                        {selectedMotive.analysis.counters.map((cnt, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" /> {cnt}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Brain className="w-12 h-12 mb-3 opacity-20" />
                  <p>Select a motive tile to view analysis</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Archetype Detail Section */}
        <div className="p-6 border-t border-gray-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="max-w-4xl mx-auto">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Dominant Archetype Analysis
            </h4>
            
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{dominantArchetype}</h3>
                  <p className="text-gray-700 mb-4">{ARCHETYPE_INFO[dominantArchetype]?.description || 'Analyzing behavioral patterns...'}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        Typical Behavior
                      </h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {ARCHETYPE_INFO[dominantArchetype]?.behavior || 'Behavior patterns under analysis...'}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Potential Risk
                      </h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {ARCHETYPE_INFO[dominantArchetype]?.risk || 'Risk assessment in progress...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practical Reaction Guide */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Practical Reaction Guide
            </h4>
            <p className="text-sm text-gray-600 mb-6">
              Based on the primary motive of <span className="font-semibold text-gray-900">{primaryMotive}</span>, here are some practical actions:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Action 1 */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">If you want to... Find the core message</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-medium">You can...</span> Try to identify the single action the news wants you to take.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action 2 */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                    <Shield className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">If you want to... Proceed with caution</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-medium">You can...</span> Be skeptical of messages that try to appeal to many different motives at once.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action 3 */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                    <Microscope className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">If you want to... Verify claims</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-medium">You can...</span> Cross-reference with independent sources that don't share the same motive.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action 4 */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">If you want to... Understand bias</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-medium">You can...</span> Ask yourself: "Who benefits if I believe this?" and "What am I being asked to feel?"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TierLock>
  );
}
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Lock, Crown, TrendingUp, Users, AlertTriangle, BarChart3, CheckCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumAnalysisDashboardProps {
  analysisData: {
    party?: any;
    stock?: any;
    manipulation?: any;
  };
  rawText?: string;
}

export default function PremiumAnalysisDashboard({ analysisData, rawText }: PremiumAnalysisDashboardProps) {
  const { tier, canAccess, getUpgradeMessage } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const navigate = useNavigate();

  // Check if user has Pro or Business tier
  const isPremium = tier === 'pro' || tier === 'business';

  const premiumFeatures = [
    {
      id: 'party_barchart',
      title: 'Political Impact Analysis',
      description: 'Analyze political stakeholder influence and party impact on news narratives',
      icon: Users,
      color: 'blue',
      requiredTier: 'pro' as const,
    },
    {
      id: 'stock_impact',
      title: 'Stock Market Impact',
      description: 'Predict potential stock market reactions and sector impacts',
      icon: TrendingUp,
      color: 'green',
      requiredTier: 'pro' as const,
    },
    {
      id: 'manipulation_score',
      title: 'Manipulation Detection',
      description: 'Detect potential media manipulation and bias indicators',
      icon: AlertTriangle,
      color: 'red',
      requiredTier: 'pro' as const,
    }
  ];

  const handleFeatureClick = (featureId: string) => {
    if (!canAccess(featureId)) {
      setSelectedFeature(featureId);
      setShowUpgradeModal(true);
    }
  };

  const getFeatureColor = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600'
    };
    return colors[color as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'pro':
      case 'business':
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
            <Crown className="w-3 h-3" />
            <span>{tier === 'pro' ? 'Pro' : 'Business'}</span>
          </div>
        );
      case 'starter':
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
            <Zap className="w-3 h-3" />
            <span>Starter</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
            <span>Free</span>
          </div>
        );
    }
  };

  if (isPremium) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">Premium Intelligence Unlocked</h3>
            </div>
            {getTierBadge(tier)}
          </div>
          <p className="text-purple-700 dark:text-purple-300 mb-4">
            You now have access to advanced AI-powered analysis tools. Explore the comprehensive insights below.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {premiumFeatures.map((feature) => {
            const Icon = feature.icon;
            const isAccessible = canAccess(feature.id);
            
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`bg-white dark:bg-slate-900/70 rounded-xl p-6 shadow-lg border-2 transition-all duration-300 ${
                  isAccessible 
                    ? 'border-green-200 dark:border-green-800 hover:shadow-xl hover:scale-105 cursor-pointer' 
                    : 'border-gray-200 dark:border-gray-800 opacity-75'
                }`}
                onClick={() => isAccessible && handleFeatureClick(feature.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getFeatureColor(feature.color)} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h4>
                  {isAccessible && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{feature.description}</p>
                
                {isAccessible ? (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm font-medium">
                    ✓ Available Now
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-2 rounded-lg text-sm">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Requires {feature.requiredTier === 'pro' ? 'Pro' : 'Business'}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Premium Analysis Components would be rendered here */}
        <div className="space-y-8">
          {analysisData.party && canAccess('party_barchart') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Political Stakeholder Analysis
              </h4>
              <div className="bg-white dark:bg-slate-900/70 rounded-xl p-6 shadow-lg">
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-300">Political impact visualization</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Stakeholder influence analysis</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {analysisData.stock && canAccess('stock_impact') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Stock Market Impact Prediction
              </h4>
              <div className="bg-white dark:bg-slate-900/70 rounded-xl p-6 shadow-lg">
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-300">Market impact prediction</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sector analysis and forecasts</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {analysisData.manipulation && canAccess('manipulation_score') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Manipulation Detection Report
              </h4>
              <div className="bg-white dark:bg-slate-900/70 rounded-xl p-6 shadow-lg">
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-300">Bias and manipulation analysis</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Credibility assessment</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // For non-premium users (Free and Starter), show upgrade prompts
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">Premium Intelligence</h3>
          </div>
          {getTierBadge(tier)}
        </div>
        <p className="text-purple-700 dark:text-purple-300 mb-4">
          Unlock advanced AI-powered analysis tools with our Pro Analyst plan.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Upgrade to Pro
          </button>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 px-6 py-2 rounded-lg border border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-medium"
          >
            Learn More
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {premiumFeatures.map((feature) => {
          const Icon = feature.icon;
          
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900/70 rounded-xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-800 opacity-75 relative"
            >
              <div className="absolute top-4 right-4">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getFeatureColor(feature.color)} flex items-center justify-center opacity-50`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{feature.description}</p>
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-2 rounded-lg text-sm">
                <Lock className="w-4 h-4 inline mr-1" />
                Requires {feature.requiredTier === 'pro' ? 'Pro' : 'Business'}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md mx-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upgrade to Pro</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {selectedFeature ? getUpgradeMessage(selectedFeature) : 'Unlock advanced AI-powered analysis tools with our Pro Analyst plan.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/pricing')}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
              >
                View Plans
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
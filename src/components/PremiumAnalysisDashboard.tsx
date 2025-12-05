import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Lock, Crown, TrendingUp, Users, AlertTriangle, BarChart3, CheckCircle } from 'lucide-react';

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

  const premiumFeatures = [
    {
      id: 'party_barchart',
      title: 'Political Impact Analysis',
      description: 'Analyze political stakeholder influence and party impact on news narratives',
      icon: Users,
      color: 'blue',
      component: 'PartyBarChart'
    },
    {
      id: 'stock_impact',
      title: 'Stock Market Impact',
      description: 'Predict potential stock market reactions and sector impacts',
      icon: TrendingUp,
      color: 'green',
      component: 'StockImpactMeter'
    },
    {
      id: 'manipulation_score',
      title: 'Manipulation Detection',
      description: 'Detect potential media manipulation and bias indicators',
      icon: AlertTriangle,
      color: 'red',
      component: 'ManipulationDetector'
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

  if (tier === 'premium') {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-purple-900">Premium Intelligence Unlocked</h3>
          </div>
          <p className="text-purple-700 mb-4">
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
                className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all duration-300 ${
                  isAccessible 
                    ? 'border-green-200 hover:shadow-xl hover:scale-105 cursor-pointer' 
                    : 'border-gray-200 opacity-75'
                }`}
                onClick={() => isAccessible && handleFeatureClick(feature.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getFeatureColor(feature.color)} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                  {isAccessible && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                
                {isAccessible ? (
                  <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                    ✓ Available Now
                  </div>
                ) : (
                  <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Premium Required
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Premium Analysis Components */}
        <div className="space-y-8">
          {analysisData.party && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Political Stakeholder Analysis
              </h4>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                {/* Party Bar Chart Component */}
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-600">Political impact visualization</p>
                    <p className="text-sm text-gray-500 mt-1">Stakeholder influence analysis</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {analysisData.stock && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Stock Market Impact Prediction
              </h4>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                {/* Stock Impact Meter */}
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-600">Market impact prediction</p>
                    <p className="text-sm text-gray-500 mt-1">Sector analysis and forecasts</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {analysisData.manipulation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Manipulation Detection Report
              </h4>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                {/* Manipulation Detector */}
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-gray-600">Bias and manipulation analysis</p>
                    <p className="text-sm text-gray-500 mt-1">Credibility assessment</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // For non-premium users, show upgrade prompts
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-purple-900">Premium Intelligence</h3>
        </div>
        <p className="text-purple-700 mb-4">
          Unlock advanced AI-powered analysis tools with our Premium plan.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Upgrade to Premium
          </button>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg border border-purple-300 hover:bg-purple-50 transition-colors font-medium"
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
              className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 opacity-75 relative"
            >
              <div className="absolute top-4 right-4">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getFeatureColor(feature.color)} flex items-center justify-center opacity-50`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">{feature.title}</h4>
              </div>
              <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
              <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm">
                <Lock className="w-4 h-4 inline mr-1" />
                Premium Required
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Upgrade to Premium</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {selectedFeature ? getUpgradeMessage(selectedFeature) : 'Unlock advanced AI-powered analysis tools with our Premium plan.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = '/pricing'}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                View Plans
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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
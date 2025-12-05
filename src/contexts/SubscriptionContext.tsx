import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SubscriptionTier = 'free' | 'monthly' | 'premium' | 'enterprise';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  canAccess: (feature: string) => boolean;
  getUpgradeMessage: (feature: string) => string;
  getUpgradeCTA: (feature: string) => string;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const FEATURE_ACCESS: Record<string, SubscriptionTier[]> = {
  // Premium features (used in AnalysisResultPage)
  'market_impact': ['premium', 'enterprise'],
  'motive_analysis': ['premium', 'enterprise'],
  'stakeholder_impact': ['premium', 'enterprise'],
  'manipulation_score': ['premium', 'enterprise'],
  'winner_loser_network': ['premium', 'enterprise'],
  
  // Component-specific keys (used by individual components)
  'stock_impact': ['premium', 'enterprise'],        // StockImpactMeter
  'motive_heatmap': ['premium', 'enterprise'],      // MotiveHeatmap
  'party_barchart': ['premium', 'enterprise'],      // PartyBarChart
  'manipulation_gauge': ['premium', 'enterprise'],  // ManipulationScoreGauge
  
  // Other features
  'pestle_detailed': ['monthly', 'premium', 'enterprise'],
  'ai_recommendations': ['monthly', 'premium', 'enterprise'],
};

const UPGRADE_MESSAGES: Record<string, string> = {
  // AnalysisResultPage keys
  'market_impact': 'See which stocks and sectors are affected by breaking news',
  'motive_analysis': 'Uncover hidden agendas and bias patterns in articles',
  'stakeholder_impact': 'Understand who wins and loses from policy changes',
  'manipulation_score': 'Detect emotional manipulation and propaganda tactics',
  'winner_loser_network': 'Map the network of winners and losers',
  
  // Component-specific keys
  'stock_impact': 'See which stocks and sectors are affected by breaking news',
  'motive_heatmap': 'Uncover hidden agendas and bias patterns in articles',
  'party_barchart': 'Understand who wins and loses from policy changes',
  'manipulation_gauge': 'Detect emotional manipulation and propaganda tactics',
  
  // Other features
  'pestle_detailed': 'Get detailed strategic analysis for each PESTLE factor',
  'ai_recommendations': 'Receive AI-powered action recommendations',
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  // Initialize from localStorage, default to 'free'
  const [tier, setTierState] = useState<SubscriptionTier>(() => {
    const storedTier = localStorage.getItem('userTier');
    console.log('🔐 SubscriptionContext: Initial tier from localStorage:', storedTier);
    return (storedTier as SubscriptionTier) || 'free';
  });

  // Sync tier changes to localStorage
  const setTier = (newTier: SubscriptionTier) => {
    console.log('🔐 SubscriptionContext: Setting tier to:', newTier);
    localStorage.setItem('userTier', newTier);
    setTierState(newTier);
  };

  // Listen for localStorage changes (e.g., from other tabs or manual changes)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userTier' && e.newValue) {
        console.log('🔐 SubscriptionContext: Tier changed in localStorage:', e.newValue);
        setTierState(e.newValue as SubscriptionTier);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Also check localStorage periodically (for same-tab changes)
  useEffect(() => {
    const interval = setInterval(() => {
      const storedTier = localStorage.getItem('userTier');
      if (storedTier && storedTier !== tier) {
        console.log('🔐 SubscriptionContext: Detected tier change in localStorage:', storedTier);
        setTierState(storedTier as SubscriptionTier);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [tier]);

  const canAccess = (feature: string): boolean => {
    const requiredTiers = FEATURE_ACCESS[feature] || [];
    const hasAccess = requiredTiers.includes(tier);
    console.log(`🔐 SubscriptionContext: canAccess('${feature}') = ${hasAccess} (tier: ${tier})`);
    return hasAccess;
  };

  const getUpgradeMessage = (feature: string): string => {
    return UPGRADE_MESSAGES[feature] || 'Upgrade to access this premium feature';
  };

  const getUpgradeCTA = (feature: string): string => {
    if (tier === 'free') {
      return 'Upgrade to Premium';
    } else if (tier === 'monthly') {
      return 'Upgrade to Premium';
    }
    return 'Learn More';
  };

  console.log('🔐 SubscriptionContext: Current tier:', tier);

  return (
    <SubscriptionContext.Provider value={{ tier, setTier, canAccess, getUpgradeMessage, getUpgradeCTA }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext;
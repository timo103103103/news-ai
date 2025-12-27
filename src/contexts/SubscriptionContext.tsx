import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'business';
export type BillingCycle = 'monthly' | 'yearly';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  billingCycle: BillingCycle | null;
  scansUsed: number;
  scansLimit: number;
  loading: boolean;
  setTier: (tier: SubscriptionTier) => void;
  canAccess: (feature: string) => boolean;
  getUpgradeMessage: (feature: string) => string;
  getUpgradeCTA: (feature: string) => string;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// ✅ FIXED: Complete Feature Access Mapping
const FEATURE_ACCESS: Record<string, SubscriptionTier[]> = {
  // Free tier features (everyone has access)
  'executive_summary': ['free', 'starter', 'pro', 'business'],
  'basic_credibility': ['free', 'starter', 'pro', 'business'],
  
  // Starter tier features ($9/month, $90/year - 40 scans)
  'executive_summaries': ['starter', 'pro', 'business'],
  'basic_pestle': ['starter', 'pro', 'business'],
  'standard_support': ['starter', 'pro', 'business'],
  
  // Pro tier features ($29/month, $290/year - 200 scans)
  'market_impact': ['pro', 'business'],
  'stock_impact': ['pro', 'business'],
  'motive_analysis': ['pro', 'business'],
  'motive_heatmap': ['pro', 'business'],
  'manipulation_score': ['pro', 'business'],
  'manipulation_gauge': ['pro', 'business'],
  
  // ✅ FIXED: Added party_impact for PartyBarChart
  'party_impact': ['pro', 'business'],
  'party_barchart': ['pro', 'business'],
  'stakeholder_mapping': ['pro', 'business'],
  'stakeholder_impact': ['pro', 'business'],
  
  'full_pestle': ['pro', 'business'],
  'pestle_detailed': ['pro', 'business'],
  'chronos': ['pro', 'business'],
  'chronos_patterns': ['pro', 'business'],
  'entropy': ['pro', 'business'],
  'thermodynamic_entropy': ['pro', 'business'],
  'winner_loser_network': ['pro', 'business'],
  'ouroboros': ['pro', 'business'],
  'predictive_modeling': ['pro', 'business'],
  
  // Business tier features ($79/month, $790/year - 800 scans)
  'api_access': ['business'],
  'data_export': ['business'],
  'csv_export': ['business'],
  'pdf_export': ['business'],
  'multi_seat': ['business'],
  'dedicated_manager': ['business'],
};

// Scan limits per tier (monthly)
const SCAN_LIMITS: Record<SubscriptionTier, number> = {
  'free': 10,
  'starter': 40,
  'pro': 200,
  'business': 800,
};

// Upgrade messages for each feature
const UPGRADE_MESSAGES: Record<string, string> = {
  'market_impact': 'See which stocks and sectors are affected by breaking news. Upgrade to Pro.',
  'stock_impact': 'Get Bull/Bear market signals for specific tickers. Upgrade to Pro.',
  'motive_analysis': 'Uncover hidden agendas and bias patterns in articles. Upgrade to Pro.',
  'motive_heatmap': 'Visualize manipulation techniques and motives. Upgrade to Pro.',
  'manipulation_score': 'Detect emotional manipulation and propaganda tactics. Upgrade to Pro.',
  'manipulation_gauge': 'Measure media manipulation levels. Upgrade to Pro.',
  'party_impact': 'Understand stakeholder power dynamics and political impacts. Upgrade to Pro.',
  'party_barchart': 'Understand political stakeholder impacts. Upgrade to Pro.',
  'stakeholder_mapping': 'Identify winners and losers from policy changes. Upgrade to Pro.',
  'stakeholder_impact': 'Map the power-interest dynamics. Upgrade to Pro.',
  'full_pestle': 'Get comprehensive strategic PESTLE analysis. Upgrade to Pro.',
  'pestle_detailed': 'Access detailed strategic insights for each factor. Upgrade to Pro.',
  'chronos': 'Match current events to historical patterns. Upgrade to Pro.',
  'chronos_patterns': 'Access Chronos Isomorphism pattern matching. Upgrade to Pro.',
  'entropy': 'Analyze signal-to-noise ratios. Upgrade to Pro.',
  'thermodynamic_entropy': 'Measure narrative predictability. Upgrade to Pro.',
  'winner_loser_network': 'See the complete winner/loser network. Upgrade to Pro.',
  'ouroboros': 'Access outcome propagation and causal chain analysis. Upgrade to Pro.',
  'predictive_modeling': 'Access advanced predictive modeling features. Upgrade to Pro.',
  
  'api_access': 'Integrate our intelligence into your systems. Upgrade to Business.',
  'data_export': 'Export analysis data to CSV/PDF. Upgrade to Business.',
  'csv_export': 'Export to CSV format. Upgrade to Business.',
  'pdf_export': 'Export to PDF format. Upgrade to Business.',
  'multi_seat': 'Add team members with multi-seat licensing. Upgrade to Business.',
  'dedicated_manager': 'Get a dedicated account manager. Upgrade to Business.',
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [tier, setTierState] = useState<SubscriptionTier>('free');
  const [billingCycle, setBillingCycle] = useState<BillingCycle | null>(null);
  const [scansUsed, setScansUsed] = useState(0);
  const [scansLimit, setScansLimit] = useState(SCAN_LIMITS.free);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: Fetch subscription from database matching server.js schema
  const refreshSubscription = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('📍 SubscriptionContext: No authenticated user, setting to free tier');
        setTierState('free');
        setBillingCycle(null);
        setScansUsed(0);
        setScansLimit(SCAN_LIMITS.free);
        setLoading(false);
        return;
      }

      console.log('📍 SubscriptionContext: Fetching subscription for user:', user.id);

      // ✅ FIXED: Match server.js column names exactly
      // Server uses: plan, analyses_used, analyses_limit, billing_cycle
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('plan, billing_cycle, analyses_used, analyses_limit')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ SubscriptionContext: Error fetching subscription:', error);
        setTierState('free');
        setBillingCycle(null);
        setScansUsed(0);
        setScansLimit(SCAN_LIMITS.free);
        setLoading(false);
        return;
      }
      if (!dbUser) {
        console.warn('⚠️ SubscriptionContext: No subscription row, defaulting to free');
        setTierState('free');
        setBillingCycle(null);
        setScansUsed(0);
        setScansLimit(SCAN_LIMITS.free);
        setLoading(false);
        return;
      }

      // Validate tier from database
      const validTiers: SubscriptionTier[] = ['free', 'starter', 'pro', 'business'];
      const validatedTier = validTiers.includes(dbUser?.plan as SubscriptionTier) 
        ? (dbUser.plan as SubscriptionTier) 
        : 'free';

      const validatedBillingCycle = dbUser?.billing_cycle as BillingCycle | null;

      console.log('✅ SubscriptionContext: Loaded tier:', validatedTier, 'billing:', validatedBillingCycle);
      console.log('✅ SubscriptionContext: Usage:', dbUser?.analyses_used, '/', dbUser?.analyses_limit);

      setTierState(validatedTier);
      setBillingCycle(validatedBillingCycle);
      setScansUsed(dbUser?.analyses_used || 0);
      setScansLimit(SCAN_LIMITS[validatedTier]);
      setLoading(false);

    } catch (err) {
      console.error('❌ SubscriptionContext: Unexpected error:', err);
      setTierState('free');
      setBillingCycle(null);
      setScansUsed(0);
      setScansLimit(SCAN_LIMITS.free);
      setLoading(false);
    }
  };

  // Load subscription on mount
  useEffect(() => {
    refreshSubscription();
  }, []);

  // Set tier (updates database)
  const setTier = async (newTier: SubscriptionTier) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ Cannot set tier: No authenticated user');
        return;
      }

      console.log('🔄 SubscriptionContext: Updating tier to:', newTier);

      // Update database
      const { error } = await supabase
        .from('users')
        .update({ plan: newTier })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Error updating tier:', error);
        return;
      }

      // Update local state
      setTierState(newTier);
      setScansLimit(SCAN_LIMITS[newTier]);

      console.log('✅ Tier updated successfully to:', newTier);
    } catch (err) {
      console.error('❌ Unexpected error updating tier:', err);
    }
  };

  // ✅ FIXED: Enhanced logging for debugging
  const canAccess = (feature: string): boolean => {
    const requiredTiers = FEATURE_ACCESS[feature] || [];
    const hasAccess = requiredTiers.includes(tier);
    
    console.log(`🔍 SubscriptionContext: canAccess('${feature}') = ${hasAccess} (tier: ${tier})`);
    
    if (!hasAccess) {
      console.log(`   ❌ Required tiers: [${requiredTiers.join(', ')}]`);
      console.log(`   ❌ Current tier: ${tier}`);
    }
    
    return hasAccess;
  };

  // Get upgrade message for a feature
  const getUpgradeMessage = (feature: string): string => {
    return UPGRADE_MESSAGES[feature] || 'Upgrade to access this premium feature';
  };

  // Get CTA text for upgrade
  const getUpgradeCTA = (feature: string): string => {
    const requiredTiers = FEATURE_ACCESS[feature] || [];
    
    // If feature requires business tier
    if (requiredTiers.includes('business') && !requiredTiers.includes('pro')) {
      return 'Upgrade to Business';
    }
    
    // If feature requires pro tier
    if (requiredTiers.includes('pro')) {
      if (tier === 'free' || tier === 'starter') {
        return 'Upgrade to Pro';
      }
      return 'Upgrade to Business';
    }
    
    // If feature requires starter tier
    if (requiredTiers.includes('starter')) {
      return 'Upgrade to Starter';
    }
    
    return 'Upgrade Plan';
  };

  const value: SubscriptionContextType = {
    tier,
    billingCycle,
    scansUsed,
    scansLimit,
    loading,
    setTier,
    canAccess,
    getUpgradeMessage,
    getUpgradeCTA,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
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

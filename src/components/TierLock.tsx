// TierLock.tsx - TRIAL GENEROSITY VERSION (ENHANCED)
// ============================================================================
// Added support for trial analysis teasers
// - isTrialAnalysis prop to detect first 3 free analyses
// - Special handling for market_impact_teaser AND sentiment_teaser during trial
// - Professional Bloomberg/Palantir-style preview experience
// ============================================================================

import { ReactNode } from 'react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Lock } from 'lucide-react'

type Feature =
  | 'hidden_motive_lite'
  | 'hidden_motive_full'
  | 'pestle_full'
  | 'stakeholder_impact'
  | 'market_impact'
  | 'market_impact_teaser'
  | 'sentiment_teaser'        // ✅ NEW: Sentiment preview for trial
  | 'predictive_modeling'
  | 'pdf_export'
  | 'csv_export'

interface TierLockProps {
  feature: Feature
  children: ReactNode

  /**
   * 🔑 Analysis-level override
   * If provided, this has higher priority than subscription tier.
   * Used by Results page to unlock FULL analysis for Business / Pro.
   */
  canAccessOverride?: (feature: Feature) => boolean

  /**
   * 🎯 Trial analysis detection
   * If true, this is one of the first 3 free analyses (generous trial)
   * Allows showing teasers instead of hard locks
   */
  isTrialAnalysis?: boolean
}

export default function TierLock({
  feature,
  children,
  canAccessOverride,
  isTrialAnalysis = false
}: TierLockProps) {
  const {
    canAccess,
    loading,
    getUpgradeMessage,
    getUpgradeCTA
  } = useSubscription()

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-6 text-sm text-slate-400">
        Loading access…
      </div>
    )
  }

  // 🔐 FINAL access decision (analysis > subscription)
  const allowed = canAccessOverride
    ? canAccessOverride(feature)
    : canAccess(feature)

  // ✅ Feature unlocked - show content
  if (allowed) {
    return <>{children}</>
  }

  // ===================================================================
  // 🎯 TRIAL GENEROSITY: Allow teasers during first 3 free analyses
  // ===================================================================
  // Shows preview of premium features to demonstrate value
  // Creates "Aha moment" before paywall (loss aversion psychology)
  if (
    isTrialAnalysis &&
    (feature === 'market_impact_teaser' || feature === 'sentiment_teaser')
  ) {
    return <>{children}</>
  }

  // ===================================================================
  // 🔒 Feature locked - show professional upgrade prompt
  // ===================================================================
  return (
    <div className="relative rounded-xl border border-dashed border-slate-300 dark:border-slate-700 overflow-hidden">
      <div className="blur-sm opacity-50 pointer-events-none">
        <div className="p-2">{children}</div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-900/70 p-8 text-center">
        <div className="flex justify-center mb-3">
          <Lock className="h-6 w-6 text-slate-500 dark:text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          {getUpgradeMessage(feature)}
        </p>
        <button
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          onClick={() => {
            window.location.href = '/pricing'
          }}
          aria-label="Upgrade to unlock this feature"
        >
          {getUpgradeCTA(feature)}
        </button>
      </div>
    </div>
  )
}
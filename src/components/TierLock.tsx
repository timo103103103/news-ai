// TierLock.tsx
import { ReactNode } from 'react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Lock } from 'lucide-react'

type Feature =
  | 'hidden_motive_lite'
  | 'hidden_motive_full'
  | 'pestle_full'
  | 'stakeholder_impact'
  | 'market_impact'
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
}

export default function TierLock({
  feature,
  children,
  canAccessOverride
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

  if (allowed) {
    return <>{children}</>
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-8 text-center">
      <div className="flex justify-center mb-4">
        <Lock className="h-6 w-6 text-slate-400" />
      </div>

      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
        {getUpgradeMessage(feature)}
      </p>

      <button
        className="mt-4 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        onClick={() => {
          window.location.href = '/pricing'
        }}
      >
        {getUpgradeCTA(feature)}
      </button>
    </div>
  )
}
// src/components/TierLock.tsx

import React from 'react'
import { Lock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '../contexts/SubscriptionContext'

/**
 * TierLock
 * -----------------------------------------
 * Feature-based access control wrapper.
 *
 * IMPORTANT:
 * - TierLock does NOT know about tiers (starter / pro / business)
 * - TierLock ONLY checks feature access via SubscriptionContext
 * - All tier logic MUST live in SubscriptionContext
 */
export interface TierLockProps {
  feature: string
  className?: string
  children: React.ReactNode
}

export function TierLock({
  feature,
  className = '',
  children,
}: TierLockProps) {
  const navigate = useNavigate()

  const {
    loading,
    canAccess,
    getUpgradeMessage,
    getUpgradeCTA,
  } = useSubscription()

  /**
   * 1️⃣ Loading state
   * Prevents flash-lock before subscription is hydrated
   */
  if (loading) {
    return (
      <div className={`rounded-xl border border-gray-200 dark:border-slate-800 p-6 ${className}`}>
        <div className="animate-pulse h-40 rounded bg-gray-100 dark:bg-slate-800" />
      </div>
    )
  }

  /**
   * 2️⃣ Access granted
   * Business / Pro / Starter handled internally by SubscriptionContext
   */
  if (canAccess(feature)) {
    return <>{children}</>
  }

  /**
   * 3️⃣ Locked view
   */
  return (
    <div className={`relative ${className}`}>
      <div className="rounded-xl border border-dashed border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 p-8 min-h-[260px] flex flex-col items-center justify-center text-center">
        <Lock className="w-10 h-10 mb-3 text-purple-600" />

        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-slate-100">
          Premium Feature
        </h3>

        <p className="text-sm text-gray-600 dark:text-slate-400 max-w-sm mb-4">
          {getUpgradeMessage(feature)}
        </p>

        <button
          type="button"
          onClick={() => navigate('/pricing')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
        >
          {getUpgradeCTA(feature)}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

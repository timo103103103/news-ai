import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode
} from 'react'
import { supabase } from '@/lib/supabase'

export type PlanTier = 'guest' | 'free' | 'starter' | 'pro' | 'business'
export type BillingCycle = 'monthly' | 'yearly'

interface SubscriptionState {
  plan: PlanTier
  billingCycle: BillingCycle | null
  analysesUsed: number
  analysesLimit: number
  usageMonth: string | null
}

interface SubscriptionContextType {
  loading: boolean
  plan: PlanTier
  billingCycle: BillingCycle | null
  analysesUsed: number
  analysesLimit: number
  usageMonth: string | null

  canAccess: (feature: string) => boolean
  getUpgradeMessage: (feature: string) => string
  getUpgradeCTA: (feature: string) => string

  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// ===== Feature matrix (你原本嗰套保持) =====
const FEATURE_MATRIX: Record<Exclude<PlanTier, 'guest'>, string[] | ['*']> = {
  free: ['summary', 'credibility_basic', 'pestle_lite', 'hidden_motive_lite'],
  starter: [
    'summary',
    'credibility_full',
    'pestle_full',
    'hidden_motive_lite',
    'hidden_motive_full',
  ],
  pro: ['*'],
  business: ['*'],
}

const FEATURE_MIN_TIER: Record<string, Exclude<PlanTier, 'guest'>> = {
  summary: 'free',
  credibility_basic: 'free',
  pestle_lite: 'free',
  hidden_motive_lite: 'free',

  credibility_full: 'starter',
  pestle_full: 'starter',
  hidden_motive_full: 'starter',

  stakeholder_impact: 'pro',
  market_impact: 'pro',
  predictive_modeling: 'pro',

  pdf_export: 'business',
  csv_export: 'business',
}

const UPGRADE_MESSAGES: Record<string, string> = {
  hidden_motive_full:
    'Upgrade to view full narrative motives, incentives, and framing mechanics.',
  stakeholder_impact:
    'Upgrade to analyze power dynamics and stakeholder influence.',
  market_impact:
    'Upgrade to see market impact, beneficiaries, and downside risks.',
  predictive_modeling:
    'Upgrade to access future scenarios, signal quality, and chain reactions.',
  pdf_export:
    'Upgrade to Business to export reports and retain extended history.',
  csv_export:
    'Upgrade to Business to export structured data and analytics.',
}

const DEFAULT_LIMITS: Record<Exclude<PlanTier, 'guest'>, number> = {
  free: 5,
  starter: 40,
  pro: 200,
  business: 800,
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)

  const [state, setState] = useState<SubscriptionState>({
    plan: 'free',
    billingCycle: null,
    analysesUsed: 0,
    analysesLimit: DEFAULT_LIMITS.free,
    usageMonth: null,
  })

  const normalizePlan = (value?: string | null): PlanTier => {
    const v = (value || '').trim().toLowerCase()
    if (v === 'starter' || v === 'pro' || v === 'business' || v === 'free') return v
    if (v === 'premium') return 'pro' // ✅ 防止 webhook/舊值
    return 'free'
  }

  const refreshSubscription = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()

      if (userErr) {
        console.warn('[SUB] getUser error:', userErr)
      }

      if (!user) {
        setState({
          plan: 'guest',
          billingCycle: null,
          analysesUsed: 0,
          analysesLimit: DEFAULT_LIMITS.free,
          usageMonth: null,
        })
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('plan, billing_cycle, analyses_used, analyses_limit, usage_month')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        // ✅ 你而家最需要見到呢條 error（通常係 RLS）
        console.error('[SUB] profiles select failed:', error)
        setState({
          plan: 'free',
          billingCycle: null,
          analysesUsed: 0,
          analysesLimit: DEFAULT_LIMITS.free,
          usageMonth: null,
        })
        return
      }

      const plan = normalizePlan(data.plan)
      const billingCycle =
        data.billing_cycle === 'monthly' || data.billing_cycle === 'yearly'
          ? data.billing_cycle
          : null

      setState({
        plan,
        billingCycle,
        analysesUsed: Number(data.analyses_used || 0),
        analysesLimit:
          typeof data.analyses_limit === 'number'
            ? data.analyses_limit
            : DEFAULT_LIMITS[plan === 'guest' ? 'free' : plan],
        usageMonth: data.usage_month || null,
      })

      console.log('[SUB] refreshed:', {
        userId: user.id,
        plan,
        billingCycle,
        analysesUsed: Number(data.analyses_used || 0),
        analysesLimit:
          typeof data.analyses_limit === 'number'
            ? data.analyses_limit
            : DEFAULT_LIMITS[plan === 'guest' ? 'free' : plan],
        usageMonth: data.usage_month || null,
      })
    } finally {
      setLoading(false)
    }
  }

  // ✅ 首次載入 + 登入/登出都 refresh
  useEffect(() => {
    refreshSubscription()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshSubscription()
    })
    return () => {
      sub?.subscription?.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canAccess = (feature: string): boolean => {
    const effectivePlan: Exclude<PlanTier, 'guest'> =
      state.plan === 'guest' ? 'free' : state.plan

    if (effectivePlan === 'pro' || effectivePlan === 'business') return true

    const allowed = FEATURE_MATRIX[effectivePlan]
    if (allowed?.[0] === '*') return true
    return (allowed as string[]).includes(feature)
  }

  const getUpgradeMessage = (feature: string): string =>
    UPGRADE_MESSAGES[feature] || 'This feature requires an upgrade.'

  const getUpgradeCTA = (feature: string): string => {
    const plan = state.plan === 'guest' ? 'free' : state.plan
    const minTier = FEATURE_MIN_TIER[feature] || 'pro'

    if (plan === 'free' && minTier === 'starter') return 'Upgrade to Starter'
    if ((plan === 'free' || plan === 'starter') && minTier === 'pro') return 'Upgrade to Pro'
    if (plan !== 'business' && minTier === 'business') return 'Upgrade to Business'
    return 'View Plans'
  }

  const value = useMemo<SubscriptionContextType>(
    () => ({
      loading,
      plan: state.plan,
      billingCycle: state.billingCycle,
      analysesUsed: state.analysesUsed,
      analysesLimit: state.analysesLimit,
      usageMonth: state.usageMonth,
      canAccess,
      getUpgradeMessage,
      getUpgradeCTA,
      refreshSubscription,
    }),
    [loading, state]
  )

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider')
  return ctx
}

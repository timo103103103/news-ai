import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

// ✅ 你的 App 目前「真正需要的使用者格式」
export type AuthUser = {
  id: string
  email: string
  plan: 'free' | 'pro' | 'premium'
  credits: number
}

type AuthStore = {
  // state
  user: AuthUser | null
  loading: boolean

  // computed
  isAuthenticated: boolean

  // actions
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

// ✅ 預設值（避免 undefined 問題）
const DEFAULT_USER: AuthUser | null = null

const useAuthStore = create<AuthStore>((set, get) => ({
  // ===== STATE =====
  user: DEFAULT_USER,
  loading: true,

  // ===== COMPUTED =====
  isAuthenticated: false,

  // ===== ACTIONS =====
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      loading: false,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
    }),
}))

export default useAuthStore

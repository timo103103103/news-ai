import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

type Plan = 'free' | 'starter' | 'pro' | 'business'

interface AuthUser {
  id: string
  email: string
  plan: Plan
  billingCycle: string | null
  scansUsed: number
  scansLimit: number
}

interface AuthState {
  user: AuthUser | null
  session: any | null
  loading: boolean
  error: any | null
  isAuthenticated: boolean

  // Core setters
  setUser: (user: AuthUser | null) => void
  setSession: (session: any | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: any) => void
  clearError: () => void

  // Auth methods
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  /* ----------------------------------
   * Core setters
   * ---------------------------------- */
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setSession: (session) => set({ session }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),

  /* ----------------------------------
   * 🔐 EMAIL / PASSWORD SIGNUP
   * ---------------------------------- */
  signUp: async (email, password) => {
    try {
      set({ loading: true, error: null })

      console.log('🔐 Supabase signUp start:', email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      console.log('✅ Supabase signUp success:', data.user?.id)

      // ⚠️ Do NOT set session or user here
      // User must verify email first (default Supabase behavior)

    } catch (err: any) {
      console.error('❌ signUp error:', err)
      set({ error: err })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  /* ----------------------------------
   * 🔐 EMAIL / PASSWORD LOGIN
   * ---------------------------------- */
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null })

      console.log('🔐 Supabase signIn start:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log('✅ Supabase signIn success:', data.user?.id)

      // Session will be handled by AuthProvider's onAuthStateChange listener
      
    } catch (err: any) {
      console.error('❌ signIn error:', err)
      set({ error: err })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  /* ----------------------------------
   * OAuth login / signup
   * ---------------------------------- */
  signInWithOAuth: async (provider) => {
    try {
      set({ loading: true, error: null })

      console.log('🔐 OAuth signIn start:', provider)

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      console.log('✅ OAuth redirect initiated:', provider)

    } catch (err: any) {
      console.error('❌ OAuth error:', err)
      set({ error: err })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  /* ----------------------------------
   * Logout
   * ---------------------------------- */
  signOut: async () => {
    try {
      set({ loading: true, error: null })

      console.log('🚪 Signing out...')

      const { error } = await supabase.auth.signOut()

      if (error) throw error

      set({ 
        user: null, 
        session: null, 
        isAuthenticated: false 
      })

      console.log('✅ Signed out successfully')

    } catch (err: any) {
      console.error('❌ Sign out error:', err)
      set({ error: err })
    } finally {
      set({ loading: false })
    }
  },
}))

export default useAuthStore
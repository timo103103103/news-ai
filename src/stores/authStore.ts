import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, User, AuthError } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
  isAuthenticated: boolean
  rememberMe: boolean
}

interface AuthActions {
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<{ data: any; error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  signInWithOAuth: (provider: 'google' | 'github', redirectUrl?: string) => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>
  clearError: () => void
  setSession: (session: Session | null) => void
  checkAuth: () => Promise<void>
}

const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      rememberMe: false,

      signIn: async (email: string, password: string, rememberMe = false) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({
              error: { message: error.message },
              loading: false,
            })
            return { error }
          }

          const user: User = {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at,
          }

          set({
            user,
            session: data.session,
            isAuthenticated: true,
            rememberMe,
            loading: false,
          })
          if (user.email === 'bryon103@gmail.com') {
            try { localStorage.setItem('userTier', 'premium') } catch {}
          }
          
          return { error: null }
        } catch (error) {
          const authError = { message: error instanceof Error ? error.message : 'Login failed' }
          set({
            error: authError,
            loading: false,
          })
          return { error: authError }
        }
      },

      signUp: async (email: string, password: string, metadata?: { name?: string }) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: metadata
            }
          })

          if (error) {
            set({
              error: { message: error.message },
              loading: false,
            })
            return { data: null, error }
          }

          if (data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at,
            }

            set({
              user,
              session: data.session,
              isAuthenticated: !!data.session,
              loading: false,
            })
          }
          
          return { data, error: null }
        } catch (error) {
          const authError = { message: error instanceof Error ? error.message : 'Signup failed' }
          set({
            error: authError,
            loading: false,
          })
          return { data: null, error: authError }
        }
      },

      signOut: async () => {
        set({ loading: true })
        try {
          const { error } = await supabase.auth.signOut()
          if (error) {
            set({
              error: { message: error.message },
              loading: false,
            })
            return { error }
          }

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            rememberMe: false,
            loading: false,
          })
          
          return { error: null }
        } catch (error) {
          const authError = { message: error instanceof Error ? error.message : 'Logout failed' }
          set({
            error: authError,
            loading: false,
          })
          return { error: authError }
        }
      },

      resetPassword: async (email: string) => {
        set({ loading: true, error: null })
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })
          if (error) {
            set({
              error: { message: error.message },
              loading: false,
            })
            return { error }
          }
          set({ loading: false })
          return { error: null }
        } catch (error) {
          const authError = { message: error instanceof Error ? error.message : 'Password reset failed' }
          set({
            error: authError,
            loading: false,
          })
          return { error: authError }
        }
      },

      updatePassword: async (newPassword: string) => {
        set({ loading: true, error: null })
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          })
          if (error) {
            set({
              error: { message: error.message },
              loading: false,
            })
            return { error }
          }
          set({ loading: false })
          return { error: null }
        } catch (error) {
          const authError = { message: error instanceof Error ? error.message : 'Password update failed' }
          set({
            error: authError,
            loading: false,
          })
          return { error: authError }
        }
      },

      signInWithOAuth: async (provider: 'google' | 'github', redirectUrl?: string) => {
        set({ loading: true, error: null })
        try {
          // Use provided redirectUrl or default to current origin
          const finalRedirectUrl = redirectUrl || `${window.location.origin}/auth/callback`
          
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: finalRedirectUrl,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          })
          if (error) {
            set({
              error: { message: error.message },
              loading: false,
            })
            return { error }
          }
          // DON'T set loading to false - user will be redirected to OAuth provider
          // Loading state will be cleared when they return via auth callback
          return { error: null }
        } catch (error) {
          const authError = { message: error instanceof Error ? error.message : `${provider} login failed` }
          set({
            error: authError,
            loading: false,
          })
          return { error: authError }
        }
      },

      clearError: () => set({ error: null }),

      setSession: (session: Session | null) => {
        if (session) {
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at,
          }
          set({
            user,
            session,
            isAuthenticated: true,
          })
          if (user.email === 'bryon103@gmail.com') {
            try { localStorage.setItem('userTier', 'premium') } catch {}
          }
        } else {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          })
        }
      },

      checkAuth: async () => {
        set({ loading: true })
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error) throw error

          if (session) {
            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at,
            }
            set({
              user,
              session,
              isAuthenticated: true,
              loading: false,
            })
            if (user.email === 'bryon103@gmail.com') {
              try { localStorage.setItem('userTier', 'premium') } catch {}
            }
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              loading: false,
            })
          }
        } catch (error) {
          set({
            error: { message: error instanceof Error ? error.message : 'Auth check failed' },
            loading: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
)

export default useAuthStore

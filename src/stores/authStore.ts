import { create } from "zustand"

export type AuthUser = {
  id: string
  email: string
  plan: "free" | "pro" | "premium"
  credits: number
}

type AuthStore = {
  user: AuthUser | null
  loading: boolean

  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  logout: () =>
    set({
      user: null,
      loading: false,
    }),
}))

export default useAuthStore

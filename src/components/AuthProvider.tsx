import { useEffect } from 'react'
import useAuthStore from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    // ✅ 初始化同步 session
    const syncSession = async () => {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
      }

      setLoading(false)
    }

    syncSession()

    // ✅ 監聽登入 / 登出狀態
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  return <>{children}</>
}

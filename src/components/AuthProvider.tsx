import { useEffect } from "react"
import { supabase } from "../lib/supabase"
import useAuthStore from "../stores/authStore"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    let alive = true

    const applyUserFromSession = async (session: any) => {
      if (!alive) return

      if (!session?.user) {
        setUser(null)
        setLoading(false)
        return
      }

      const user = session.user

      try {
        const { data: dbUser } = await supabase
          .from("users")
          .select("plan, billing_cycle, scans_used_this_month, scans_limit")
          .eq("id", user.id)
          .single()

        const validTiers = ["free", "starter", "pro", "business"]

        setUser({
          id: user.id,
          email: user.email || "",
          plan: validTiers.includes(dbUser?.plan)
            ? dbUser.plan
            : "free",
          billingCycle: dbUser?.billing_cycle || null,
          scansUsed: dbUser?.scans_used_this_month ?? 0,
          scansLimit: dbUser?.scans_limit ?? 10,
        })
      } catch {
        setUser({
          id: user.id,
          email: user.email || "",
          plan: "free",
          billingCycle: null,
          scansUsed: 0,
          scansLimit: 10,
        })
      } finally {
        // ⭐⭐⭐ 這一行是關鍵
        setLoading(false)
      }
    }

    // ===== 初始化（refresh / first load）=====
    setLoading(true)
    supabase.auth.getSession().then(({ data }) => {
      applyUserFromSession(data.session)
    })

    // ===== 監聽登入 / 登出 =====
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event)

      setLoading(true)
      applyUserFromSession(session)
    })

    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  return <>{children}</>
}

import { useEffect } from "react"
import { supabase } from "../lib/supabase"
import useAuthStore from "../stores/authStore"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const setUser = useAuthStore((s) => s.setUser)
  const setSession = useAuthStore((s) => s.setSession)
  const clearError = useAuthStore((s) => s.clearError)

  useEffect(() => {
    let alive = true

    const applyUserFromSession = async (session: any) => {
      if (!alive) return

      if (!session?.user) {
        console.log("🚪 No session user")
        setSession(null)
        setUser(null)
        return
      }

      const user = session.user
      console.log("✅ Session user detected:", user.email)

      setSession(session)

      try {
        const { data: dbUser, error } = await supabase
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
      } catch (err) {
        console.warn("⚠️ Failed to fetch user profile, fallback to free")

        setUser({
          id: user.id,
          email: user.email || "",
          plan: "free",
          billingCycle: null,
          scansUsed: 0,
          scansLimit: 10,
        })
      }
    }

    // ===== Initial load (refresh / first mount) =====
    console.log("🔐 AuthProvider mounted")
    clearError()

    supabase.auth.getSession().then(({ data }) => {
      applyUserFromSession(data.session)
    })

    // ===== Listen to auth changes =====
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth event:", event)
      clearError()
      applyUserFromSession(session)
    })

    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [setUser, setSession, clearError])

  return <>{children}</>
}

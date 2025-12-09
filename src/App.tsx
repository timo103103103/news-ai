import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "./lib/supabase"
import useAuthStore from "./stores/authStore"

function App() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setUser(null)
        return
      }

      // ✅ 從資料庫拉 plan / credits
      const { data: dbUser } = await supabase
        .from("users")
        .select("plan, credits")
        .eq("id", session.user.id)
        .single()

      setUser({
        id: session.user.id,
        email: session.user.email || "",
        plan: dbUser?.plan || "free",
        credits: dbUser?.credits ?? 0,
      })
    }

    initAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setUser(null)
        } else {
          const { data: dbUser } = await supabase
            .from("users")
            .select("plan, credits")
            .eq("id", session.user.id)
            .single()

          setUser({
            id: session.user.id,
            email: session.user.email || "",
            plan: dbUser?.plan || "free",
            credits: dbUser?.credits ?? 0,
          })
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [setUser])

  if (loading) return null

  return null
}

export default App

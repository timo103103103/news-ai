import { useEffect } from "react"
import { supabase } from "../lib/supabase"
import useAuthStore from "../stores/authStore"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    const sync = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setUser(null)
        return
      }

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

    sync()
  }, [setUser])

  return <>{children}</>
}

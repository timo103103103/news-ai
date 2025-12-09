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
    const init = async () => {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setUser(null)
        setLoading(false)
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
        plan: (dbUser?.plan as any) || "free",
        credits: dbUser?.credits ?? 0,
      })

      setLoading(false)
    }

    init()
  }, [setUser, setLoading])

  return <>{children}</>
}

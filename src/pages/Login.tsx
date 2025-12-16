import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import useAuthStore from "../stores/authStore"

export default function Login() {
  const setUser = useAuthStore((s) => s.setUser)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch user tier / quota data from database
   * ❗ 不做 redirect，只更新 store
   */
  const fetchUserData = async (userId: string, userEmail: string) => {
    try {
      const { data: dbUser, error: dbError } = await supabase
        .from("users")
        .select("plan, billing_cycle, scans_used_this_month, scans_limit")
        .eq("id", userId)
        .single()

      const validTiers = ["free", "starter", "pro", "business"]

      if (dbError || !dbUser) {
        // fallback: free plan
        setUser({
          id: userId,
          email: userEmail,
          plan: "free",
          billingCycle: null,
          scansUsed: 0,
          scansLimit: 10,
        })
        return
      }

      setUser({
        id: userId,
        email: userEmail,
        plan: validTiers.includes(dbUser.plan) ? dbUser.plan : "free",
        billingCycle: dbUser.billing_cycle || null,
        scansUsed: dbUser.scans_used_this_month ?? 0,
        scansLimit: dbUser.scans_limit ?? 10,
      })
    } catch (err) {
      // hard fallback
      setUser({
        id: userId,
        email: userEmail,
        plan: "free",
        billingCycle: null,
        scansUsed: 0,
        scansLimit: 10,
      })
    }
  }

  /**
   * EMAIL / PASSWORD LOGIN
   */
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (signInError) throw signInError
      if (!data.user) throw new Error("Login failed")

      await fetchUserData(data.user.id, data.user.email || "")
      // ✅ 不 redirect
      // AuthProvider / Route Guard 會自動處理

    } catch (err: any) {
      setError(err.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  /**
   * GOOGLE LOGIN
   */
  const handleGoogleLogin = async () => {
    setError(null)
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  /**
   * GITHUB LOGIN
   */
  const handleGithubLogin = async () => {
    setError(null)
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  /**
   * Enter key support
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900/80 p-8 shadow-lg border border-slate-200 dark:border-slate-800">

        <h1 className="text-2xl font-bold text-center mb-6">
          Welcome Back
        </h1>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="you@example.com"
          className="mb-3 w-full rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="••••••••"
          className="mb-4 w-full rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="my-4 text-center text-sm text-gray-400">
          or continue with
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex-1 rounded border border-gray-300 dark:border-slate-700 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            Google
          </button>

          <button
            onClick={handleGithubLogin}
            disabled={loading}
            className="flex-1 rounded border border-gray-300 dark:border-slate-700 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            GitHub
          </button>
        </div>

        <div className="mt-4 flex justify-between text-sm">
          <Link
            to="/forgot-password"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

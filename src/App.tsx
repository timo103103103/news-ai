import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../lib/supabase" // ⚠️ 請確認你的 supabase client 路徑正確
import { useAuthStore } from "../stores/authStore"

export default function Login() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅【最重要】登入後 / 重新整理 → 自動跳首頁
  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) {
        setUser(data.session.user)
        navigate("/") // ✅ 這一行就是你之前「Google 登入還卡住」的根本解法
      }
    }

    syncSession()
  }, [navigate, setUser])

  // ✅ Email / Password 登入
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data?.user) {
      setUser(data.user)
      navigate("/")
    }

    setLoading(false)
  }

  // ✅ Google 登入
  const handleGoogleLogin = async () => {
    setError(null)
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
  }

  // ✅ GitHub 登入
  const handleGithubLogin = async () => {
    setError(null)
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        {/* ✅ Logo / Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-500 text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        {/* ✅ Error */}
        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {/* ✅ Email & Password */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* ✅ OAuth */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full border py-2 rounded hover:bg-gray-50"
          >
            Continue with Google
          </button>

          <button
            onClick={handleGithubLogin}
            className="w-full border py-2 rounded hover:bg-gray-50"
          >
            Continue with GitHub
          </button>
        </div>

        {/* ✅ Signup */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import useAuthStore from "../stores/authStore"

export default function Login() {
  const navigate = useNavigate()

  const { setUser } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ SESSION SYNC AFTER GOOGLE LOGIN
  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        const user = data.session.user

        setUser({
          id: user.id,
          email: user.email || "",
          plan: "free", // ✅ backend can overwrite later
          credits: 10,
        })

        navigate("/")
      }
    }
    syncSession()
  }, [navigate, setUser])

  // ✅ EMAIL LOGIN
  const handleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const user = data.user

      setUser({
        id: user.id,
        email: user.email || "",
        plan: "free",
        credits: 10,
      })

      navigate("/")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/login",
      },
    })
  }

  // ✅ GITHUB LOGIN
  const handleGithubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin + "/login",
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>

        {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="my-4 text-center text-gray-400 text-sm">or continue with</div>

        <div className="flex gap-3">
          <button
            onClick={handleGoogleLogin}
            className="flex-1 border py-2 rounded hover:bg-gray-100"
          >
            Google
          </button>

          <button
            onClick={handleGithubLogin}
            className="flex-1 border py-2 rounded hover:bg-gray-100"
          >
            GitHub
          </button>
        </div>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

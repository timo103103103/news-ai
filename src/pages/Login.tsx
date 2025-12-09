import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'
import { Mail, Lock, Eye, EyeOff, Github, Chrome, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import useAuthStore from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

interface LoginErrors {
  email?: string
  password?: string
  general?: string
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInWithOAuth, loading, error, clearError } = useAuthStore()

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [errors, setErrors] = useState<LoginErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showVerificationAlert, setShowVerificationAlert] = useState(false)

  // ✅ ✅ ✅ 唯一登入狀態來源：Supabase Session
  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession()
      console.log('🔄 Sync session result:', data)

      if (data.session) {
        console.log('✅ Session found, redirecting to home...')
        navigate('/')
      }
    }

    syncSession()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, session)

      if (session) {
        navigate('/')
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [navigate])

  // 清除錯誤
  useEffect(() => {
    clearError()
  }, [location, clearError])

  // 驗證成功提示
  useEffect(() => {
    if (location.state?.verificationSuccess) {
      setShowVerificationAlert(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof LoginErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // ✅ Email 登入
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await signIn(
        formData.email,
        formData.password,
        formData.rememberMe
      )

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please try again.' })
        } else {
          setErrors({ general: error.message })
        }
      } else {
        toast.success('Welcome back!', {
          description: 'You have successfully logged in.',
        })
        // ✅ 導頁交給 session listener
      }
    } catch (err) {
      console.error('Login error:', err)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ ✅ Google / GitHub OAuth（修正 redirect）
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true)

    try {
      const { error } = await signInWithOAuth(provider, window.location.origin)

      if (error) {
        toast.error('Social login failed', {
          description: error.message,
        })
        setIsLoading(false)
      }
    } catch (err) {
      console.error('OAuth login error:', err)
      toast.error('Social login failed')
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    navigate('/forgot-password', { state: { email: formData.email } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {showVerificationAlert && (
          <div className="border border-green-200 bg-green-50 p-4 rounded-lg flex items-start space-x-3">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-green-800 text-sm">
              Your email has been verified successfully. You can now log in.
            </div>
          </div>
        )}

        <div className="text-center">
          <Link to="/" className="inline-block">
            <Logo size={56} showText={false} />
          </Link>
        </div>

        <div className="border shadow-xl bg-white rounded-lg p-6 space-y-4">

          {errors.general && (
            <div className="border border-red-200 bg-red-50 p-4 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-red-800 text-sm">{errors.general}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || loading}
              className="w-full bg-blue-600 text-white p-2 rounded"
            >
              {isLoading || loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              onClick={() => handleOAuthLogin('google')}
              className="border p-2 rounded"
            >
              Google
            </button>

            <button
              onClick={() => handleOAuthLogin('github')}
              className="border p-2 rounded"
            >
              GitHub
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600">
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

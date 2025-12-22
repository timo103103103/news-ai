import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, Github, Check, X } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { toast } from 'sonner'

interface PasswordStrength {
  score: number
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

export default function Signup() {
  const navigate = useNavigate()

  const {
    signUp,
    signInWithOAuth,
    loading,
    error,
    clearError,
    isAuthenticated,
  } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    requirements: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
    },
  })

  /* -------------------------------------------
   * Redirect if already authenticated
   * ----------------------------------------- */
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  /* -------------------------------------------
   * Global auth error handling
   * ----------------------------------------- */
  useEffect(() => {
    if (error) {
      console.error('❌ Signup auth error:', error)
      toast.error(error.message || 'Signup failed')
      clearError()
    }
  }, [error, clearError])

  /* -------------------------------------------
   * Password strength checker
   * ----------------------------------------- */
  useEffect(() => {
    checkPasswordStrength(formData.password)
  }, [formData.password])

  const checkPasswordStrength = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    const score = Object.values(requirements).filter(Boolean).length
    setPasswordStrength({ score, requirements })
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'text-red-600'
    if (passwordStrength.score <= 3) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength.score <= 2) return 'Weak'
    if (passwordStrength.score <= 3) return 'Fair'
    if (passwordStrength.score === 4) return 'Good'
    return 'Strong'
  }

  /* -------------------------------------------
   * Form validation
   * ----------------------------------------- */
  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Password is too weak'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* -------------------------------------------
   * 🔥 EMAIL / PASSWORD SIGNUP (CRITICAL FIX)
   * ----------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return
    if (!validateForm()) return

    try {
      console.log('📝 Signup submit:', formData.email)

      await signUp(formData.email, formData.password)

      console.log('✅ Supabase signUp() resolved')

      toast.success(
        'Account created successfully! Please check your email to verify your account.'
      )

      navigate('/login')
    } catch (err) {
      console.error('❌ Signup failed:', err)
      toast.error('Unable to create account')
    }
  }

  /* -------------------------------------------
   * OAuth signup
   * ----------------------------------------- */
  const handleGoogleSignup = async () => {
    try {
      await signInWithOAuth('google')
    } catch (err) {
      console.error('Google signup error:', err)
    }
  }

  const handleGitHubSignup = async () => {
    try {
      await signInWithOAuth('github')
    } catch (err) {
      console.error('GitHub signup error:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  /* -------------------------------------------
   * UI
   * ----------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-900/70 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800 backdrop-blur-lg">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create your account
            </h2>
            <p className="text-gray-600 dark:text-slate-300">
              Get started with your free account today
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* --- EMAIL --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* --- PASSWORD --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                      Password strength:
                    </span>
                    <span className={`text-sm font-medium ${getPasswordStrengthColor()}`}>
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score <= 2
                          ? 'bg-red-500'
                          : passwordStrength.score <= 3
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-1 mt-3">
                    <PasswordRequirement
                      met={passwordStrength.requirements.minLength}
                      text="At least 8 characters"
                    />
                    <PasswordRequirement
                      met={passwordStrength.requirements.hasUppercase}
                      text="One uppercase letter"
                    />
                    <PasswordRequirement
                      met={passwordStrength.requirements.hasLowercase}
                      text="One lowercase letter"
                    />
                    <PasswordRequirement
                      met={passwordStrength.requirements.hasNumber}
                      text="One number"
                    />
                    <PasswordRequirement
                      met={passwordStrength.requirements.hasSpecialChar}
                      text="One special character"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* --- CONFIRM PASSWORD --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* --- TERMS CHECKBOX --- */}
            <div className="flex items-start">
              <input
                name="termsAccepted"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-600 dark:text-slate-300">
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.terms}
              </p>
            )}

            {/* --- SUBMIT BUTTON --- */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* --- DIVIDER --- */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-900/70 text-gray-500 dark:text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* --- OAUTH BUTTONS --- */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={handleGitHubSignup}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github className="w-5 h-5" />
              GitHub
            </button>
          </div>

          {/* --- LOGIN LINK --- */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------
 * Password Requirement Component
 * ----------------------------------------- */
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-gray-400 dark:text-slate-600" />
      )}
      <span className={met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-500'}>
        {text}
      </span>
    </div>
  )
}
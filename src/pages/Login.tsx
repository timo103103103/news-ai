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
  const { signIn, signInWithOAuth, loading, error, clearError, isAuthenticated } = useAuthStore()
  useEffect(() => {
  const syncSession = async () => {
    const { data } = await supabase.auth.getSession()

    console.log('🔄 Sync session result:', data)

    if (data.session) {
      console.log('✅ Session found, redirecting...')
      navigate('/')
    }
  }

  syncSession()
}, [navigate])

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showVerificationAlert, setShowVerificationAlert] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  // Clear error when component unmounts or location changes
  useEffect(() => {
    clearError()
  }, [location, clearError])

  // Check for verification success message
  useEffect(() => {
    if (location.state?.verificationSuccess) {
      setShowVerificationAlert(true)
      // Clear the state after showing
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
    // Clear field-specific error when user starts typing
    if (errors[field as keyof LoginErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setErrors({})
    
    try {
      const { error } = await signIn(formData.email, formData.password, formData.rememberMe)
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please try again.' })
        } else {
          setErrors({ general: error.message })
        }
      } else {
        toast.success('Welcome back!', {
          description: 'You have successfully logged in.'
        })
        // Navigation is handled by the useEffect above
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
      toast.error('Login failed', {
        description: 'Please try again or contact support if the problem persists.'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    try {
      // ✅ FIXED: Pass redirect URL to OAuth
      const redirectUrl = `${window.location.origin}/auth/callback`
      const { error } = await signInWithOAuth(provider, redirectUrl)
      if (error) {
        toast.error('Social login failed', {
          description: error.message
        })
      }
      // Don't set loading to false here - user will be redirected
    } catch (error) {
      console.error('OAuth login error:', error)
      toast.error('Social login failed', {
        description: 'Please try again or use email login.'
      })
      setIsLoading(false)
    }
  }
  
  const handleForgotPassword = () => {
    navigate('/forgot-password', { state: { email: formData.email } })
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Verification Success Alert */}
        {showVerificationAlert && (
          <div className="border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-4 rounded-lg flex items-start space-x-3">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-green-800 dark:text-green-200 text-sm">
              Your email has been verified successfully. You can now log in.
            </div>
          </div>
        )}
        
        {/* Logo/Brand */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <Logo size={56} showText={false} />
          </Link>
        </div>
        
        <div className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg">
          <div className="space-y-1 text-center p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your credentials to access your account
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 rounded-lg flex items-start space-x-3 animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-red-800 dark:text-red-200 text-sm">{errors.general}</div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 pr-3 py-2 w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isLoading || loading}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    disabled={isLoading || loading}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 py-2 w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isLoading || loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    disabled={isLoading || loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>
              
              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading || loading}
                />
                <label htmlFor="remember-me" className="text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isLoading || loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
            
            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading || loading}
                className="flex items-center justify-center space-x-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Chrome className="h-4 w-4" />
                <span className="text-sm font-medium">Google</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                disabled={isLoading || loading}
                className="flex items-center justify-center space-x-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github className="h-4 w-4" />
                <span className="text-sm font-medium">GitHub</span>
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 text-center border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

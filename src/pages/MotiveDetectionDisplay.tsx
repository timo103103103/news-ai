import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AuthCallback() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 AuthCallback: Starting auth callback handler')
        console.log('🔐 Current URL:', window.location.href)
        
        // Check for hash fragment (OAuth redirect)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const error = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')
        
        console.log('🔐 Hash params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
          error,
          errorDescription 
        })
        
        // Check for OAuth error
        if (error) {
          console.error('🔐 OAuth error:', error, errorDescription)
          toast.error('Login failed', {
            description: errorDescription || error
          })
          navigate('/login')
          return
        }
        
        if (accessToken && refreshToken) {
          console.log('🔐 OAuth flow - setting session with tokens')
          
          // OAuth flow - token in URL hash
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            console.error('🔐 Session error:', sessionError)
            toast.error('Login failed', {
              description: sessionError.message
            })
            navigate('/login')
            return
          }

          if (session) {
            console.log('🔐 Session established:', session.user?.email)
            setSession(session)
            toast.success('Successfully logged in!', {
              description: 'Welcome back!'
            })
            navigate('/')
          } else {
            console.error('🔐 No session created')
            navigate('/login')
          }
        } else {
          console.log('🔐 No OAuth tokens in hash, checking for existing session')
          
          // Regular callback flow - check for existing session
          const { data: { session }, error: getSessionError } = await supabase.auth.getSession()
          
          if (getSessionError) {
            console.error('🔐 Get session error:', getSessionError)
            navigate('/login')
            return
          }

          if (session) {
            console.log('🔐 Existing session found:', session.user?.email)
            setSession(session)
            navigate('/')
          } else {
            console.log('🔐 No session found, redirecting to login')
            navigate('/login')
          }
        }
      } catch (error) {
        console.error('🔐 Auth callback error:', error)
        toast.error('Authentication failed', {
          description: 'Please try again'
        })
        navigate('/login')
      }
    }

    handleAuthCallback()
  }, [navigate, setSession])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
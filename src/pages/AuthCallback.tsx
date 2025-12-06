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
        // Check for hash fragment (OAuth redirect)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        
        if (accessToken) {
          // OAuth flow - token in URL hash
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || ''
          })

          if (error) {
            console.error('Auth callback error:', error)
            toast.error('Login failed', {
              description: error.message
            })
            navigate('/login')
            return
          }

          if (session) {
            setSession(session)
            toast.success('Successfully logged in!', {
              description: 'Welcome back!'
            })
            navigate('/')
          } else {
            navigate('/login')
          }
        } else {
          // Regular callback flow
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Auth callback error:', error)
            navigate('/login')
            return
          }

          if (session) {
            setSession(session)
            navigate('/')
          } else {
            navigate('/login')
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error)
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
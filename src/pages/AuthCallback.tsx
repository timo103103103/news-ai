import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const setSession = useAuthStore((state) => state.setSession)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 AuthCallback: Starting auth callback handler')
        
        // Check for hash fragment (OAuth redirect)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const error = hashParams.get('error')
        
        // Check for OAuth error
        if (error) {
          console.error('🔐 OAuth error:', error)
          navigate('/login')
          return
        }
        
        if (accessToken && refreshToken) {
          console.log('🔐 OAuth flow - setting session with tokens')
          
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            console.error('🔐 Session error:', sessionError)
            navigate('/login')
            return
          }

          if (session?.user) {
            console.log('🔐 Session established:', session.user?.email)
            
            // Fetch user tier from database
            const { data: dbUser } = await supabase
              .from("users")
              .select("plan, billing_cycle, scans_used_this_month, scans_limit")
              .eq("id", session.user.id)
              .single()

            const validTiers = ['free', 'starter', 'pro', 'business']
            const validatedPlan = validTiers.includes(dbUser?.plan) 
              ? dbUser.plan 
              : 'free'

            setSession(session)
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              plan: validatedPlan as 'free' | 'starter' | 'pro' | 'business',
              billingCycle: dbUser?.billing_cycle || null,
              scansUsed: dbUser?.scans_used_this_month ?? 0,
              scansLimit: dbUser?.scans_limit ?? 10,
            })
            
            console.log('✅ Redirecting to home...')
            navigate('/', { replace: true })
          } else {
            navigate('/login')
          }
        } else {
          console.log('🔐 No OAuth tokens, checking existing session')
          
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            console.log('🔐 Existing session found:', session.user?.email)
            
            const { data: dbUser } = await supabase
              .from("users")
              .select("plan, billing_cycle, scans_used_this_month, scans_limit")
              .eq("id", session.user.id)
              .single()

            const validTiers = ['free', 'starter', 'pro', 'business']
            const validatedPlan = validTiers.includes(dbUser?.plan) 
              ? dbUser.plan 
              : 'free'

            setSession(session)
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              plan: validatedPlan as 'free' | 'starter' | 'pro' | 'business',
              billingCycle: dbUser?.billing_cycle || null,
              scansUsed: dbUser?.scans_used_this_month ?? 0,
              scansLimit: dbUser?.scans_limit ?? 10,
            })
            
            navigate('/', { replace: true })
          } else {
            navigate('/login')
          }
        }
      } catch (error) {
        console.error('🔐 Auth callback error:', error)
        navigate('/login')
      }
    }

    handleAuthCallback()
  }, [navigate, setSession, setUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Completing authentication...</p>
      </div>
    </div>
  )
}
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { supabase } from './lib/supabase'
import useAuthStore from './stores/authStore'

function App() {
  const setUser = useAuthStore((s) => s.setUser)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          setUser(null)
          return
        }

        // ✅ Check if user exists in database
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('plan, credits')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.log('⚠️ User not in database, creating...', error.message)
          
          // ✅ Auto-create user in Supabase if not exists
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email || '',
              plan: 'free',
              credits: 10,
              created_at: new Date().toISOString(),
            })

          if (insertError) {
            console.error('❌ Failed to create user:', insertError)
          }

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            plan: 'free',
            credits: 10,
          })
          return
        }

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          plan: dbUser?.plan || 'free',
          credits: dbUser?.credits ?? 0,
        })
      } catch (error) {
        console.error('Auth init error:', error)
        setUser(null)
      }
    }

    initAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setUser(null)
        } else {
          const { data: dbUser, error } = await supabase
            .from('users')
            .select('plan, credits')
            .eq('id', session.user.id)
            .single()

          if (error || !dbUser) {
            // Auto-create if not exists
            await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email || '',
                plan: 'free',
                credits: 10,
                created_at: new Date().toISOString(),
              })

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              plan: 'free',
              credits: 10,
            })
            return
          }

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            plan: dbUser?.plan || 'free',
            credits: dbUser?.credits ?? 0,
          })
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [setUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return <Outlet />
}

export default App
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { toast } from 'sonner'

export default function Logout() {
  const navigate = useNavigate()
  const { signOut, user } = useAuthStore()
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Show loading toast
        toast.loading('Signing you out...', {
          id: 'logout-loading'
        })
        
        // Perform sign out
        const { error } = await signOut()
        
        if (error) {
          toast.error('Logout failed', {
            description: error.message,
            id: 'logout-loading'
          })
          navigate('/')
        } else {
          toast.success('Signed out successfully!', {
            description: 'You have been logged out of your account.',
            id: 'logout-loading'
          })
          
          // Clear any cached data
          sessionStorage.clear()
          localStorage.removeItem('sb-auth-token')
          
          // Redirect to home page after successful logout
          setTimeout(() => {
            navigate('/')
          }, 1500)
        }
      } catch (error) {
        console.error('Logout error:', error)
        toast.error('Logout failed', {
          description: 'An unexpected error occurred. Please try again.',
          id: 'logout-loading'
        })
        navigate('/')
      }
    }
    
    // Only perform logout if user is logged in
    if (user) {
      performLogout()
    } else {
      // If no user, redirect to login
      navigate('/login')
    }
  }, [signOut, navigate, user])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full">
          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Signing you out...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we securely log you out of your account.
        </p>
      </div>
    </div>
  )
}
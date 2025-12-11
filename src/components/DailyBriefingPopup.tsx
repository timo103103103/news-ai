import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'

export default function DailyBriefingPopup() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  const [visible, setVisible] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, [])
  const isValid = emailRegex.test(email)

  useEffect(() => {
    const path = location.pathname
    const allowPaths = ['/', '/analyze', '/news-analysis', '/results']
    const blockPaths = ['/login', '/signup', '/pricing', '/checkout']
    if (!allowPaths.includes(path) || blockPaths.includes(path)) { setVisible(false); return }

    const alreadyDismissed = sessionStorage.getItem('dailyBriefDismissed') === 'true'
    const alreadySubscribedLS = localStorage.getItem('dailyBriefSubscribed') === 'true'
    if (alreadyDismissed || alreadySubscribedLS) { setVisible(false); return }

    const timer = setTimeout(async () => {
      try {
        const { data: auth } = await supabase.auth.getUser()
        const u = auth?.user
        const metaSubscribed = !!(u?.user_metadata as any)?.dailyBriefSubscribed
        if (metaSubscribed) { setVisible(false); return }
        if (u?.email) {
          const { data } = await supabase.from('subscriptions').select('id').eq('email', u.email).limit(1)
          const shouldShow = !(data && data.length > 0)
          setVisible(shouldShow)
          if (shouldShow) setMinimized(sessionStorage.getItem('dailyBriefMinimized') === 'true')
        } else {
          setVisible(true)
          setMinimized(sessionStorage.getItem('dailyBriefMinimized') === 'true')
        }
      } catch {
        setVisible(true)
        setMinimized(sessionStorage.getItem('dailyBriefMinimized') === 'true')
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [location.pathname])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    setError(null)
    if (!isValid) { setError('Please enter a valid email.'); return }
    setLoading(true)
    try {
      const { error: dbError } = await supabase.from('subscriptions').insert({ email, source: 'popup', created_at: new Date().toISOString() })
      if (dbError) throw dbError
      await supabase.auth.updateUser({ data: { dailyBriefSubscribed: true } })
      localStorage.setItem('dailyBriefSubscribed', 'true')
      setToast("You’re subscribed. Welcome to NexVeris Daily.")
      setVisible(false)
      setEmail('')
    } catch (err: any) {
      setError(err?.message || 'Subscription failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <>
      <AnimatePresence>
        {visible && !minimized && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 w-[92vw] max-w-sm md:max-w-md md:w-auto z-[1000]"
            role="dialog"
            aria-labelledby="daily-briefing-title"
          >
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="pr-8">
                    <h3 id="daily-briefing-title" className="text-lg font-bold text-slate-900">Stay Informed. Every Morning.</h3>
                    <p className="mt-1 text-sm text-slate-600">Concise AI-driven briefings on global news and markets with structured signals you can act on.</p>
                    <span className="mt-2 inline-block text-[10px] uppercase tracking-wide text-gray-500">FREE DAILY INTELLIGENCE REPORT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Minimize"
                      className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
                      onClick={() => { setMinimized(true); sessionStorage.setItem('dailyBriefMinimized','true') }}
                    >
                      −
                    </button>
                    <button
                      aria-label="Close"
                      className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
                      onClick={() => { sessionStorage.setItem('dailyBriefDismissed', 'true'); setVisible(false) }}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <ul className="mt-3 list-disc pl-5 space-y-1 text-slate-800 text-sm">
                  <li>PESTLE overview</li>
                  <li>Political motive detection <span className="ml-1 inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5">Premium</span></li>
                  <li>Market impact signals <span className="ml-1 inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5">Premium</span></li>
                  <li>Bias &amp; framing analysis <span className="ml-1 inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5">Premium</span></li>
                </ul>
                <form onSubmit={handleSubmit} className="mt-4" aria-label="Daily briefing signup">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onBlur={() => setTouched(true)}
                        placeholder="Enter your email to subscribe"
                        aria-label="Email address"
                        aria-invalid={touched && !isValid}
                        required
                        className={`w-full pl-9 pr-3 py-2 rounded-md border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${touched && !isValid ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                    <button type="submit" disabled={loading} className="rounded-md bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed">
                      Get Daily Briefing
                    </button>
                  </div>
                  {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
                  <p className="mt-2 text-[11px] text-gray-500">No spam. Unsubscribe anytime. Your email is never shared.</p>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && minimized && (
          <motion.button
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-[1000] rounded-full bg-slate-900 text-white text-xs px-3 py-2 shadow-lg hover:bg-slate-800"
            aria-label="Expand daily briefing"
            onClick={() => { setMinimized(false); sessionStorage.removeItem('dailyBriefMinimized') }}
          >
            Daily Briefing
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-4 left-4 z-[1000]">
            <div className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm shadow-lg">{toast}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

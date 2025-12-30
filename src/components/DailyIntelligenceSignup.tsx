import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Bookmark } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'

type Variant = 'landing' | 'analysis' | 'results'

interface Props {
  variant?: Variant
  className?: string
  onSuccess?: (email: string) => void
}

export default function DailyIntelligenceSignup({ variant = 'landing', className, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, [])
  const isValid = emailRegex.test(email)

  const [illustrationVisible, setIllustrationVisible] = useState(false)
  const illoRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(entries => { if (entries[0].isIntersecting) setIllustrationVisible(true) }, { threshold: 0.2 })
    if (illoRef.current) obs.observe(illoRef.current)
    return () => obs.disconnect()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    setError(null)
    setSuccess(null)
    if (!isValid) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    const { error: dbError } = await supabase.from('subscriptions').insert({ email, source: variant, created_at: new Date().toISOString() })
    setLoading(false)
    if (dbError) { setError('Subscription failed. Please try again.'); return }
    setSuccess('You are subscribed. Check your inbox tomorrow morning.')
    onSuccess?.(email)
    setEmail('')
  }

  const showIllustration = variant !== 'results'

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full bg-white shadow-sm border border-gray-200 rounded-lg ${className ?? ''}`}
    >
      <div className="p-6 md:p-8 max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-white">Stay Informed. Every Morning.</h2>
          <p className="mt-2 text-sm md:text-base text-gray-700 dark:text-slate-300 font-sans">Concise AI-driven briefings on global news and markets with structured signals you can act on.</p>
          <span className="mt-4 inline-block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">FREE DAILY INTELLIGENCE REPORT</span>
          <ul className="mt-4 list-disc pl-5 space-y-2 text-gray-800 dark:text-slate-200">
            <li>PESTLE overview</li>
            <li>
              Political motive detection
              <Link to="/pricing" className="ml-2 inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Premium feature – view pricing" title="View pricing">
                <Bookmark className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                Premium
              </Link>
            </li>
            <li>
              Market impact signals
              <Link to="/pricing" className="ml-2 inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Premium feature – view pricing" title="View pricing">
                <Bookmark className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                Premium
              </Link>
            </li>
            <li>
              Bias &amp; framing analysis
              <Link to="/pricing" className="ml-2 inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Premium feature – view pricing" title="View pricing">
                <Bookmark className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                Premium
              </Link>
            </li>
          </ul>
          <form onSubmit={handleSubmit} className="mt-6" aria-label="Daily intelligence signup">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-400" aria-hidden="true" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="Enter your email to subscribe"
                  aria-label="Email address"
                  aria-invalid={touched && !isValid}
                  aria-describedby="email-help"
                  required
                  className={`w-full pl-10 pr-3 py-2 rounded-md border text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 dark:bg-slate-800 ${touched && !isValid ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'}`}
                />
              </div>
              <button type="submit" disabled={loading} className="rounded-md bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed">
                Get Daily Briefing
              </button>
            </div>
            <p id="email-help" className="mt-2 text-xs text-gray-500 dark:text-gray-400">No spam. Unsubscribe anytime. Your email is never shared.</p>
            <AnimatePresence>
              {error && (
                <motion.p role="alert" aria-live="polite" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="mt-2 text-sm text-red-600">{error}</motion.p>
              )}
              {success && (
                <motion.p role="alert" aria-live="polite" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="mt-2 text-sm text-green-700">{success}</motion.p>
              )}
            </AnimatePresence>
          </form>
        </div>


      </div>
    </motion.section>
  )
}

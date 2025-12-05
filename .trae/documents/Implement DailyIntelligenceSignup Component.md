## Component Overview
- Add `src/components/DailyIntelligenceSignup.tsx` as a functional React component in TypeScript.
- Styling with Tailwind CSS using white/off-white/soft gray backgrounds, thin separators, and subtle shadows.
- Typography: headings `font-serif` (Georgia-like), body `font-sans` (Inter-like via global import).
- Animations: Framer Motion fade-in + slide-up on mount; smooth presence transitions for success/error.
- Form: email validation, loading, Supabase insert into `subscriptions`, error handling, success message.
- Accessibility: labeled controls, ARIA attributes, keyboard-friendly form.
- Responsive: mobile single column; tablet 60/40; desktop 50/50 with right illustration hidden on mobile.

## File Structure & Dependencies
- Create `src/components/DailyIntelligenceSignup.tsx` and keep the editorial SVG inline in the same file to avoid extra assets and enable easy lazy rendering.
- Use existing `framer-motion` and `lucide-react`.
- Use existing Supabase client from `@/lib/supabase`.

## Implementation Details
- Props: `variant?: 'landing' | 'analysis' | 'results'` (affects spacing and illustration visibility), `className?: string`, `onSuccess?: (email: string) => void`.
- State: `email`, `error`, `success`, `loading`, `touched`.
- Validation: `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` on input and submit.
- Supabase: `await supabase.from('subscriptions').insert({ email, source: variant ?? 'landing', created_at: new Date().toISOString() })` with error guard.
- Animation: `motion.section` with `{ opacity: 0, y: 12 } → { opacity: 1, y: 0 }`; `AnimatePresence` for feedback messages.
- Illustration: inline SVG with muted grays and blues, wrapped in a container rendered only on `md` and above; mount gated by intersection observer for lazy render.

## Tailwind Layout & Styles
- Container: `w-full bg-white md:bg-off-white shadow-sm border border-gray-200 rounded-lg` with `p-6 md:p-8` and `max-w-7xl mx-auto`.
- Grid: `grid grid-cols-1 md:grid-cols-[3fr_2fr] lg:grid-cols-2 gap-8`.
- Headline: `text-2xl md:text-3xl font-serif text-gray-900`.
- Subheadline: `mt-2 text-sm md:text-base text-gray-700 font-sans`.
- Label tag: `mt-4 inline-block text-xs uppercase tracking-wide text-gray-500`.
- Bullets: `mt-4 space-y-2 text-gray-800` with `list-disc pl-5`.
- Email input row: `mt-6 flex items-center gap-3` with `rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900`.
- Button: `rounded-md bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed`.
- Legal text: `mt-3 text-xs text-gray-500`.

## Accessibility
- `<form>` with submit via Enter; input `type="email"` with `aria-label`, `aria-invalid`, `aria-describedby`.
- Feedback messages use `role="alert"` and `aria-live="polite"`.
- Icon has `aria-hidden="true"`.
- Sufficient contrast by using `text-gray-900` on light backgrounds and `bg-gray-900` for CTA.

## Code Outline
```tsx
import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Variant = 'landing' | 'analysis' | 'results'

interface Props { variant?: Variant; className?: string; onSuccess?: (email: string) => void }

export default function DailyIntelligenceSignup({ variant = 'landing', className, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, [])
  const [illustrationVisible, setIllustrationVisible] = useState(false)
  const illoRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(entries => { if (entries[0].isIntersecting) setIllustrationVisible(true) }, { threshold: 0.2 })
    if (illoRef.current) obs.observe(illoRef.current)
    return () => obs.disconnect()
  }, [])
  const isValid = emailRegex.test(email)
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
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`w-full bg-white shadow-sm border border-gray-200 rounded-lg ${className ?? ''}`}>
      <div className="p-6 md:p-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[3fr_2fr] lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900">Stay Informed. Every Morning.</h2>
          <p className="mt-2 text-sm md:text-base text-gray-700 font-sans">Concise AI-driven briefings on global news and markets with structured signals you can act on.</p>
          <span className="mt-4 inline-block text-xs uppercase tracking-wide text-gray-500">FREE DAILY INTELLIGENCE REPORT</span>
          <ul className="mt-4 list-disc pl-5 space-y-2 text-gray-800">
            <li>PESTLE overview</li>
            <li>Political motive detection</li>
            <li>Market impact signals</li>
            <li>Bias & framing analysis</li>
          </ul>
          <form onSubmit={handleSubmit} className="mt-6" aria-label="Daily intelligence signup">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={() => setTouched(true)} placeholder="Enter your email to subscribe" aria-label="Email address" aria-invalid={touched && !isValid} aria-describedby="email-help" required className={`w-full pl-10 pr-3 py-2 rounded-md border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${touched && !isValid ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              <button type="submit" disabled={loading} className="rounded-md bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 font-medium">Get Daily Briefing</button>
            </div>
            <p id="email-help" className="mt-2 text-xs text-gray-500">No spam. Unsubscribe anytime. Your email is never shared.</p>
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
        {variant !== 'results' && (
          <div ref={illoRef} className="hidden md:block">
            {illustrationVisible && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-soft-gray rounded-md border border-gray-200 p-4">
                <svg viewBox="0 0 400 260" className="w-full h-auto" aria-hidden="true">
                  <rect x="16" y="20" width="368" height="220" rx="8" fill="#FAFAFA" stroke="#E5E7EB" />
                  <rect x="32" y="40" width="240" height="16" rx="2" fill="#E5E7EB" />
                  <rect x="32" y="64" width="320" height="12" rx="2" fill="#E5E7EB" />
                  <rect x="32" y="84" width="320" height="12" rx="2" fill="#E5E7EB" />
                  <rect x="32" y="104" width="320" height="12" rx="2" fill="#E5E7EB" />
                  <rect x="32" y="132" width="164" height="100" rx="6" fill="#F5F5F5" stroke="#E5E7EB" />
                  <polyline points="36,220 64,196 92,204 120,184 148,190 176,172" fill="none" stroke="#94A3B8" strokeWidth="2" />
                  <rect x="210" y="132" width="142" height="100" rx="6" fill="#F5F5F5" stroke="#E5E7EB" />
                  <rect x="220" y="142" width="42" height="8" rx="2" fill="#E5E7EB" />
                  <rect x="220" y="156" width="100" height="8" rx="2" fill="#E5E7EB" />
                  <rect x="220" y="170" width="100" height="8" rx="2" fill="#E5E7EB" />
                  <rect x="220" y="186" width="82" height="8" rx="2" fill="#E5E7EB" />
                </svg>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  )
}
```

## Integration Points
- Landing Page (`src/pages/NewsIntelligenceLanding.tsx` or `src/pages/Home.tsx`): import and render below hero in a full-width container.
```tsx
import DailyIntelligenceSignup from '@/components/DailyIntelligenceSignup'

<DailyIntelligenceSignup variant="landing" />
```
- Analysis Input Page (`src/pages/NewsAnalysis.tsx`): render under the "Start Analysis" button.
```tsx
<DailyIntelligenceSignup variant="analysis" />
```
- Results Page (`src/pages/AnalysisResultPage.tsx`): render near footer with illustration removed.
```tsx
<DailyIntelligenceSignup variant="results" />
```

## Quality Assurance
- Cross-browser: verify Chrome, Firefox, Safari.
- Mobile: verify 320–768px; confirm stacking and tap targets.
- Tests: add `src/__tests__/DailyIntelligenceSignup.test.tsx` using Vitest + Testing Library; mock Supabase insert success and failure; validate error, success, and loading states; validate ARIA attributes.
- Performance: illustration gated by intersection observer; SVG container uses simple shapes; Framer Motion transitions are lightweight.

## After Approval
- Implement the component file and tests.
- Wire into target pages in the indicated positions.
- Run dev server, manual QA pass, and test suite.
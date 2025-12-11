import { useEffect, useState } from 'react'
import useAuthStore from '@/stores/authStore'
import DailyIntelligenceSignup from '@/components/DailyIntelligenceSignup'
import { supabase } from '@/lib/supabase'

export default function FloatingDailySignup() {
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const run = async () => {
      const dismissed = typeof window !== 'undefined' ? localStorage.getItem('dailySignupDismissed') === 'true' : false
      if (dismissed) { setOpen(false); return }
      if (user?.email) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('email', user.email)
          .limit(1)
        if (error) { setOpen(true); return }
        setOpen(!(data && data.length > 0))
      } else {
        setOpen(true)
      }
    }
    run()
  }, [user])

  if (!open) return null

  return (
    <div className="fixed bottom-4 right-4 z-[1000] max-w-sm w-[22rem]">
      <div className="relative rounded-xl border border-slate-200 bg-white shadow-xl">
        <button
          aria-label="Close daily briefing"
          className="absolute top-2 right-2 rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
          onClick={() => { localStorage.setItem('dailySignupDismissed', 'true'); setOpen(false) }}
        >
          ×
        </button>
        <div className="p-4">
          <h3 className="text-base font-bold text-slate-900 mb-1">Free Daily Intelligence</h3>
          <p className="text-xs text-slate-600 mb-3">Concise AI-driven briefings each morning. Unsubscribe anytime.</p>
          <DailyIntelligenceSignup variant="analysis" className="border-0 shadow-none" />
        </div>
      </div>
    </div>
  )
}

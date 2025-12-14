import { useEffect, useState } from 'react'
import { ShieldCheck, Settings } from 'lucide-react'

type ConsentStatus = 'accepted' | 'rejected' | null

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    try {
      const status = localStorage.getItem('cookieConsent') as ConsentStatus
      const settings = localStorage.getItem('cookieConsentSettings')
      if (!status) {
        if (settings) {
          const s = JSON.parse(settings)
          setAnalytics(!!s.analytics)
          setMarketing(!!s.marketing)
        }
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const storeConsent = (status: ConsentStatus) => {
    localStorage.setItem('cookieConsent', status || '')
    localStorage.setItem('cookieConsentSettings', JSON.stringify({ analytics, marketing }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[1100]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Cookie consent</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  We use cookies to improve performance and remember preferences. Read our
                  <a href="/privacy" className="ml-1 text-indigo-600 dark:text-indigo-300 underline">Privacy Policy</a>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded((e) => !e)}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                aria-expanded={expanded}
              >
                <Settings className="w-4 h-4" /> Cookie Settings
              </button>
              <button
                onClick={() => { setAnalytics(false); setMarketing(false); storeConsent('rejected') }}
                className="px-3 py-2 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Reject All
              </button>
              <button
                onClick={() => { setAnalytics(true); setMarketing(true); storeConsent('accepted') }}
                className="px-3 py-2 text-xs font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Accept All
              </button>
            </div>
          </div>

          {expanded && (
            <div className="px-4 pb-4">
              <div className="grid sm:grid-cols-2 gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/40">
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked disabled className="mt-1" />
                  <span className="text-slate-700 dark:text-slate-200">Essential cookies (required)</span>
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1" />
                  <span className="text-slate-700 dark:text-slate-200">Analytics cookies</span>
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1" />
                  <span className="text-slate-700 dark:text-slate-200">Marketing cookies</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => storeConsent('accepted')}
                    className="px-3 py-2 text-xs font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setExpanded(false)}
                    className="px-3 py-2 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


import { Outlet } from 'react-router-dom'
import Header from './Header'
import DailyBriefingPopup from './DailyBriefingPopup'
import CookieConsentBanner from './CookieConsentBanner'

export default function Layout() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-gray-950 dark:text-slate-100 selection:bg-neonCyan selection:text-gray-900 transition-colors">
      <Header />
      <DailyBriefingPopup />
      <CookieConsentBanner />
      <main className="pt-4 min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  )
}

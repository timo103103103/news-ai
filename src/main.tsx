import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HelmetProvider } from "react-helmet-async"
import App from "./App"
import "./index.css"

// 🔐 DEV-ONLY helpers (for F12 console debugging)
import { supabase } from "./lib/supabase"
import useAuthStore from "./stores/authStore"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

// ===============================
// 🔓 Expose helpers in DEV only
// ===============================
if (import.meta.env.DEV) {
  ;(window as any).supabase = supabase
  ;(window as any).authStore = useAuthStore

  // optional sugar helpers
  ;(window as any).setTier = (plan: string) =>
    useAuthStore.setState((s) => ({
      user: s.user
        ? {
            ...s.user,
            plan,
          }
        : null,
    }))

  console.log("🛠 DEV helpers exposed:")
  console.log("→ window.supabase")
  console.log("→ window.authStore")
  console.log("→ window.setTier('free' | 'starter' | 'pro' | 'business')")
}

createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
)

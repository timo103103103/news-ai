import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ✅ 環境變數安全檢查（開發時就直接爆錯，不讓你踩雷）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'exists' : 'missing')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// ✅ 全站唯一 Supabase Client（關鍵：避免 Multiple Instances）
let supabase: SupabaseClient

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  if (!(window as any).__supabase) {
    (window as any).__supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'sb-nexveris-auth', // ✅ 固定 key，避免多 Client 衝突
        },
      }
    )
    console.log('✅ Supabase client initialized')
  }
  supabase = (window as any).__supabase as SupabaseClient
} else {
  // Server-side rendering fallback (for build time)
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export { supabase }
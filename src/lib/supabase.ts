import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ✅ 環境變數安全檢查（開發時就直接爆錯，不讓你踩雷）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey)
  throw new Error('Missing Supabase environment variables')
}

// ✅ 全站唯一 Supabase Client（關鍵：避免 Multiple Instances）
let supabase: SupabaseClient

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
}

supabase = (window as any).__supabase as SupabaseClient

export { supabase }

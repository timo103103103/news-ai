import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zgiwqbpalykrztvvekcg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaXdxYnBhbHlrcnp0dnZla2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyODkzMjYsImV4cCI6MjA3ODg2NTMyNn0.5IZUMcthWc9QTUJihd8-0785PLCk3v9zfyjxAFun7Cw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface AuthError {
  message: string
  status?: number
}
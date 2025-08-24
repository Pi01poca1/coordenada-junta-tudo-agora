import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/supabase'

// Valores padrão (fallback)
const DEFAULT_URL = 'https://rfxrguxoqnspsrqzzwlc.supabase.co'
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmeHJndXhvcW5zcHNycXp6d2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjUwNTIsImV4cCI6MjA2ODU0MTA1Mn0.PJ5jrYu6eXVuaVVel8fJTqRsn9FFWYMTJw2q1u1y8fc'

// Usar variáveis de ambiente ou fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY

// Verificação final
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Supabase: URL ou KEY não configuradas!')
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
})
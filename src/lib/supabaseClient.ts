import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Debug: log env var status (safe - only shows if defined, not the actual values)
console.log('[Supabase] URL defined:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('[Supabase] Key defined:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'CRITICAL: Missing Supabase env vars. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel Environment Variables for the Production environment, then redeploy.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
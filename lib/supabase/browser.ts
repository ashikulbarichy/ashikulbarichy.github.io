'use client'

import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config'

/**
 * Browser client — used only by the login form to exchange an email and
 * password for a session. It holds the anon key, which by design can read
 * nothing: every analytics table has RLS enabled with no anon policy.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config'

/**
 * Supabase client for server components and route handlers.
 *
 * Uses the ANON key plus the signed-in user's cookie session, so every read is
 * subject to RLS and the `admins` allowlist. This is the client the dashboard
 * uses — deliberately not the service-role one, so a bug in a query cannot
 * expose more than the policies allow.
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Middleware refreshes the session instead, so this is safe to skip.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {
          // See above.
        }
      },
    },
  })
}

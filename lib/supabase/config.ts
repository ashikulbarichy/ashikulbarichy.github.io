/**
 * Supabase configuration.
 *
 * Three keys, three very different privilege levels — worth being explicit
 * about which is which, because mixing them up is the one mistake here that
 * actually leaks data:
 *
 *   NEXT_PUBLIC_SUPABASE_URL       public, safe in the browser
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  public, safe in the browser. Every table
 *                                  has RLS on with no anon read policy, so
 *                                  this key can read nothing.
 *   SUPABASE_SERVICE_ROLE_KEY      SERVER ONLY. Bypasses RLS entirely.
 *                                  Never NEXT_PUBLIC_. Never imported into a
 *                                  client component.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/** Where the dashboard lives. Excluded from analytics, robots and the sitemap. */
export const SAM_BASE_PATH = '/sam'
export const SAM_LOGIN_PATH = '/sam/login'

/**
 * Only this address may read the dashboard, on top of Supabase auth and the
 * `admins` table. Defence in depth: a valid session for some other account
 * still gets refused. Leave unset to rely on the `admins` table alone.
 */
export const SAM_ALLOWED_EMAIL = (process.env.SAM_ALLOWED_EMAIL ?? '').trim().toLowerCase()

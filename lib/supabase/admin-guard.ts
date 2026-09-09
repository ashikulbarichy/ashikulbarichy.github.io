import { redirect } from 'next/navigation'
import { createClient } from './server'
import { SAM_ALLOWED_EMAIL, SAM_LOGIN_PATH } from './config'

/**
 * Server-side gate for every /sam page.
 *
 * Middleware already redirects visitors without a session, but middleware is
 * the wrong place to be the only check: it is easy to break with a matcher
 * change, and it cannot see the `admins` table. So each page calls this too.
 *
 * Three conditions, all required:
 *   1. a valid Supabase session (revalidated, not just a cookie)
 *   2. the email matches SAM_ALLOWED_EMAIL, when that is configured
 *   3. the user is in the `admins` table — enforced by RLS on every read
 */
export async function requireAdmin() {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) redirect(SAM_LOGIN_PATH)

  const email = (user.email ?? '').toLowerCase()

  if (SAM_ALLOWED_EMAIL && email !== SAM_ALLOWED_EMAIL) {
    // Authenticated, but not the owner. Sign them out so a wrong account does
    // not sit there holding a session against the dashboard.
    await supabase.auth.signOut()
    redirect(`${SAM_LOGIN_PATH}?error=not_allowed`)
  }

  // RLS makes this the authoritative check: a non-admin reads zero rows.
  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) {
    redirect(`${SAM_LOGIN_PATH}?error=not_admin`)
  }

  return { supabase, user }
}

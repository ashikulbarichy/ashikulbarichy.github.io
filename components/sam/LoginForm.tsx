'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

/**
 * Login for /sam.
 *
 * Email and password only. There is no signup link and no password-reset flow
 * on purpose: signups are disabled in the Supabase dashboard and there is
 * exactly one account, created by hand. Anything self-service here would be a
 * way in.
 */

const ERRORS: Record<string, string> = {
  not_configured: 'Supabase is not configured on this deployment.',
  not_allowed: 'That account is not permitted to view this dashboard.',
  not_admin: 'That account is authenticated but not on the admin allowlist.',
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(
    ERRORS[searchParams.get('error') ?? ''] ?? null
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      // Deliberately vague: distinguishing "wrong password" from "no such user"
      // tells an attacker which addresses exist.
      setError('Sign in failed. Check the email and password.')
      setPending(false)
      return
    }

    const next = searchParams.get('next')
    router.replace(next && next.startsWith('/sam') ? next : '/sam')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="font-garamond text-4xl font-medium tracking-tighter text-white">sam</h1>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            Site analytics &amp; monitoring
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-white outline-none transition-colors focus:border-zinc-600"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-white outline-none transition-colors focus:border-zinc-600"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-sm border border-red-900/50 bg-red-950/30 px-3 py-2 font-mono text-xs text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-sm border border-zinc-700 bg-zinc-900 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-200 transition-colors hover:border-white hover:text-white disabled:opacity-50"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

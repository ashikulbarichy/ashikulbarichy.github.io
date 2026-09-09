'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export default function SignOutButton() {
  const router = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/sam/login')
    router.refresh()
  }

  return (
    <button
      onClick={signOut}
      className="border-b border-zinc-800 pb-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:border-white hover:text-white"
    >
      Sign out
    </button>
  )
}

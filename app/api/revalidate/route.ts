import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import { TAGS } from '@/lib/sanity/queries'

/**
 * Sanity webhook -> cache revalidation.
 *
 * Publishing in the Studio POSTs here, this invalidates the cache tags for the
 * document type that changed, and the affected pages regenerate on the next
 * request. No redeploy, no build.
 *
 * Setup (Sanity Studio -> API -> Webhooks -> Create webhook):
 *
 *   Name        Revalidate site
 *   URL         https://www.ashikulbari.com/api/revalidate
 *   Dataset     production
 *   Trigger on  Create, Update, Delete
 *   Filter      _type in ["identity","siteSettings","uiText","hero","menu","aboutSlide","project","faq"]
 *   Projection  {_type, "slug": slug.current}
 *   HTTP method POST
 *   API version v2023-05-03
 *   Secret      <generate one, then set it as SANITY_REVALIDATE_SECRET in Vercel>
 *
 * The secret is not optional. Without it anyone who finds this URL can force
 * cache churn on the site, so an unsigned request is rejected.
 */

const KNOWN_TYPES = new Set<string>(Object.values(TAGS))

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET

  if (!secret) {
    console.error('[revalidate] SANITY_REVALIDATE_SECRET is not set')
    return NextResponse.json(
      { revalidated: false, message: 'Server is missing SANITY_REVALIDATE_SECRET' },
      { status: 500 }
    )
  }

  const body = await req.text()
  const signature = req.headers.get(SIGNATURE_HEADER_NAME)

  if (!signature) {
    return NextResponse.json(
      { revalidated: false, message: 'Missing signature header' },
      { status: 401 }
    )
  }

  if (!(await isValidSignature(body, signature, secret))) {
    return NextResponse.json(
      { revalidated: false, message: 'Invalid signature' },
      { status: 401 }
    )
  }

  let payload: { _type?: string; slug?: string } = {}
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ revalidated: false, message: 'Malformed JSON' }, { status: 400 })
  }

  const docType = payload._type
  const tags = new Set<string>([TAGS.all])

  if (docType && KNOWN_TYPES.has(docType)) {
    tags.add(docType)
  } else if (docType) {
    // Unrecognised type: the broad tag above still refreshes everything, so a
    // new document type added in Sanity does not silently stop propagating.
    console.warn(`[revalidate] unknown _type "${docType}", falling back to full revalidation`)
  }

  for (const tag of tags) revalidateTag(tag)

  return NextResponse.json({
    revalidated: true,
    tags: [...tags],
    type: docType ?? null,
    slug: payload.slug ?? null,
    now: Date.now(),
  })
}

/** Convenience probe: confirms the route is deployed and the secret is set. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(process.env.SANITY_REVALIDATE_SECRET),
    message:
      'POST a signed Sanity webhook here. GET only reports whether the secret is configured.',
  })
}

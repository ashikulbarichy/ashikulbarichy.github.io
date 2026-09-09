/**
 * Request classification: bots, referrers, and the daily visitor hash.
 *
 * Runs in the Edge runtime, so everything here is Web-standard only — no
 * node:crypto, no Buffer.
 */

/**
 * Crawlers we care about, most specific first.
 *
 * The AI ones are the point of this whole panel: the site invites them in
 * robots.txt, and this is how you find out whether they actually came. Order
 * matters — 'Claude-SearchBot' must be tested before 'ClaudeBot' would match
 * a substring, so the list is checked in sequence.
 */
const BOT_PATTERNS: [pattern: RegExp, name: string, isAi: boolean][] = [
  // ── AI / LLM crawlers ────────────────────────────────────────
  [/GPTBot/i, 'GPTBot (OpenAI)', true],
  [/OAI-SearchBot/i, 'OAI-SearchBot (OpenAI)', true],
  [/ChatGPT-User/i, 'ChatGPT-User (OpenAI)', true],
  [/Claude-SearchBot/i, 'Claude-SearchBot (Anthropic)', true],
  [/Claude-User/i, 'Claude-User (Anthropic)', true],
  [/ClaudeBot/i, 'ClaudeBot (Anthropic)', true],
  [/anthropic-ai/i, 'anthropic-ai (Anthropic)', true],
  [/PerplexityBot/i, 'PerplexityBot', true],
  [/Perplexity-User/i, 'Perplexity-User', true],
  [/Google-Extended/i, 'Google-Extended (Gemini)', true],
  [/Applebot-Extended/i, 'Applebot-Extended', true],
  [/meta-externalagent/i, 'meta-externalagent (Meta AI)', true],
  [/CCBot/i, 'CCBot (Common Crawl)', true],
  [/cohere-ai/i, 'cohere-ai', true],
  [/YouBot/i, 'YouBot', true],
  [/Bytespider/i, 'Bytespider (ByteDance)', true],
  [/Amazonbot/i, 'Amazonbot', true],
  [/Diffbot/i, 'Diffbot', true],

  // ── Conventional search engines ──────────────────────────────
  [/Googlebot-Image/i, 'Googlebot-Image', false],
  [/Googlebot/i, 'Googlebot', false],
  [/AdsBot-Google/i, 'AdsBot-Google', false],
  [/bingbot/i, 'Bingbot', false],
  [/Slurp/i, 'Yahoo Slurp', false],
  [/DuckDuckBot/i, 'DuckDuckBot', false],
  [/YandexBot/i, 'YandexBot', false],
  [/Baiduspider/i, 'Baiduspider', false],
  [/Applebot/i, 'Applebot', false],

  // ── Social preview fetchers ──────────────────────────────────
  [/LinkedInBot/i, 'LinkedInBot', false],
  [/facebookexternalhit/i, 'facebookexternalhit', false],
  [/Twitterbot/i, 'Twitterbot', false],
  [/Slackbot/i, 'Slackbot', false],
  [/WhatsApp/i, 'WhatsApp', false],
  [/TelegramBot/i, 'TelegramBot', false],
  [/Discordbot/i, 'Discordbot', false],

  // ── Monitoring / infrastructure ──────────────────────────────
  [/Vercelbot|vercel-screenshot|vercel-favicon/i, 'Vercel', false],
  [/Lighthouse|Chrome-Lighthouse/i, 'Lighthouse', false],
  [/UptimeRobot|Pingdom|StatusCake/i, 'Uptime monitor', false],
  [/curl|wget|python-requests|node-fetch|axios|Go-http-client|okhttp/i, 'Script / CLI', false],

  // Generic catch-all, last.
  [/bot|crawler|spider|crawl|slurp|fetcher|scraper|headless/i, 'Other bot', false],
]

export interface BotInfo {
  isBot: boolean
  botName: string | null
  isAiCrawler: boolean
}

export function classifyBot(userAgent: string | null | undefined): BotInfo {
  if (!userAgent) {
    // A document request with no UA is not a browser.
    return { isBot: true, botName: 'Unknown (no user-agent)', isAiCrawler: false }
  }
  for (const [pattern, name, isAi] of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return { isBot: true, botName: name, isAiCrawler: isAi }
    }
  }
  return { isBot: false, botName: null, isAiCrawler: false }
}

// ---------------------------------------------------------------------------
// Referrers
// ---------------------------------------------------------------------------

export type ReferrerGroup = 'direct' | 'search' | 'ai_assistant' | 'social' | 'other'

/**
 * AI assistants that pass a Referer when a human clicks through from a chat.
 * These are the rows that tell you an assistant recommended you to a person —
 * distinct from the crawler hits above, which are machines reading the site.
 */
const AI_ASSISTANT_HOSTS: [match: RegExp, label: string][] = [
  [/(^|\.)chatgpt\.com$/i, 'ChatGPT'],
  [/(^|\.)chat\.openai\.com$/i, 'ChatGPT'],
  [/(^|\.)openai\.com$/i, 'OpenAI'],
  [/(^|\.)perplexity\.ai$/i, 'Perplexity'],
  [/(^|\.)claude\.ai$/i, 'Claude'],
  [/(^|\.)copilot\.microsoft\.com$/i, 'Microsoft Copilot'],
  [/(^|\.)gemini\.google\.com$/i, 'Gemini'],
  [/(^|\.)bard\.google\.com$/i, 'Gemini'],
  [/(^|\.)you\.com$/i, 'You.com'],
  [/(^|\.)phind\.com$/i, 'Phind'],
  [/(^|\.)poe\.com$/i, 'Poe'],
]

const SEARCH_HOSTS: [match: RegExp, label: string][] = [
  [/(^|\.)google\./i, 'Google'],
  [/(^|\.)bing\.com$/i, 'Bing'],
  [/(^|\.)duckduckgo\.com$/i, 'DuckDuckGo'],
  [/(^|\.)search\.yahoo\./i, 'Yahoo'],
  [/(^|\.)yandex\./i, 'Yandex'],
  [/(^|\.)baidu\.com$/i, 'Baidu'],
  [/(^|\.)ecosia\.org$/i, 'Ecosia'],
  [/(^|\.)brave\.com$/i, 'Brave Search'],
  [/(^|\.)startpage\.com$/i, 'Startpage'],
]

const SOCIAL_HOSTS: [match: RegExp, label: string][] = [
  [/(^|\.)linkedin\.com$/i, 'LinkedIn'],
  [/(^|\.)lnkd\.in$/i, 'LinkedIn'],
  [/(^|\.)github\.com$/i, 'GitHub'],
  [/(^|\.)(twitter|x)\.com$/i, 'X'],
  [/(^|\.)t\.co$/i, 'X'],
  [/(^|\.)facebook\.com$/i, 'Facebook'],
  [/(^|\.)reddit\.com$/i, 'Reddit'],
  [/(^|\.)news\.ycombinator\.com$/i, 'Hacker News'],
  [/(^|\.)dev\.to$/i, 'DEV'],
  [/(^|\.)medium\.com$/i, 'Medium'],
  [/(^|\.)stackoverflow\.com$/i, 'Stack Overflow'],
  [/(^|\.)instagram\.com$/i, 'Instagram'],
  [/(^|\.)youtube\.com$/i, 'YouTube'],
  [/(^|\.)t\.me$/i, 'Telegram'],
  [/(^|\.)wa\.me$/i, 'WhatsApp'],
]

export interface ReferrerInfo {
  group: ReferrerGroup
  source: string
  raw: string | null
}

export function classifyReferrer(
  referrer: string | null | undefined,
  selfHost: string
): ReferrerInfo {
  if (!referrer) return { group: 'direct', source: 'Direct', raw: null }

  let host: string
  try {
    host = new URL(referrer).hostname.replace(/^www\./, '')
  } catch {
    return { group: 'other', source: 'Unknown', raw: referrer }
  }

  // Internal navigation is not an acquisition source.
  const self = selfHost.replace(/^www\./, '')
  if (host === self) return { group: 'direct', source: 'Direct', raw: null }

  for (const [match, label] of AI_ASSISTANT_HOSTS) {
    if (match.test(host)) return { group: 'ai_assistant', source: label, raw: referrer }
  }
  for (const [match, label] of SEARCH_HOSTS) {
    if (match.test(host)) return { group: 'search', source: label, raw: referrer }
  }
  for (const [match, label] of SOCIAL_HOSTS) {
    if (match.test(host)) return { group: 'social', source: label, raw: referrer }
  }
  return { group: 'other', source: host, raw: referrer }
}

// ---------------------------------------------------------------------------
// Visitor hash
// ---------------------------------------------------------------------------

/**
 * A daily-rotating, non-reversible visitor identifier.
 *
 * SHA-256 over (salt + ip + user-agent + today's UTC date). The date in the
 * input is what makes it rotate every 24 hours, which is why the site needs no
 * cookie and therefore no consent banner. The tradeoff, stated plainly: the
 * same person visiting tomorrow counts as a new visitor.
 *
 * The raw IP is used only to compute this and is never stored or logged.
 */
export async function visitorHash(
  ip: string | null | undefined,
  userAgent: string | null | undefined,
  salt: string
): Promise<string | null> {
  if (!ip && !userAgent) return null
  const day = new Date().toISOString().slice(0, 10) // YYYY-MM-DD, UTC
  const input = `${salt}|${ip ?? ''}|${userAgent ?? ''}|${day}`
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}

// ---------------------------------------------------------------------------
// Paths we never record
// ---------------------------------------------------------------------------

const IGNORED_PREFIXES = [
  '/sam', // the dashboard itself — otherwise you are your own top visitor
  '/api',
  '/_next',
  '/static',
]

const IGNORED_EXACT = new Set([
  '/favicon.ico',
  '/favicon.png',
  '/favicon.svg',
  '/apple-touch-icon.png',
])

/** True when the path is an asset, an API call, or the dashboard. */
export function isIgnoredPath(pathname: string): boolean {
  if (IGNORED_EXACT.has(pathname)) return true
  if (IGNORED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true
  // Any path with a file extension is an asset, except the SEO text routes,
  // which are real pages worth knowing about — especially /llms.txt, since a
  // crawler fetching it is the clearest signal the AI-SEO work is working.
  if (/\.[a-z0-9]{2,5}$/i.test(pathname)) {
    return !['/llms.txt', '/humans.txt', '/robots.txt', '/sitemap.xml'].includes(pathname)
  }
  return false
}

/** Normalise a device type from the UA parser into our four buckets. */
export function normaliseDeviceType(raw: string | undefined): string {
  if (!raw) return 'desktop' // ua-parser omits `type` for desktop browsers
  if (raw === 'mobile' || raw === 'tablet') return raw
  if (raw === 'console' || raw === 'smarttv' || raw === 'wearable' || raw === 'embedded') {
    return 'other'
  }
  return 'desktop'
}

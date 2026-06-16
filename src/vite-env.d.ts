/// <reference types="vite/client" />

// ─── Google Analytics (GA4) global types ─────────────────────────────────────
interface ImportMetaEnv {
  readonly VITE_GA_ID?: string
  readonly VITE_SANITY_PROJECT_ID?: string
  readonly VITE_SANITY_DATASET?: string
  readonly VITE_SANITY_API_VERSION?: string
  readonly VITE_SANITY_API_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

type GtagCommand = 'config' | 'event' | 'js' | 'set' | 'get' | 'consent'

declare function gtag(command: GtagCommand, ...args: unknown[]): void

interface Window {
  dataLayer: unknown[]
  gtag: typeof gtag
}
// ─────────────────────────────────────────────────────────────────────────────

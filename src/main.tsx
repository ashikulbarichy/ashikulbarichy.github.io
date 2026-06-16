import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// ─── Google Analytics (GA4) ──────────────────────────────────────────────────
// Set VITE_GA_ID=G-XXXXXXXXXX in your .env file to enable tracking.
const GA_ID = import.meta.env.VITE_GA_ID as string | undefined

if (GA_ID) {
  // Load the gtag.js library
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  script.async = true
  document.head.appendChild(script)

  // Initialize the data layer and send the initial page_view
  window.dataLayer = window.dataLayer || []
  function gtag(...args: unknown[]) { window.dataLayer.push(args) }
  gtag('js', new Date())
  gtag('config', GA_ID, {
    // Send page_view on every hash-based navigation change
    send_page_view: true,
  })

  // Make gtag available globally so you can fire custom events anywhere
  window.gtag = gtag
}
// ─────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
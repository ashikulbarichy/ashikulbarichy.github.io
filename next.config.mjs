/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Sanity's image CDN
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },

  async redirects() {
    return [
      // The old app was hash-routed, so the projects page lived at /#/projects.
      // A server cannot see the fragment, but plenty of people have the
      // ?/projects form saved from the old GitHub Pages SPA shim. Catch it.
      {
        source: '/',
        has: [{ type: 'query', key: '/projects' }],
        destination: '/projects',
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        // The SEO text files should be cacheable but revalidate often enough
        // that a Sanity edit shows up quickly.
        source: '/:path(llms.txt|humans.txt)',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
    ]
  },
}

export default nextConfig

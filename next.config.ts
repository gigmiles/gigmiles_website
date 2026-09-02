import type { NextConfig } from "next";

// STATIC_EXPORT=1 npm run build → Capacitor mobile build
// npm run dev / npm run build → Normal Next.js server (middleware + SSR)
const isStaticExport = process.env.STATIC_EXPORT === '1'

const nextConfig: NextConfig = {
  // Keep independent/worktree builds rooted in this site, not a parent lockfile.
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
  ...(isStaticExport && {
    output: 'export',
    trailingSlash: true,
  }),
  images: {
    unoptimized: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Campaign short-links (/reddit, /tiktok, /medium, …) are handled in
  // src/middleware.ts now, so each hit is logged SERVER-SIDE (ad-block-proof)
  // before the 307 to the UTM'd homepage. Source of truth: src/lib/campaign-links.ts.
  // next.config redirects run BEFORE middleware, so they must NOT be duplicated here.
  async headers() {
    if (isStaticExport) return []
    return [
      {
        // Scrub videos and posters are versioned by query string (see
        // cinematic-cues.ts), so they can be cached for a year.
        source: '/cinematic/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
};

export default nextConfig;

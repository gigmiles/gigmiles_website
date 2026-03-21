import type { NextConfig } from "next";

// STATIC_EXPORT=1 npm run build → Capacitor mobile build
// npm run dev / npm run build → Normal Next.js server (middleware + SSR)
const isStaticExport = process.env.STATIC_EXPORT === '1'

const nextConfig: NextConfig = {
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
  async headers() {
    if (isStaticExport) return []
    return [
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

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
  async redirects() {
    if (isStaticExport) return []
    // Short branded bio links — clean in social bios, full UTM attribution on landing.
    const social = (source: string, utmSource: string) => ({
      source,
      destination: `/?utm_source=${utmSource}&utm_medium=organic_social&utm_campaign=driver_education&utm_content=bio_link`,
      permanent: false, // 307 — keeps flexibility to retarget campaigns later
    })
    return [
      social('/tiktok', 'tiktok'),
      social('/instagram', 'instagram'),
      social('/ig', 'instagram'),
      social('/x', 'x_twitter'),
      social('/twitter', 'x_twitter'),
      social('/youtube', 'youtube'),
      {
        // Medium republish CTA — article-specific content tag
        source: '/medium',
        destination:
          '/?utm_source=medium&utm_medium=blog_republish&utm_campaign=driver_education&utm_content=gross_vs_net_article',
        permanent: false,
      },
      {
        // Reddit paid campaign — ad-specific content tag, unlike the generic bio links
        source: '/reddit',
        destination:
          '/?utm_source=reddit&utm_medium=paid_social&utm_campaign=driver_education&utm_content=freeform_launch_v1',
        permanent: false,
      },
    ]
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

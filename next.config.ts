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
  optimizeFonts: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

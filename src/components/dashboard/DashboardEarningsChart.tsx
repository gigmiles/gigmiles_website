'use client'

import dynamic from 'next/dynamic'

// We wrap the chart in a client component with SSR disabled 
// to prevent Recharts SVG ID hydration mismatches.
export const DashboardEarningsChart = dynamic(
  () => import('./EarningsChart').then((mod) => mod.EarningsChart),
  { ssr: false }
)

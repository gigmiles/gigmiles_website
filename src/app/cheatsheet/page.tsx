import type { Metadata } from 'next'
import { CheatsheetClient } from './CheatsheetClient'

// Lead-magnet landing for the Reddit organic phase (2026-07). Free
// downloadable cheat-sheet in exchange for an email; the PDF itself is
// served instantly after submit (no email-send dependency), the address
// goes to Supabase `cheatsheet_leads` for the manual, human-gated
// lifecycle nurture. Indexable on purpose: the sheet has standalone
// search/AEO value ("gig driver mileage cheat sheet").
export const metadata: Metadata = {
  title: 'Free Gig Driver Mileage & Expense Cheat-Sheet (2026) — GigMiles',
  description:
    'Know what you actually keep. A one-page 2026 cheat-sheet for gig drivers: daily tracking checklist, per-mile cost basics, and an estimated tax set-aside habit.',
}

// Message match (R3 learning, 2026-07-16): an ad that leads with the 76¢ rate
// hook must land on a hero that DELIVERS that promise. The generic
// "Know what you actually keep" hero converted 0/54 on the 76¢ meme ad —
// drivers clicked for the rate news and landed on a page that never mentioned
// it. The utm is read server-side so the right hero is in the first paint
// (no flash, no hydration swap). Organic/untagged traffic keeps the default.
export default async function CheatsheetPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const utmContent = typeof sp.utm_content === 'string' ? sp.utm_content : ''
  const variant = utmContent.startsWith('meme_76c') ? 'rate76' : 'default'
  return <CheatsheetClient variant={variant} />
}

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

export default function CheatsheetPage() {
  return <CheatsheetClient />
}

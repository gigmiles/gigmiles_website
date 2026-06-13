import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | GigMiles',
  description: 'GigMiles Terms of Service — your rights and responsibilities when using our app.',
}

// Single source of truth: the canonical Terms markdown lives in the mobile repo
// (gigmiles-mobile/legal/terms_and_conditions.md) and is copied verbatim into
// src/content/. When the mobile doc is revised + its LegalVersions stamp bumped,
// re-copy the file here so the public page stays in sync.
export default async function TermsPage() {
  const md = fs.readFileSync(
    path.join(process.cwd(), 'src/content/terms_and_conditions.md'),
    'utf8',
  )
  const html = await marked.parse(md)

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a
          href="/"
          className="text-emerald-500 text-sm font-medium hover:text-emerald-400 transition-colors"
        >
          ← GigMiles
        </a>
        <article
          className="legal-doc mt-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}

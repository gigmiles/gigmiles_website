import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | GigMiles',
  description: 'GigMiles Privacy Policy — how we collect, use, and protect your data.',
}

// Single source of truth: the canonical Privacy Policy markdown lives in the
// mobile repo (gigmiles-mobile/legal/privacy_policy.md) and is copied verbatim
// into src/content/. When the mobile doc is revised + its LegalVersions stamp
// bumped, re-copy the file here so the public page stays in sync.
export default async function PrivacyPage() {
  const md = fs.readFileSync(
    path.join(process.cwd(), 'src/content/privacy_policy.md'),
    'utf8',
  )
  const html = await marked.parse(md)

  return (
    <div className="min-h-screen bg-[#0E4F4F] text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a
          href="/"
          className="text-[#5EEAD4] text-sm font-medium hover:text-[#5EEAD4] transition-colors"
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

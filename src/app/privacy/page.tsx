import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import type { Metadata } from 'next'
import {WebsiteShell} from '@/components/editorial/WebsiteShell'

export const metadata: Metadata = {
  title: 'Privacy Policy | GigMiles',
  description: 'GigMiles Privacy Policy — how we collect, use, and protect your data.',
  alternates: {canonical:'https://gigmiles.app/privacy'},
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
    <WebsiteShell paper>
      <section className="wrap legal-reading">
        <a
          href="/"
          className="text-[#5EEAD4] text-sm font-medium hover:text-[#5EEAD4] transition-colors"
        >
          ← GigMiles
        </a>
        <article
          className="prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
    </WebsiteShell>
  )
}

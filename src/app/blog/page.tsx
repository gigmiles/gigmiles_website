import Link from 'next/link'
import type { Metadata } from 'next'
import { BLOG_POSTS, formatPostDate } from '@/lib/blog'
import { BlogList } from './BlogList'

export const metadata: Metadata = {
  title: 'Blog | GigMiles',
  description:
    'Practical money math for gig drivers — real profit, hidden vehicle costs, mileage records, and tax-season organization.',
  alternates: { canonical: 'https://gigmiles.app/blog' },
}

export default function BlogIndexPage() {
  // Pre-format on the server so the client list never imports blog.ts (fs).
  const posts = BLOG_POSTS.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    dateLabel: formatPostDate(p.date),
    readingMinutes: p.readingMinutes,
    tag: p.tag,
  }))

  return (
    <div className="min-h-screen bg-[#0E4F4F]">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <Link
          href="/"
          className="text-[#5EEAD4] text-sm font-medium hover:text-[#99F6E4] transition-colors duration-200 font-[family-name:var(--font-space-grotesk)]"
        >
          ← gigmiles
        </Link>

        <header className="mt-10 mb-14 max-w-2xl">
          <p className="text-white/45 text-[12px] tracking-[0.25em] uppercase font-[family-name:var(--font-space-grotesk)]">
            The GigMiles Blog
          </p>
          <h1 className="mt-3 text-white text-4xl md:text-5xl font-black italic tracking-[-0.04em] font-[family-name:var(--font-outfit)]">
            Driver math, <span className="text-[#5EEAD4]">explained.</span>
          </h1>
          <p className="mt-4 text-white/55 text-[16px] leading-relaxed font-[family-name:var(--font-dm-sans)]">
            What you actually keep after gas, mileage, and taxes — practical
            guides, worked examples, and recordkeeping habits for U.S. gig
            drivers.
          </p>
        </header>

        <BlogList posts={posts} />
      </div>
    </div>
  )
}

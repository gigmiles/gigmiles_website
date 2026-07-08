import Link from 'next/link'
import type { Metadata } from 'next'
import { BLOG_POSTS, formatPostDate } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog | GigMiles',
  description:
    'Practical money math for gig drivers — real profit, hidden vehicle costs, mileage records, and tax-season organization.',
}

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-[#0E4F4F]">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <Link
          href="/"
          className="text-[#5EEAD4] text-sm font-medium hover:text-[#99F6E4] transition-colors duration-200"
        >
          ← gigmiles
        </Link>

        <header className="mt-10 mb-14">
          <p className="text-white/45 text-[12px] tracking-[0.25em] uppercase font-[family-name:var(--font-space-grotesk)]">
            The GigMiles Blog
          </p>
          <h1 className="mt-3 text-white text-4xl md:text-5xl font-black italic tracking-[-0.04em] font-[family-name:var(--font-outfit)]">
            Driver math, <span className="text-[#5EEAD4]">explained.</span>
          </h1>
          <p className="mt-4 text-white/55 text-[16px] leading-relaxed max-w-xl font-[family-name:var(--font-dm-sans)]">
            What you actually keep after gas, mileage, and taxes — practical
            guides, worked examples, and recordkeeping habits for U.S. gig
            drivers.
          </p>
        </header>

        <div className="flex flex-col gap-5">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-white/[0.08] bg-[#0C4A4A] p-7 md:p-9 transition-all duration-200 hover:border-[#5EEAD4]/30 hover:shadow-[0_0_30px_rgba(94,234,212,0.12)]"
            >
              <div className="flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase font-[family-name:var(--font-space-grotesk)]">
                <span className="text-[#5EEAD4]/90 border border-[#5EEAD4]/25 rounded-full px-3 py-1">
                  {post.tag}
                </span>
                <span className="text-white/40">
                  {formatPostDate(post.date)} · {post.readingMinutes} min read
                </span>
              </div>
              <h2 className="mt-4 text-white text-2xl md:text-[28px] font-black italic tracking-[-0.03em] leading-tight font-[family-name:var(--font-outfit)] group-hover:text-[#5EEAD4] transition-colors duration-200">
                {post.title}
              </h2>
              <p className="mt-3 text-white/55 text-[15px] leading-relaxed font-[family-name:var(--font-dm-sans)]">
                {post.description}
              </p>
              <span className="mt-5 inline-block text-[#5EEAD4] text-[13px] tracking-[0.06em] font-[family-name:var(--font-space-grotesk)]">
                Read the article →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

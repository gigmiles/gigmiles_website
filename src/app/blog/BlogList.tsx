'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

// Plain post shape passed from the server page (date pre-formatted so this
// client component never imports blog.ts — that module pulls in `fs`).
export type BlogCard = {
  slug: string
  title: string
  description: string
  dateLabel: string
  readingMinutes: number
  tag: string
}

function Meta({ tag, dateLabel, readingMinutes }: { tag: string; dateLabel: string; readingMinutes: number }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] tracking-[0.18em] uppercase font-[family-name:var(--font-space-grotesk)]">
      <span className="text-[#5EEAD4]/90 border border-[#5EEAD4]/25 rounded-full px-3 py-1">{tag}</span>
      <span className="text-white/40">{dateLabel} · {readingMinutes} min read</span>
    </div>
  )
}

export function BlogList({ posts }: { posts: BlogCard[] }) {
  const tags = useMemo(() => {
    const seen = new Set(posts.map(p => p.tag))
    return ['All', ...Array.from(seen)]
  }, [posts])

  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? posts : posts.filter(p => p.tag === active)
  const [featured, ...rest] = filtered

  return (
    <div className="flex flex-col gap-10">
      {/* Tag filter — only once we have more than one category */}
      {tags.length > 2 && (
        <div className="flex flex-wrap gap-2.5">
          {tags.map(t => {
            const on = t === active
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActive(t)}
                className={`text-[12px] tracking-[0.08em] px-4 py-2 rounded-full border transition-all duration-200 font-[family-name:var(--font-space-grotesk)] cursor-pointer ${
                  on
                    ? 'bg-[#5EEAD4] text-[#0A3C3C] border-[#5EEAD4] font-semibold'
                    : 'text-white/60 border-white/15 hover:border-[#5EEAD4]/40 hover:text-white/85'
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-white/50 text-[15px] font-[family-name:var(--font-dm-sans)]">No articles here yet.</p>
      )}

      {/* Featured (newest matching) — full-width hero card */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group block rounded-2xl border border-white/[0.08] bg-[#0C4A4A] p-8 md:p-11 transition-all duration-200 hover:border-[#5EEAD4]/30 hover:shadow-[0_0_36px_rgba(94,234,212,0.14)]"
        >
          <div className="flex items-center justify-between gap-4">
            <Meta tag={featured.tag} dateLabel={featured.dateLabel} readingMinutes={featured.readingMinutes} />
            <span className="hidden sm:inline text-[#5EEAD4]/70 text-[10px] tracking-[0.22em] uppercase font-[family-name:var(--font-space-grotesk)]">Latest</span>
          </div>
          <h2 className="mt-4 text-white text-[26px] md:text-4xl font-black italic tracking-[-0.035em] leading-[1.08] font-[family-name:var(--font-outfit)] group-hover:text-[#5EEAD4] transition-colors duration-200 max-w-3xl">
            {featured.title}
          </h2>
          <p className="mt-3.5 text-white/55 text-[15px] md:text-[16px] leading-relaxed font-[family-name:var(--font-dm-sans)] max-w-2xl">
            {featured.description}
          </p>
          <span className="mt-6 inline-block text-[#5EEAD4] text-[13px] tracking-[0.06em] font-[family-name:var(--font-space-grotesk)]">
            Read the article →
          </span>
        </Link>
      )}

      {/* The rest — responsive grid that scales with the archive */}
      {rest.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-5">
          {rest.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-white/[0.08] bg-[#0C4A4A] p-7 h-full transition-all duration-200 hover:border-[#5EEAD4]/30 hover:shadow-[0_0_30px_rgba(94,234,212,0.12)]"
            >
              <Meta tag={post.tag} dateLabel={post.dateLabel} readingMinutes={post.readingMinutes} />
              <h3 className="mt-4 text-white text-xl md:text-[23px] font-black italic tracking-[-0.03em] leading-tight font-[family-name:var(--font-outfit)] group-hover:text-[#5EEAD4] transition-colors duration-200">
                {post.title}
              </h3>
              <p className="mt-3 text-white/55 text-[14px] leading-relaxed font-[family-name:var(--font-dm-sans)] line-clamp-3">
                {post.description}
              </p>
              <span className="mt-5 inline-block text-[#5EEAD4] text-[13px] tracking-[0.06em] font-[family-name:var(--font-space-grotesk)]">
                Read →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

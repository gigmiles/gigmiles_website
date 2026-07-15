import Link from 'next/link'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import type { Metadata } from 'next'
import {
  BLOG_POSTS,
  formatPostDate,
  getPost,
  getPostMarkdown,
} from '@/lib/blog'

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const post = getPost((await params).slug)
  if (!post) return {}
  return {
    title: `${post.title} | GigMiles Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const post = getPost((await params).slug)
  if (!post) notFound()

  const more = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 4)
  const html = await marked.parse(getPostMarkdown(post.slug))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `https://gigmiles.app/blog/${post.slug}`,
    author: { '@type': 'Organization', name: 'GigMiles', url: 'https://gigmiles.app' },
    publisher: { '@type': 'Organization', name: 'GigMiles', url: 'https://gigmiles.app' },
  }

  return (
    <div className="min-h-screen bg-[#0E4F4F]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <Link
          href="/blog"
          className="text-[#5EEAD4] text-sm font-medium hover:text-[#99F6E4] transition-colors duration-200"
        >
          ← All articles
        </Link>

        <header className="mt-10 mb-12">
          <div className="flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase font-[family-name:var(--font-space-grotesk)]">
            <span className="text-[#5EEAD4]/90 border border-[#5EEAD4]/25 rounded-full px-3 py-1">
              {post.tag}
            </span>
            <span className="text-white/40">
              {formatPostDate(post.date)} · {post.readingMinutes} min read
            </span>
          </div>
          <h1 className="mt-5 text-white text-3xl md:text-[44px] font-black italic tracking-[-0.04em] leading-[1.1] font-[family-name:var(--font-outfit)]">
            {post.title}
          </h1>
        </header>

        <article
          className="blog-doc"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <aside className="mt-14 rounded-2xl border border-[#5EEAD4]/20 bg-[#0C4A4A] p-8 md:p-10 shadow-[0_0_30px_rgba(94,234,212,0.08)]">
          <h2 className="text-white text-2xl font-black italic tracking-[-0.03em] font-[family-name:var(--font-outfit)]">
            See <span className="text-[#5EEAD4]">your</span> real number.
          </h2>
          <p className="mt-3 text-white/55 text-[15px] leading-relaxed font-[family-name:var(--font-dm-sans)]">
            GigMiles tracks earnings, miles, and expenses, and shows your
            estimated take-home in real time — including proper expense math
            for e-bike couriers. Free forever — no card required.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href="/download"
              className="inline-block rounded-xl bg-[#5EEAD4] px-7 py-3.5 text-[#0A3C3C] text-[15px] font-bold tracking-[0.02em] font-[family-name:var(--font-space-grotesk)] transition-all duration-200 hover:shadow-[0_0_30px_rgba(94,234,212,0.35)] active:scale-[0.98]"
            >
              Try GigMiles free
            </a>
            <a
              href="/calculator"
              className="text-[#5EEAD4] text-[14px] font-medium hover:text-[#99F6E4] transition-colors duration-200 font-[family-name:var(--font-space-grotesk)]"
            >
              Or try the take-home calculator →
            </a>
          </div>
        </aside>

        {more.length > 0 && (
          <section className="mt-16">
            <h2 className="text-white/70 text-[12px] tracking-[0.22em] uppercase mb-6 font-[family-name:var(--font-space-grotesk)]">
              More from the blog
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {more.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col rounded-2xl border border-white/[0.08] bg-[#0C4A4A] p-6 h-full transition-all duration-200 hover:border-[#5EEAD4]/30 hover:shadow-[0_0_28px_rgba(94,234,212,0.12)]"
                >
                  <div className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.16em] uppercase font-[family-name:var(--font-space-grotesk)]">
                    <span className="text-[#5EEAD4]/90 border border-[#5EEAD4]/25 rounded-full px-2.5 py-0.5">{p.tag}</span>
                    <span className="text-white/40">{p.readingMinutes} min read</span>
                  </div>
                  <h3 className="mt-3 text-white text-[19px] font-black italic tracking-[-0.03em] leading-tight font-[family-name:var(--font-outfit)] group-hover:text-[#5EEAD4] transition-colors duration-200">
                    {p.title}
                  </h3>
                  <span className="mt-4 inline-block text-[#5EEAD4] text-[12px] tracking-[0.06em] font-[family-name:var(--font-space-grotesk)]">
                    Read →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-10 text-white/35 text-[12px] leading-relaxed italic font-[family-name:var(--font-dm-sans)]">
          Tax estimates are for planning purposes only — not tax advice, not a
          filed return. Your actual tax situation may differ; consult a
          licensed tax professional.
        </p>
      </div>
    </div>
  )
}

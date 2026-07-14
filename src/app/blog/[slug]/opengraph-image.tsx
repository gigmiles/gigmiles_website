/* eslint-disable */
import { readFileSync } from 'fs'
import { join } from 'path'
import { ImageResponse } from 'next/og'
import { BLOG_POSTS, getPost } from '@/lib/blog'

// Per-article OG/social card, generated once per post at build time. Each post
// gets its own title-driven card (Medium reposts, X/LinkedIn/iMessage, Google)
// instead of inheriting the generic root wordmark card. Same brand family as the
// /calculator and /ebike cards — code-drawn text (Satori), no photos.
export const dynamic = 'force-static'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'GigMiles Blog'

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

const teal = '#0E4F4F'
const tealDeep = '#0A3C3C'
const mint = '#5EEAD4'

// Real brand mark, embedded at build time so the corner lockup shows the actual
// icon (same technique as the root card).
const logoDataUri =
  'data:image/png;base64,' +
  readFileSync(join(process.cwd(), 'public/brand/icons/icon-180.png')).toString('base64')

// Outfit — the site's display font (var(--font-outfit)). Loaded here so the card
// title/wordmark render in the brand face, not Satori's default sans. Satori can't
// parse variable fonts, so these are static instances (Black 900 / Medium 500).
// Outfit ships no true italic, so the site's italic is a faux slant — mirror with skewX.
const outfitBlack = readFileSync(join(process.cwd(), 'public/brand/fonts/Outfit-Black.ttf'))
const outfitMedium = readFileSync(join(process.cwd(), 'public/brand/fonts/Outfit-Medium.ttf'))

const slant = 'skewX(-9deg)'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  const title = post?.title ?? 'GigMiles Blog'
  const tag = (post?.tag ?? 'Blog').toUpperCase()

  // Length-bucketed clamp: keeps any 1–3 line title balanced with zero per-post
  // tuning. Longer titles step down in size so they never overflow the card.
  const len = title.length
  const titleSize =
    len <= 30 ? 80 : len <= 44 ? 68 : len <= 58 ? 60 : len <= 72 ? 52 : 46

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: `linear-gradient(to bottom right, ${teal}, ${tealDeep})`,
          padding: '54px 64px',
          fontFamily: 'Outfit',
          position: 'relative',
        }}
      >
        {/* Mesh glows — same depth cue as the root card, ties the family together */}
        <div
          style={{
            position: 'absolute',
            top: '-12%',
            left: '-8%',
            width: '46%',
            height: '46%',
            backgroundColor: 'rgba(94, 234, 212, 0.14)',
            borderRadius: '50%',
            filter: 'blur(110px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-14%',
            right: '-8%',
            width: '46%',
            height: '46%',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            borderRadius: '50%',
            filter: 'blur(110px)',
          }}
        />

        {/* Top-left brand lockup: real icon chip + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              padding: 12,
              background: 'rgba(94, 234, 212, 0.1)',
              border: '1px solid rgba(94, 234, 212, 0.2)',
              borderRadius: 16,
            }}
          >
            <img src={logoDataUri} width="52" height="52" style={{ borderRadius: 12 }} />
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 36,
              fontWeight: 900,
              color: mint,
              letterSpacing: '-2px',
              transform: slant,
            }}
          >
            gigmiles
          </div>
        </div>

        {/* Center: the article title (the only variable content) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            flex: 1,
            justifyContent: 'center',
            paddingTop: 8,
          }}
        >
          <div style={{ display: 'flex', width: 68, height: 5, borderRadius: 3, backgroundColor: mint, marginBottom: 26 }} />
          <div
            style={{
              color: '#FFFFFF',
              fontSize: titleSize,
              fontWeight: 900,
              letterSpacing: '-1.5px',
              lineHeight: 1.12,
              maxWidth: 1010,
              transform: slant,
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer: domain (balances the tag) + post tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 22, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>
            gigmiles.app/blog
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              fontWeight: 500,
              color: mint,
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            {tag}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Outfit', data: outfitBlack, weight: 900, style: 'normal' },
        { name: 'Outfit', data: outfitMedium, weight: 500, style: 'normal' },
      ],
    },
  )
}

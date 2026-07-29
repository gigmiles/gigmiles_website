import { IOS_AVAILABLE, IOS_APP_STORE_URL, ANDROID_PLAY_STORE_URL } from '@/config/app'

// The store badges, in one place, so an unavailable store can never leak a dead
// link onto a page that forgot to check. Before 2026-07-29 each landing page
// hardcoded its own <a href={IOS_APP_STORE_URL}><img .../></a> pair; when Apple
// pulled the listing that markup would have shipped four separate 404s.
//
// Renders the badges only — the caller supplies its own wrapper/layout div, so
// each page keeps the spacing it already had.
//
// When iOS is unavailable the App Store badge is replaced by a non-clickable
// "Coming soon" pill rather than dropped silently: an iPhone visitor who sees
// nothing assumes the product does not exist, which is worse than "not yet".

export function StoreBadges() {
  return (
    <>
      {IOS_AVAILABLE ? (
        <a
          href={IOS_APP_STORE_URL}
          aria-label="Download on the App Store"
          className="inline-flex transition-transform active:scale-[0.97]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/badges/app-store-badge.svg" alt="Download on the App Store" className="h-[52px] w-auto" />
        </a>
      ) : (
        <IosComingSoonPill />
      )}
      <a
        href={ANDROID_PLAY_STORE_URL}
        aria-label="Get it on Google Play"
        className="inline-flex transition-transform active:scale-[0.97]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/badges/google-play-badge.svg" alt="Get it on Google Play" className="h-[52px] w-auto" />
      </a>
    </>
  )
}

// Sized to match the 52px store badges so the row keeps its rhythm. Not a link
// and not a button: there is nowhere to go, and a dead <a> reads as broken.
export function IosComingSoonPill({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-flex h-[52px] items-center gap-2 rounded-[10px] border border-white/15 bg-white/[0.06] px-4 text-white/70 ${className}`}
      role="note"
    >
      <AppleGlyph />
      <span className="text-left leading-tight">
        <span className="block text-[10px] uppercase tracking-[0.14em] text-white/45">Coming soon on the</span>
        <span className="block text-[15px] font-semibold tracking-tight text-white/85">App Store</span>
      </span>
    </div>
  )
}

function AppleGlyph() {
  return (
    <svg width="18" height="22" viewBox="0 0 24 29" fill="currentColor" aria-hidden="true" className="flex-none opacity-70">
      <path d="M19.7 15.3c0-3.2 2.6-4.7 2.7-4.8-1.5-2.2-3.8-2.5-4.6-2.5-1.9-.2-3.8 1.2-4.8 1.2s-2.5-1.1-4.1-1.1c-2.1 0-4 1.2-5.1 3.1-2.2 3.8-.6 9.4 1.5 12.5 1.1 1.5 2.3 3.2 3.9 3.1 1.6-.1 2.2-1 4.1-1s2.4 1 4.1 1 2.7-1.5 3.7-3c1.2-1.7 1.6-3.4 1.7-3.5-.1 0-3.2-1.2-3.2-4.8zM16.6 5.9c.9-1 1.5-2.5 1.3-3.9-1.3.1-2.8.9-3.7 1.9-.8.9-1.5 2.4-1.3 3.8 1.4.1 2.9-.7 3.7-1.8z" />
    </svg>
  )
}

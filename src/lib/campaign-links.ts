// Single source of truth for branded campaign short-links (e.g. /reddit, /tiktok).
//
// These used to live as static redirects in next.config.ts. They now run through
// middleware instead, so that every hit is logged SERVER-SIDE (immune to the
// ad-blockers that swallow the client-side SiteBeacon) before the visitor is
// 307-redirected to the homepage with full UTM attribution.
//
// Why this matters: a paid ad can report N clicks while the client beacon only
// records a fraction (ad-block / bounce). The server-side redirect_hit gives an
// authoritative landing count to compare against, closing the click→landing gap.

const CAMPAIGN = 'driver_education'

type CampaignLink = {
  utm_source: string
  utm_medium: string
  utm_content: string
}

// path (no leading slash) → attribution
export const CAMPAIGN_LINKS: Record<string, CampaignLink> = {
  // Organic bio links
  tiktok: { utm_source: 'tiktok', utm_medium: 'organic_social', utm_content: 'bio_link' },
  instagram: { utm_source: 'instagram', utm_medium: 'organic_social', utm_content: 'bio_link' },
  ig: { utm_source: 'instagram', utm_medium: 'organic_social', utm_content: 'bio_link' },
  x: { utm_source: 'x_twitter', utm_medium: 'organic_social', utm_content: 'bio_link' },
  twitter: { utm_source: 'x_twitter', utm_medium: 'organic_social', utm_content: 'bio_link' },
  youtube: { utm_source: 'youtube', utm_medium: 'organic_social', utm_content: 'bio_link' },
  // Blog republish CTA
  medium: { utm_source: 'medium', utm_medium: 'blog_republish', utm_content: 'gross_vs_net_article' },
  // Paid campaigns
  reddit: { utm_source: 'reddit', utm_medium: 'paid_social', utm_content: 'freeform_launch_v1' },
  // Round 2 (image ad + CTA, 2026-07): fresh slug so Round-2 paid traffic is
  // separable from Round 1 AND from any organic reuse of /reddit.
  'reddit-ad': { utm_source: 'reddit', utm_medium: 'paid_social', utm_content: 'image_cta_r2_v1' },
}

// Build the homepage destination (path + query) for a campaign link.
export function campaignDestination(link: CampaignLink): string {
  const p = new URLSearchParams({
    utm_source: link.utm_source,
    utm_medium: link.utm_medium,
    utm_campaign: CAMPAIGN,
    utm_content: link.utm_content,
  })
  return `/?${p.toString()}`
}

// Normalize an incoming pathname to a campaign key, or null if it isn't one.
// Accepts "/reddit", "/reddit/" (trailing slash).
export function campaignKeyFromPath(pathname: string): string | null {
  const key = pathname.replace(/^\/+|\/+$/g, '').toLowerCase()
  return key in CAMPAIGN_LINKS ? key : null
}

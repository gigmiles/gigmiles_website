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
  // Optional destination path. Default is the homepage. Rule of thumb
  // (CRO verdict 2026-07-13): value-promise links (free guide/cheat-sheet
  // contexts) land on /cheatsheet; product-promise links (app/bio/blog
  // contexts) land on the homepage so nobody hits an email gate they
  // didn't ask for.
  dest?: string
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
  // Paid campaigns. Reddit traffic is cold and value-seeking (Round 2
  // lesson: 16 homepage landings, 0 download intents) — both slugs now
  // land on the lead magnet instead of the homepage.
  reddit: { utm_source: 'reddit', utm_medium: 'paid_social', utm_content: 'freeform_launch_v1', dest: '/cheatsheet' },
  // Round 2 (image ad + CTA, 2026-07): fresh slug so Round-2 paid traffic is
  // separable from Round 1 AND from any organic reuse of /reddit.
  'reddit-ad': { utm_source: 'reddit', utm_medium: 'paid_social', utm_content: 'image_cta_r2_v1', dest: '/cheatsheet' },
  // Round 3 (meme, IRS 76¢ angle → lead magnet). Fresh slug so R3 traffic is
  // cleanly separable from R1/R2. Lands on the cheat-sheet; KPI = cost/lead.
  // 'r3b' = the relaunch AFTER the message-match fix. The first run
  // ('meme_76c_r3') sent 54 landings to a hero that never mentioned 76¢ and got
  // 0 leads; that data stays under the old tag as the failed-phase record.
  // Re-using the tag would start the relaunch with the lead-rate kill gate
  // already tripped (54 landings / 0 leads) and pollute the clean read — round
  // separation lives in utm_content (the R2 rule).
  // NOTE: the /cheatsheet hero variant matches on the `meme_76c` PREFIX, so r3b
  // still gets the 76¢ hero. Keep that prefix on any future 76¢ round.
  'reddit-r3': { utm_source: 'reddit', utm_medium: 'paid_social', utm_content: 'meme_76c_r3b', dest: '/cheatsheet' },
  // Creator/influencer outreach — ONE clean slug per creator so each channel's
  // traffic stays separable (we can see which creator actually converts, which
  // is the whole point of the outreach test). Convention: slug = short creator
  // handle; utm_source = full handle; medium 'creator'; content 'outreach'.
  // Add one line per new YouTuber pitched.
  pursuit: { utm_source: 'packagepursuit', utm_medium: 'creator', utm_content: 'outreach' },
  grind: { utm_source: 'grind4thedollar', utm_medium: 'creator', utm_content: 'outreach' },
  dashing: { utm_source: 'mississippidashing', utm_medium: 'creator', utm_content: 'outreach' },
  betonyou: { utm_source: 'mrbetonyou', utm_medium: 'creator', utm_content: 'outreach' },
  // Batch 2 (2026-07-18). NOTE: DashingTrader is NOT `dashing` — that slug
  // belongs to Mississippi Dashing above, and reusing it would silently merge
  // two creators into one attribution bucket. He brands himself "FDA / Fastest
  // Dasher Alive" (and mails from dashingtraderfda@), so `fda` is both his own
  // identity and collision-free.
  fda: { utm_source: 'dashingtrader', utm_medium: 'creator', utm_content: 'outreach' },
  dollarman: { utm_source: 'gigdollarman', utm_medium: 'creator', utm_content: 'outreach' },
  aaron: { utm_source: 'drivingwithaaron', utm_medium: 'creator', utm_content: 'outreach' },
  phil: { utm_source: 'dasherphil', utm_medium: 'creator', utm_content: 'outreach' },

  // ─── Media / guest posts ───────────────────────────────────────────────────
  // The Rideshare Guy guest post (publishes 2026-07-29). The article is about
  // e-bike ACTUAL-EXPENSE math, so it lands on /ebike, not the homepage — the
  // draft was written 07-09, before /ebike existed on 07-14, which is the only
  // reason its disclosure line points at `/`. Message match is the lesson three
  // paid rounds cost us; this is the biggest scheduled traffic event we have.
  // A slug rather than a raw URL so the destination stays OURS to change later
  // without asking an editor twice.
  rsg: {
    utm_source: 'therideshareguy',
    utm_medium: 'guest_post',
    utm_content: 'ebike_expense_article',
    dest: '/ebike',
  },
}

// Build the destination (path + query) for a campaign link.
export function campaignDestination(link: CampaignLink): string {
  const p = new URLSearchParams({
    utm_source: link.utm_source,
    utm_medium: link.utm_medium,
    utm_campaign: CAMPAIGN,
    utm_content: link.utm_content,
  })
  return `${link.dest ?? '/'}?${p.toString()}`
}

// Normalize an incoming pathname to a campaign key, or null if it isn't one.
// Accepts "/reddit", "/reddit/" (trailing slash).
export function campaignKeyFromPath(pathname: string): string | null {
  const key = pathname.replace(/^\/+|\/+$/g, '').toLowerCase()
  return key in CAMPAIGN_LINKS ? key : null
}

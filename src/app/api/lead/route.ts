import { NextRequest } from 'next/server'

// Lead capture for the /cheatsheet lead-magnet page. Mirrors /api/track's
// posture: edge runtime, anon-key insert into a Supabase table whose RLS
// allows INSERT only (no reads from the browser side), size-clamped
// fields, and best-effort semantics — a storage hiccup must never cost the
// visitor their download, so the endpoint only hard-fails on an invalid
// email or a tripped honeypot. Nurture emails are sent manually later
// (human-gated lifecycle flow); nothing here sends mail.
export const runtime = 'edge'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function s(v: unknown, max: number): string | null {
  if (v === undefined || v === null) return null
  const str = String(v).slice(0, max)
  return str.length ? str : null
}

export async function POST(req: NextRequest) {
  try {
    const text = await req.text()
    const b = text ? JSON.parse(text) : {}

    // Honeypot filled = bot. Report success so the bot moves on; store nothing.
    if (s(b.hp, 64)) return Response.json({ ok: true })

    const email = s(b.email, 254)?.toLowerCase() ?? ''
    if (!EMAIL_RE.test(email)) {
      return Response.json({ ok: false, error: 'invalid_email' }, { status: 400 })
    }

    if (SUPABASE_URL && SUPABASE_ANON) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/cheatsheet_leads`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          'Content-Type': 'application/json',
          // NOTE: no `Prefer: resolution=ignore-duplicates` here — PostgREST
          // turns that into an upsert, which needs SELECT under RLS and the
          // anon role deliberately has none (42501 in prod, 2026-07-13).
          // Plain insert + treating 409 as "already subscribed" below is the
          // RLS-compatible path.
        },
        body: JSON.stringify({
          email,
          page: s(b.page, 80),
          utm_source: s(b.utm_source, 64),
          utm_medium: s(b.utm_medium, 64),
          utm_campaign: s(b.utm_campaign, 64),
          utm_content: s(b.utm_content, 64),
          cid: s(b.cid, 64),
        }),
      })
      if (!res.ok && res.status !== 409) {
        console.error('cheatsheet_leads insert failed', res.status, await res.text())
      }
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('lead endpoint error', err)
    // Never block the download on our own failure.
    return Response.json({ ok: true })
  }
}

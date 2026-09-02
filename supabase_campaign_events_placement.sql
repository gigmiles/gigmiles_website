-- 2026-09-02: which CTA fired a download_click / store_click.
-- Values come from data-cta-placement on the DownloadButton and on store
-- badge anchors: hero, nav, records, free-core, closing, sticky-bar.
-- Apply BEFORE deploying the /api/track change: PostgREST rejects unknown
-- columns with 400 and the route swallows errors, so the reverse order would
-- silently drop every download_click and store_click.
alter table public.campaign_events add column if not exists placement text;

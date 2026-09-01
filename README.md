# gigmiles.app

Marketing site for GigMiles, the net profit tracker for gig drivers. Next.js 16 (App Router), React 19, Tailwind v4 for the legacy pages and a vanilla "editorial" CSS system (`src/components/editorial/`) for the home, calculator, blog, contact, download and legal pages. Deployed on Vercel (two projects: `gigmilesapp` and `gigmiles-website`).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest
npm run build      # production build
npx tsc --noEmit   # typecheck
```

`LOCAL_DESIGN_REVIEW=1 npm run dev` shows the local design-review banner and disables the analytics beacons. Never set that flag in Vercel.

## Responsive QA

```bash
node scripts/qa/screenshot-matrix.mjs --url http://localhost:3000 --out qa-out --label local --assert
```

Captures every viewport in the matrix (375 → 2560 px plus reduced motion), records layout metrics (horizontal overflow, header height, hero geometry, the empty band below the pinned scroll story, first CTA position) and writes `report.md` + `metrics.json`. `--assert` exits non-zero when a rule fails.

## Where things live

- `src/app/` — routes. `page.tsx` is the home page (`WebsiteShell` + `ApprovedHome`).
- `src/components/editorial/` — the live design system, its CSS files and tests.
- `src/components/ui/DownloadButton.tsx`, `StoreBadges.tsx` — the only store CTAs. Store URLs and attribution builders come from `src/config/app.ts`; never hardcode raw App Store / Play URLs.
- `src/lib/calculatorMath.ts` — the single web calculation engine (calculator page, OG result card).
- `src/components/analytics/` — `pageview`, `download_click`, `store_click` beacons to `/api/track`; `src/proxy.ts` logs campaign short-links server-side.
- `src/content/` — blog markdown, privacy policy, terms.
- `public/editorial/` — the only images the live design uses.

## Rules that are not negotiable

- Product claims come from the agency's `GIGMILES_PRODUCT_FACTS.md`; illustrative numbers only from `GIGMILES_CANONICAL_NUMBERS.md`.
- Tax language stays "estimate / planning / not tax advice". Never "what you owe", "file", "guaranteed".
- Auto GPS tracking, exports and AI features are Pro; the free core is manual entry. "10-day trial" is always Pro's trial.
- Deploys need explicit operator approval. Rollback is a reviewed `git revert`, never a force-push.

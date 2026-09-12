# Website release — 2026-09-13: real app screens, the closing scene, the pace of the film

Operator approvals, in order: the scroll-pacing plan ("onaylıyorum"), removal of
the old-UI captures and the closing photograph, the four-screen tour and the
"Only GigMiles" section ("onaylıyorum"), and publication ("push"). Vocabulary rule
set by the operator during this release: **platform** means Uber, DoorDash,
Instacart and the rest; **app** means GigMiles only.

## Source and scope

- Baseline: a50eb82 (origin/main, the cinematic home). Four commits, fast-forwarded
  to main: 5c64215, e2a5f92, 594314f, c864dca. Branch `codex/website-cinematic`
  pushed to origin at the same head.
- **Scroll pacing** (5c64215). A flick of the wheel used to teleport the film
  past whole beats. Page progress is now rate-limited (0.22/s desktop, 0.30/s
  phone) and that paced progress drives both the headline cues and the film, so
  copy can never run ahead of the picture. Runway 500 → 620svh desktop,
  380 → 450svh phone; lerpDesktop 0.18 → 0.14. `rateLimitStep()` is a pure,
  frame-time-normalised step with tests; the settling frame is always written
  (a missed write surfaced as a flaky scrub test and was fixed in e2a5f92).
- **Real app screens, from source.** Every capture on the page is now the app
  as it ships (gigmiles-mobile 1.1.0+29, master at 3f3f623 on 2026-09-12),
  rendered by Flutter golden tests with the site's example inputs — not the
  July WhatsApp screenshots and not the pre-redesign mocks. Canonical example
  shift on every surface: **$235 gross − $43 costs (fuel $17, wear $26) = $192
  net · 105.0 mi · 8 h · $24/hr · Alex · 2023 Toyota Prius**. The "Tax to set
  aside" row is off via the app's own Layout & Sections preference, because the
  app's net is after estimated tax and the site's example carries none.
- **Closing scene** (e2a5f92). `public/cinematic/closing-scene.webp`: a dawn
  photograph (operator-generated, v2 — phone at ~25% of frame, open trunk with
  a delivery bag and parcels, e-bike) with the real Home screen composited onto
  the phone by a matrix3d homography. Replaces the film's last frame in the
  bookend; `hero-last.webp` stays on disk. Photo sources are gitignored
  (`public/cinematic/*-source.png`). CINEMATIC_VERSION → 2026-09-13a.
- **Tour deck** (594314f). Four real captures: Home; Split by platform (one 8 h
  / 105.0 mi shift cut into DoorDash 46.6 mi, Uber Eats 32.0 mi, Instacart
  26.5 mi, two 10-minute stops marked); Your plan (net today $192 of a $115
  target; required income $2,400 living costs + 10% buffer + $300 savings →
  $2,940 net → **$4,523 gross to aim for**); Tax center (2026 YTD $1,648 gross,
  $583 deduction over 767 mi, $162 to set aside, Q3 due Sep 15). Shifts and
  Insights cards removed with their old-UI files.
- **"Only GigMiles does this"** (c864dca). New section between the tour and
  the plans, `src/components/cinematic/OnlyGigMiles.tsx`. The plan leads with
  two screens (Edit your plan; Your plan on This week: $612 of $685, Ahead of
  pace); then the multi-platform shift; then per-vehicle deduction method (Prius
  on Standard Mileage, RadRunner e-bike on Actual Expenses, same year). Copy
  passed the slopmonster linter 5/5 plus a hand pass; card grammar follows the
  deck; on a phone the two plan screens lie in a snapping row.
- No new dependencies. No image generator painted any product UI.

## How the captures are made (reproducible)

- App source: private `gigmiles/gigmiles-mobile`; only the `kayihanozgenc1-cell`
  GitHub account can read it (and push this website repo). Clone to a short
  ASCII path and delete `windows/ linux/ macos/` so `flutter pub get` needs no
  Windows Developer Mode.
- Golden tests, modelled on the app's `test/palette_checkpoint_test.dart`:
  `site_home_golden_test.dart` (Home at 430×860 @2/@3 and 430×990 @3 for the
  photographed phone) and `site_screens_golden_test.dart` (split sheet, plan,
  plan setup, plan this-week, vehicles, tax center). They live in the scratch
  clone this release; **recommended: commit them to gigmiles-mobile under
  `test/site/` tagged `golden`** so the site can be re-shot after any UI change.
- Render at 430 pt: at 390 pt the app truncates "2023 Toyota Prius" on the
  shift card. Load lucide from the pub cache; never mock the `flutter/platform`
  channel with a Standard codec (FormatException).
- Composite: `composite-preview.cjs` (scratch) maps the screen PNG onto the
  photo's screen quad (v2: tl 353,600 · tr 590,603 · br 585,1147 · bl 351,1146);
  `find-screen-quad.cjs` finds the quad from the flat mint screen; `to-webp.cjs`
  uses Next's bundled sharp. Worth moving under `tools/` in this repo.

## Validation

- Site: vitest 74/74 (editorial + cinematic), `tsc --noEmit` clean, ESLint on
  touched files. `home-v2.test.tsx` updated to the new tour set and still
  enforces WebP < 60 KB per capture and the $192 alt on the home card.
- App renders: flutter goldens 3/3 + 4/4 green; every screen inspected by eye
  against the numbers above.
- Pacing measured in headless Chrome at 60 Hz: desktop fling 0 → 0.48 settles
  in 2.5 s at exactly 0.22/s; a 10 s deliberate scroll lags ≤ 0.022; phone
  fling 1.8 s at 0.30/s; reduced motion stays static with no video fetch.
- Dev-server screenshots (desktop 1280 and phone 375, reduced-motion list mode
  for the pinned deck): bookend, four tour cards, the new section.
- Production: verified from the live gigmiles.app response ~100 s after the
  push to main, not inferred from the push. The served HTML contains the
  "Only GigMiles does this" section, the four tour captures (home, split, plan,
  tax), the three section captures, the closing scene at `?v=2026-09-13a` and
  the "Multi-platform shift" wording; `tour-split.webp` (30,864 B),
  `only-plan-setup.webp` (52,532 B), `only-vehicles.webp` (52,784 B) and
  `closing-scene.webp` (69,506 B) all answer 200.

## App nits found while rendering (for the app team)

- "2023 Toyota Prius" ellipsizes on the Home shift card at 390 pt.
- `tax_timeline.dart:112` overflows its card by 4 px at 430 pt.
- "1 days until the typical federal window" in the quarter-due alert.
- Vehicle art for a Prius falls back to a generic green hatchback.

## Limits and rollback

- 1.1.0+29 was still in device QA on 2026-09-12; the store build was 1.0.2+28.
  The captures show the current version, not a proven production build.
- The closing scene's phone is a static composite; a live overlay (the screen
  scrolling under the photograph) is a possible next step now that the phone is
  large in frame.
- The slopmonster rival-model cleanse could not run here (no codex/gemini CLI);
  the operator has the prompt to run in ChatGPT, after which the copy is
  re-linted and applied.
- iOS App Store campaign attribution still needs the provider token on the
  other branch's `/getgigmiles` work; unchanged by this release.
- Roll back any of the four commits with `git revert` on main and the normal
  deployment; do not reset or force-push. Photo sources are not in git — keep
  `public/cinematic/closing-scene-v2-source.png` locally for re-composites.

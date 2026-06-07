# Timberline — repo guide for Claude Code

Multi-portal hunting-gear **deal site**. One codebase ships several branded portals
(timberlinedeals.com + sister sites), selected per build. This repo is the
**frontend only** — the scraper that fills the database lives elsewhere (see below).

## Architecture

- **Stack:** **Next.js 15 (App Router) + React 19**, server-rendered with ISR. No
  component library; styling is inline `style={{T}}` (the `T` theme object merges the
  base `PALETTE` with per-portal accents) plus `app/global.css`. Fonts via `next/font`.
- **Layout:**
  - `lib/` — isomorphic + server modules: `constants.js` (PORTALS, PALETTE, SB creds,
    `ACTIVE_PORTAL_ID`), `parse.js` (pure parsers: parseDeal/parseCoupon/computeTags/…),
    `theme.js`, `data.js` (server data layer — Supabase REST via `fetch` with tag-based
    ISR), `seo.js` (JSON-LD builders + `<JsonLd>`), `supabaseClient.js` + `analytics.js`
    (client-only: auth, click/analytics beacons, family/wishlist).
  - `components/TimberlineApp.jsx` — the whole interactive UI as one `'use client'`
    component, seeded from server props. The active view + brand filter are derived from
    the URL via `usePathname()`; in-app nav uses `next/link`.
  - `app/` — routes (see below).
- **Portals:** resolved at **build time** from `NEXT_PUBLIC_PORTAL` (set per Vercel
  project) in `lib/constants.js` → `ACTIVE_PORTAL_ID` / `PORTAL`. `PORTALS[id]` holds the
  per-portal theme/copy/brands/search context. (No `window`/hostname read — SSR-safe.)

  | Portal id | `NEXT_PUBLIC_PORTAL` | Site | Command Center product |
  |---|---|---|---|
  | `timberline` (default) | `timberline` | timberlinedeals.com | `timberline` |
  | `whitetail` | `whitetail` | treestandsaver.com | `treesaddle` |
  | `waterfowl` | `waterfowl` | duckblinddeals.com | `duckblind` |
  | `turkey` | `turkey` | gobblerdeals.com | `gobbler` — **ON HOLD, do not launch** |

- **Routes:**
  - `app/(site)/` — a route group whose `layout.js` mounts `TimberlineApp` **once** and
    fetches the deal data, so navigating between these views preserves state (no remount):
    `/` (deals), `/search`, `/coupons`, `/brand/[slug]`, `/profile` (noindex). Each page is
    thin — it only contributes `generateMetadata` + JSON-LD; the shell renders the UI.
  - `app/deal/[id]` — per-deal landing page (Product+Offer JSON-LD), its own app instance
    with the deal modal open. `app/embed/deal/[id]` — server-rendered embeddable card
    (external iframes depend on this exact path).
  - `app/sitemap.js`, `app/robots.js`, `app/feed.xml/route.js` — dynamic SEO artifacts
    (replace the old build-time `gen-sitemap.mjs`).
  - `app/api/revalidate` — POST, secret-guarded, calls `revalidateTag` (see below).
- **SEO:** real content + per-route `generateMetadata` (title/description/canonical/OG) +
  JSON-LD (Organization/WebSite site-wide; Product/Offer per deal; ItemList + Breadcrumb on
  home/brand) are server-rendered into first-byte HTML.

## Data / backend

- **Hub Supabase** `jcmkoooivghwrgezxode` (`https://jcmkoooivghwrgezxode.supabase.co`).
  `SB_URL` + the **anon JWT `SB_KEY` are hardcoded in `lib/constants.js` by design** (public
  key; the real security boundary is RLS). Do not treat that committed key as a secret.
- **Reads** (public, anon): server-side in `lib/data.js` via `fetch(SB_URL + /rest/v1/…,
  { next: { tags, revalidate } })` (ISR); public click counts via the `deal_click_counts`
  SECURITY DEFINER view. Client lazy-loads the long tail + does authed reads/writes via
  `lib/analytics.js` (`family_members`, `wishlist_searches`); account deletion via the
  `delete_my_account` RPC.
- **Freshness (ISR):** pages revalidate on a timer AND on demand. The scraper should POST
  to `POST /api/revalidate?secret=$REVALIDATE_SECRET` (body `{"tag":["deals","coupons","shipping"]}`)
  after each run — **once per portal domain**, since ISR caches are per-deployment.
- **Cross-product analytics:** `track(eventType, props)` (client) is a fire-and-forget write
  to the hub `analytics_events` (anon key, write-only, RLS-gated). Each portal reports as its
  own product via `PORTAL_TO_PRODUCT`. Powers the standalone Command Center dashboard.

## The scraper is NOT in this repo

Deals/coupons/shipping/price_history are written by a separate scraper on a DigitalOcean
droplet `164.92.89.41` (hostname `timberline-scraper`), code in `/opt/timberline`, cron-driven.
Don't look for scraper code here. **Scrapers MUST authenticate with the service key**
(`sb_secret_…` in `/opt/timberline/.env`) — anon write access to `deals`/`coupons`/
`brand_shipping`/`price_history` was removed in the 2026-05-30 RLS lockdown.

## Commands

```
npm run dev      # next dev
npm run build    # next build
npm run start    # next start (serve the production build)
npm run lint     # eslint
```

## Env

Per Vercel project (see `.env.example`): `NEXT_PUBLIC_PORTAL` (required —
timberline|whitetail|waterfowl), optional `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_GSC_TOKEN`,
and server-only `REVALIDATE_SECRET` (for `/api/revalidate`).

## Standing constraints

- **Do not push to `master`.** It auto-deploys **all** portals via Vercel. Work on a branch
  and let James merge.
- The hub anon key in `lib/constants.js` is public by design — don't "fix" it or move it to env.
- **Gobbler / turkey is on hold** — don't register or launch the `turkey` portal.
- The admin gate (JWT email `jamesreed@tutamail.com`) lives in **Command Center**, not this
  public deal site — this app has no admin UI.
- Plain `<img>` is intentional (brand images come from many third-party hosts) — the
  `@next/next/no-img-element` lint rule is disabled on purpose.

## Richer notes

Claude Code keeps detailed, frequently-updated notes in its auto-memory
(`timberline-architecture`, `timberline-rls-lockdown`, `timberline-nextjs-migration`),
mirrored into James's Obsidian vault under `Claude Code/`. This file is the in-repo
orientation; when it conflicts with the live code, the code wins.

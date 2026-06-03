# Timberline — repo guide for Claude Code

Multi-portal hunting-gear **deal site**. One codebase ships several branded portals
(timberlinedeals.com + sister sites), selected at build/runtime. This repo is the
**frontend only** — the scraper that fills the database lives elsewhere (see below).

## Architecture

- **Stack:** Vite + React 19, no router, no component library. The whole app is one
  file: **`src/App.jsx`** (~2k lines) + `src/App.css` / `src/index.css`. Entry `src/main.jsx`.
- **Portals:** `detectPortalId()` (App.jsx) picks the active portal from `VITE_PORTAL`
  (set per Vercel project) or, failing that, the hostname. `PORTALS[id]` holds the
  per-portal theme/copy/search context; `PORTAL` / `ACTIVE_PORTAL_ID` are the resolved globals.

  | Portal id | Site | Command Center product |
  |---|---|---|
  | `timberline` (default) | timberlinedeals.com | `timberline` |
  | `whitetail` | treestandsaver.com | `treesaddle` |
  | `waterfowl` | duckblinddeals.com | `duckblind` |
  | `turkey` | gobblerdeals.com | `gobbler` — **ON HOLD, do not launch** |

- **UI:** single-page, tabs are local state (`deals`, `search` = Price Search,
  `coupons`, and `family` = Profile when logged in). SPA routing via `vercel.json`
  rewrite (everything → `/`).

## Data / backend

- **Hub Supabase** `jcmkoooivghwrgezxode` (`https://jcmkoooivghwrgezxode.supabase.co`).
  `SB_URL` + the **anon JWT `SB_KEY` are hardcoded in `App.jsx` by design** (public key;
  the real security boundary is RLS). Do not treat that committed key as a secret.
- **Reads** (public, anon): deals/coupons via a hand-rolled REST helper `sbGet(table, params)`
  hitting `SB_URL + /rest/v1/...`; public click counts via the `deal_click_counts`
  SECURITY DEFINER view. **Authed** (logged-in user): `family_members` via the supabase-js
  client; account deletion via the `delete_my_account` RPC.
- **Cross-product analytics:** `track(eventType, props)` is a fire-and-forget write to the
  hub `analytics_events` (anon key, write-only, RLS-gated). Each portal reports as its own
  product via `PORTAL_TO_PRODUCT`. Powers the standalone Command Center dashboard.

## The scraper is NOT in this repo

Deals/coupons/shipping/price_history are written by a separate scraper on a DigitalOcean
droplet `164.92.89.41` (hostname `timberline-scraper`), code in `/opt/timberline`, cron-driven.
Don't look for scraper code here. **Scrapers MUST authenticate with the service key**
(`sb_secret_…` in `/opt/timberline/.env`) — anon write access to `deals`/`coupons`/
`brand_shipping`/`price_history` was removed in the 2026-05-30 RLS lockdown.

## Commands

```
npm run dev      # vite dev server
npm run build    # gen-sitemap.mjs (scripts/) then vite build
npm run lint     # eslint
```

## Standing constraints

- **Do not push to `master`.** It auto-deploys **all** portals via Vercel. Work on a branch
  and let James merge.
- The hub anon key in `App.jsx` is public by design — don't "fix" it or move it to env.
- **Gobbler / turkey is on hold** — don't register or launch the `turkey` portal.
- The admin gate (JWT email `jamesreed@tutamail.com`) lives in **Command Center**, not this
  public deal site — this app has no admin UI.

## Richer notes

Claude Code keeps detailed, frequently-updated notes in its auto-memory
(`timberline-architecture`, `timberline-rls-lockdown`), mirrored into James's Obsidian vault
under `Claude Code/`. This file is the in-repo orientation; when it conflicts with the live
code, the code wins.

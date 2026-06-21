# Timberline Content Engine

Goal: manufacture **organic search traffic** for the Timberline portals with **zero
ongoing time from James** by publishing genuinely valuable hunting content — buying
guides, gear-care how-tos, seasonal tactics, and sale breakdowns — that ranks, earns
trust, and funnels readers to live deals (and, once approved, affiliate links).

Why this is the whole ballgame: with ~0 traffic, affiliate revenue is ~$0 no matter
how many programs we join, and AvantLink rejected us as "not a fit" (thin/auto-generated).
Content is the fix for **both** problems at once.

---

## STATUS — LIVE & AUTONOMOUS (2026-06-17)

The engine is built, deployed, and running. End-to-end loop:

1. **Scheduled cloud routine** `timberline-content-engine` (RemoteTrigger id `trig_01T88xybzg9MNAQCtPBgv43j`,
   cron `0 16 * * 2,5` = Tue+Fri 9am PT; Higgsfield + Supabase MCP connectors + WebSearch) runs the
   self-contained playbook: dedupe → pick topic → web research → pull live deals for internal links →
   write with the two bundled writing skills + anti-AI audit → Higgsfield hero image → insert a **DRAFT**.
2. **Writing skills** vendored into `.claude/skills/`: `content-research-writer` (research/citations/hooks)
   and `content-writer` (frameworks + SEO/platform conventions + `references/anti-ai-checklist.md`, run
   against every draft before save). The routine Reads + applies both.
3. **Hero images** are made permanent automatically: the routine stores the Higgsfield CDN URL (the cloud
   sandbox blocks outbound HTTP, so it can't rehost inline); edge function `store-guide-image` (sweep mode)
   + pg_cron job `rehost-guide-images` (jobid 4, every 10 min) copy CDN → Supabase Storage bucket
   `guide-images` and update the row.
4. **Approval:** James reviews drafts in **Command Center → Guides tab** (`admin_articles` /
   `set_article_status` RPCs) and 1-tap publishes. Published articles render at `/guides` + enter the sitemap.
5. **RAMP:** draft-only for now; graduate to gated auto-publish once quality is proven across ~8-10 approvals.

First 4 articles written + published 2026-06-17 (wash-clothes, elk gear audit, saddle-hunting, wader care).

**SideWRK content engine (planned, not built):** replicate this for SideWRK with FOCUS = operator
success/business-growth content (find more customers, upsell honestly, deliver better value, win repeat &
referral business) across the 23 trades. SideWRK is a single-`index.html` SPA but already ships static
per-trade pages + sitemap, so guides should generate static `public/guides/*.html`. Uses SideWRK's own
Supabase + manual wrangler deploy. Social distribution wanted but no accounts exist yet.

---

## What's built (Phase 1 — the publishing substrate) ✅

DB-driven, renders with **no code deploy per article** (same model as `portal_brands`).

- **`articles` table** + RLS + admin RPCs — `docs/content-engine/0001_articles.sql`
  (anon reads only `status='published'`; service key writes; `set_article_status` /
  `admin_articles` are JWT-email-gated for the Command Center approval queue).
- **Public reading experience** — `/guides` (index) + `/guides/[slug]` (article), their
  own clean layout (`app/guides/`), Article + Breadcrumb JSON-LD, OG/canonical metadata,
  added to `sitemap.xml`. Markdown rendered safely by `lib/markdown.js`.
- **Data layer** — `getArticles` / `getArticle` / `getArticlesForSitemap` in `lib/data.js`
  (ISR tags `articles`, `articles:<portal>`, `article:<slug>`).

Go-live for Phase 1: apply `0001_articles.sql` to hub Supabase, merge to master (auto-deploys).
Until an article is published the `/guides` link shows an empty state — harmless.

---

## The engine (Phase 2 — the autonomous author)

Implemented as a **scheduled Claude agent** (cloud routine via `/schedule`, or a Claude
Code cron), NOT a dumb Node script — because great content needs web research + image
generation + judgment, which a plain API call can't do. Each run:

1. **Pick a topic.** Pull from the topic queue (below); skip slugs that already exist in
   `articles` for that portal. Rotate topic *types* so the site looks like a real
   publication, not a deal feed.
2. **Research it (WebSearch + fetch).** Look at what's currently ranking for the target
   keyword — top hunting publications, brand blogs, forums (rokslide, archerytalk),
   YouTube. Extract: what subtopics they cover, what they *miss*, real specifics
   (temperatures, techniques, product names, wash instructions). The article must be
   *more useful and more specific* than what ranks — that's the only way a new domain wins.
3. **Ground it in live inventory — but link to *listings*, never to a single deal.**
   Query the hub for current active deals (`deals?active=eq.true`) to see what's real and
   name actual products in the prose. **Internal links MUST point at durable listing pages
   that re-query the live deal set on every render — NEVER `/deal/<id>`.** A `/deal/<id>`
   link 404s the day that sale ends, so an evergreen guide slowly fills with dead links
   (this is the bug we're fixing). Durable targets:
   - **`/category/<slug>`** — the gear-type listing. Always shows whatever is on sale in
     that category *right now*. Slugs (matched to live `deals.cat`): `optics`, `jackets`,
     `base-layers`, `pants`, `boots`, `packs`, `knives`, `calls`, `blinds`, `accessories`,
     `clothing`. So "good binoculars for glassing" links to `/category/optics`, "merino
     base layers" → `/category/base-layers`, etc.
   - **`/brand/<slug>`** — a brand's live deals (e.g. `/brand/sitka`, `/brand/vortex`).
     Use when you name a specific brand. Slug = lowercased, hyphenated brand name.
   You MAY *mention* a specific product by name (good for specificity/E-E-A-T), but the
   hyperlink underneath it goes to its `/category/<slug>` or `/brand/<slug>`, not its deal
   page — so the link still lands on a live, relevant, on-sale set six months later.
   (Defined in `lib/constants.js` → `CATEGORY_GROUPS`; same slugs on all portals.)
4. **Write it** to the quality bar below. Markdown. 1,200–2,200 words for guides.
5. **Generate a hero image** via Higgsfield (`generate_image`) — on-theme, no text, no
   fake logos; landscape. Store the URL in `hero_image`. (Optionally 1–2 inline images.)
6. **Self-score against the rubric.** Write the score + notes into `quality_note`.
7. **Publish or queue** per the publish policy below.
8. **Revalidate** — POST `/api/revalidate?secret=…` `{"tag":["articles"]}` to the portal
   domain so it appears immediately.

### Quality bar (E-E-A-T; this is what makes it "genuinely valuable")
- Written by someone who clearly **hunts** — specific tactics, gear, conditions, mistakes.
  No fluff intros, no "in today's fast-paced world," no obvious AI padding.
- Every claim concrete and correct. Gear-care steps must be *actually right* (e.g. DWR
  reproofing, scent-free detergent, no fabric softener on technical fabrics).
- Genuinely helps even a reader who never clicks a deal. Commerce is secondary.
- Original angle vs. what ranks — fills a gap, goes deeper, or is more current.
- Honest: no fake reviews, no invented testing, no "we tested" if we didn't. Frame as
  research-backed buying advice, not first-person field tests we didn't do.
- Natural internal links to 3–8 **durable listing pages** (`/category/<slug>` and
  `/brand/<slug>` — see step 3). Zero `/deal/<id>` links: those rot. Affiliate disclosure
  inherited from the guides layout footer.

### Publish policy (reconcile: "draft+approve" vs "auto-publish")
**Ramp, don't flip a switch.** A brand-new domain that suddenly dumps auto-generated
articles can get hit by Google's quality systems — so:
- **Weeks 1–2 (calibration):** every article → `status='draft'`. James 1-tap approves the
  good ones from Command Center. This trains the rubric on what he'll actually ship.
- **After ~8–10 approved with no rejects:** flip to **auto-publish gated by self-score** —
  articles scoring ≥ threshold on the rubric publish automatically; anything below or
  low-confidence drops to the draft queue. Cap volume (e.g. ≤3–4/week/portal) so it reads
  like a publication, not a content farm.
- Either way, every article is revalidated and in the sitemap the moment it's live.

---

## Topic queue (seed — evergreen + seasonal, per portal)

**Cross-property note:** evergreen hunting content (gear care, fitness, field skills) is
reusable across Timberline portals AND can seed Timber & Tackle guide-site content — write
once at high quality, adapt the framing per property.

### timberline (western / backcountry / elk)
- Early-season elk hunting: gear & tactics for warm September days
- How to wash & re-DWR technical hunting clothing without wrecking it
- Backcountry layering system for elk: what each layer actually does
- Sitka vs First Lite vs Kuiu: how to pick a system (not a "best" listicle — a fit guide)
- Pre-season gear prep checklist: what to test before the mountain
- How to break in mountain hunting boots so they don't break you
- Spotting scope vs binoculars for western hunting: when each wins
- Best [category] deals — [Month Year] (the recurring sale-tracker template)

### whitetail / treestandsaver (saddle / mobile)
- Saddle hunting for beginners: the actual starting kit
- Scent control that works: laundry, storage, and field discipline
- Mobile setup: one-stick vs three-stick climbing, honestly compared
- How to stay warm in a saddle in late-season cold
- Pre-rut vs rut gear prep checklist

### waterfowl / duckblind
- How to care for waders so they last more than one season
- Decoy spread basics for early-season ducks
- Layout blind concealment that actually fools birds
- Cold-water duck hunting: staying warm and dry

Auto-generate the recurring "**Best <category> deals — <Month Year>**" page per portal
each month from live inventory; refresh (not duplicate) the prior month's evergreen pages.

---

## Cost
Anthropic API (already on the droplet) ~pennies/article. Higgsfield images = existing
credits. No new infra. The whole point: justify the existing ~$15/mo by turning it into
a traffic engine.

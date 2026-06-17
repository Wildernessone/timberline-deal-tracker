# Timberline Content Engine

Goal: manufacture **organic search traffic** for the Timberline portals with **zero
ongoing time from James** by publishing genuinely valuable hunting content — buying
guides, gear-care how-tos, seasonal tactics, and sale breakdowns — that ranks, earns
trust, and funnels readers to live deals (and, once approved, affiliate links).

Why this is the whole ballgame: with ~0 traffic, affiliate revenue is ~$0 no matter
how many programs we join, and AvantLink rejected us as "not a fit" (thin/auto-generated).
Content is the fix for **both** problems at once.

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
3. **Ground it in live inventory.** Query the hub for current active deals for the portal
   (`deals?active=eq.true`) so the article can cite real products and **internally link**
   to `/deal/<id>` and `/brand/<slug>`. Internal links = SEO juice + funnel to outbound.
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
- Natural internal links to 3–8 real live deals/brands. Affiliate disclosure inherited
  from the guides layout footer.

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

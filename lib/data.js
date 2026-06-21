// Server-side data layer. Uses Next's extended fetch with tag-based ISR so the
// scraper can trigger on-demand revalidation (see app/api/revalidate). Reuses
// the isomorphic parsers from lib/parse. Import only from Server Components /
// route handlers (never from a client component).
import { SB_URL, SB_H, PORTALS, PORTAL } from "@/lib/constants";
import { parseDeal, parseCoupon, brandSlug } from "@/lib/parse";

const HOUR = 3600;

// PostgREST in-list with double-quoted values (brand names contain spaces).
function brandInList(brands) {
  return "in.(" + brands.map(b => '"' + String(b).replace(/"/g, '""') + '"').join(",") + ")";
}

async function sbFetch(table, params, { tags = [], revalidate = HOUR } = {}) {
  const url = new URL(SB_URL + "/rest/v1/" + table);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url, { headers: SB_H, next: { tags, revalidate } });
  if (!r.ok) return [];
  return r.json();
}

// Active brands the storefront shows for a portal = the hardcoded PORTAL.brands
// UNION the data-driven `portal_brands` table (brands onboarded via the Command
// Center approval pipeline). DB-driven so a newly-onboarded brand appears with no
// code deploy. ISR-cached; revalidated by the scraper's /api/revalidate ping.
export async function getPortalBrands(portalId = PORTAL.id) {
  const rows = await sbFetch(
    "portal_brands",
    { select: "brand", portal: "eq." + portalId, active: "eq.true" },
    { tags: ["portal_brands", "portal_brands:" + portalId] }
  );
  return (rows || []).map(r => r.brand);
}

export async function getEffectiveBrands(portalId = PORTAL.id) {
  const portal = PORTALS[portalId] || PORTAL;
  const db = await getPortalBrands(portalId);
  return [...new Set([...(portal.brands || []), ...db])];
}

// Active deals for a portal (brand-filtered to the portal's effective brand set,
// matching the client `filtered` memo). Capped for first-byte payload; the client
// loads the long tail. `limit` can be raised for sitemap generation.
export async function getDeals(portalId = PORTAL.id, { limit = 100 } = {}) {
  const brands = await getEffectiveBrands(portalId);
  const params = { select: "*", active: "eq.true", order: "fake_sale.asc,id.asc", limit: String(limit) };
  if (brands.length) params.brand = brandInList(brands);
  const rows = await sbFetch("deals", params, { tags: ["deals", "deals:" + portalId] });
  return (rows || []).map(parseDeal);
}

// Resolve a brand slug to its canonical brand name within the portal's effective set.
export async function resolveBrandSlug(slug, portalId = PORTAL.id) {
  const brands = await getEffectiveBrands(portalId);
  return brands.find(b => brandSlug(b) === slug) || null;
}

export async function getDealsByBrand(portalId, slug, { limit = 200 } = {}) {
  const brand = await resolveBrandSlug(slug, portalId);
  if (!brand) return { brand: null, deals: [] };
  const rows = await sbFetch(
    "deals",
    { select: "*", active: "eq.true", brand: "eq." + brand, order: "fake_sale.asc,id.asc", limit: String(limit) },
    { tags: ["deals", "brand:" + slug] }
  );
  return { brand, deals: (rows || []).map(parseDeal) };
}

// Live active deals for a durable category group (see CATEGORY_GROUPS). Brand-filtered
// to the portal's effective set, same as getDeals/getDealsByBrand, then matched on the
// group's raw `cat` values (case-insensitive). Re-queried on every render, so a
// /category/<slug> page always reflects what's actually on sale right now.
export async function getDealsByCategory(portalId, group, { limit = 200 } = {}) {
  if (!group) return [];
  const brands = await getEffectiveBrands(portalId);
  const params = {
    select: "*",
    active: "eq.true",
    or: "(" + group.match.map(c => "cat.ilike." + c).join(",") + ")",
    order: "fake_sale.asc,id.asc",
    limit: String(limit),
  };
  if (brands.length) params.brand = brandInList(brands);
  const rows = await sbFetch("deals", params, { tags: ["deals", "category:" + group.slug] });
  return (rows || []).map(parseDeal);
}

export async function getDeal(id) {
  const rows = await sbFetch(
    "deals",
    { select: "*", id: "eq." + id, limit: "1" },
    { tags: ["deals", "deal:" + id] }
  );
  return rows && rows[0] ? parseDeal(rows[0]) : null;
}

export async function getCoupons() {
  const rows = await sbFetch(
    "coupons",
    { select: "*", active: "eq.true", order: "verified.desc", limit: "50" },
    { tags: ["coupons"] }
  );
  if (!rows || !rows.length) return [];
  const now = Date.now();
  return rows
    .filter(r => !r.expires_at || new Date(r.expires_at).getTime() > now)
    .map(parseCoupon);
}

export async function getBrandShipping() {
  const rows = await sbFetch(
    "brand_shipping",
    { select: "brand,free_at,flat_rate,scraped_at,policy_url" },
    { tags: ["shipping"] }
  );
  const map = {};
  (rows || []).forEach(r => { map[r.brand] = { free_at: r.free_at, flat_rate: r.flat_rate, scraped_at: r.scraped_at, policy_url: r.policy_url }; });
  return map;
}

// Convenience bundle for pages that mount the full app shell.
export async function getAppData(portalId = PORTAL.id) {
  const [deals, coupons, shipping, clickCounts, brands] = await Promise.all([
    getDeals(portalId),
    getCoupons(),
    getBrandShipping(),
    getClickCounts(),
    getEffectiveBrands(portalId),
  ]);
  return { deals, coupons, shipping, clickCounts, brands };
}

// Every active deal id (UNFILTERED by brand — every active deal is indexable via
// /deal/[id]). Supabase/PostgREST caps a single response at 1000 rows regardless
// of `limit`, so we page with the HTTP `Range` header until a short page or `max`.
export async function getAllActiveDealIdsForSitemap({ max = 10000 } = {}) {
  const PAGE = 1000;
  const out = [];
  for (let offset = 0; offset < max; offset += PAGE) {
    const url = new URL(SB_URL + "/rest/v1/deals");
    url.searchParams.set("select", "id,created_at");
    url.searchParams.set("active", "eq.true");
    url.searchParams.set("order", "id.asc");
    const r = await fetch(url, {
      headers: { ...SB_H, Range: `${offset}-${offset + PAGE - 1}` },
      next: { tags: ["deals"], revalidate: HOUR },
    });
    if (!r.ok) break;
    const rows = await r.json();
    if (!rows || !rows.length) break;
    out.push(...rows.map(row => ({ id: row.id, created_at: row.created_at })));
    if (rows.length < PAGE) break;
  }
  return out.slice(0, max);
}

// ── Editorial articles (content engine) ──
// DB-driven like portal_brands; anon sees only published rows (RLS). A new
// approved article goes live with no code deploy (ISR tag "articles").
export async function getArticles(portalId = PORTAL.id, { limit = 50 } = {}) {
  const rows = await sbFetch(
    "articles",
    { select: "slug,title,dek,hero_image,tags,published_at", portal: "eq." + portalId, status: "eq.published", order: "published_at.desc", limit: String(limit) },
    { tags: ["articles", "articles:" + portalId] }
  );
  return rows || [];
}

export async function getArticle(slug, portalId = PORTAL.id) {
  const rows = await sbFetch(
    "articles",
    { select: "*", portal: "eq." + portalId, slug: "eq." + slug, status: "eq.published", limit: "1" },
    { tags: ["articles", "article:" + slug] }
  );
  return rows && rows[0] ? rows[0] : null;
}

export async function getArticlesForSitemap(portalId = PORTAL.id) {
  const rows = await sbFetch(
    "articles",
    { select: "slug,updated_at,published_at", portal: "eq." + portalId, status: "eq.published", order: "published_at.desc", limit: "1000" },
    { tags: ["articles"] }
  );
  return rows || [];
}

export async function getClickCounts() {
  const rows = await sbFetch(
    "deal_click_counts",
    { select: "deal_id,clicks_7d" },
    { tags: ["clicks"], revalidate: 300 }
  );
  const map = {};
  (rows || []).forEach(r => { map[r.deal_id] = r.clicks_7d; });
  return map;
}

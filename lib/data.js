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

// Active deals for a portal (brand-filtered to the portal's allowlist, matching
// the client `filtered` memo). Capped for first-byte payload; the client loads
// the long tail. `limit` can be raised for sitemap generation.
export async function getDeals(portalId = PORTAL.id, { limit = 100 } = {}) {
  const portal = PORTALS[portalId] || PORTAL;
  const brands = portal.brands || [];
  const params = { select: "*", active: "eq.true", order: "fake_sale.asc,id.asc", limit: String(limit) };
  if (brands.length) params.brand = brandInList(brands);
  const rows = await sbFetch("deals", params, { tags: ["deals", "deals:" + portalId] });
  return (rows || []).map(parseDeal);
}

// Resolve a brand slug to its canonical brand name within the portal's allowlist.
export function resolveBrandSlug(slug, portalId = PORTAL.id) {
  const portal = PORTALS[portalId] || PORTAL;
  return (portal.brands || []).find(b => brandSlug(b) === slug) || null;
}

export async function getDealsByBrand(portalId, slug, { limit = 200 } = {}) {
  const brand = resolveBrandSlug(slug, portalId);
  if (!brand) return { brand: null, deals: [] };
  const rows = await sbFetch(
    "deals",
    { select: "*", active: "eq.true", brand: "eq." + brand, order: "fake_sale.asc,id.asc", limit: String(limit) },
    { tags: ["deals", "brand:" + slug] }
  );
  return { brand, deals: (rows || []).map(parseDeal) };
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
  const [deals, coupons, shipping, clickCounts] = await Promise.all([
    getDeals(portalId),
    getCoupons(),
    getBrandShipping(),
    getClickCounts(),
  ]);
  return { deals, coupons, shipping, clickCounts };
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

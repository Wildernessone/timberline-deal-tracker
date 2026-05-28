import { writeFileSync, readFileSync } from "fs";

const PORTALS = {
  timberline: "timberlinedeals.com",
  whitetail: "treestandsaver.com",
  waterfowl: "duckblinddeals.com",
  turkey: "gobblerdeals.com",
};
const portal = process.env.VITE_PORTAL || "timberline";
const domain = PORTALS[portal] || PORTALS.timberline;
const base = `https://${domain}`;
const today = new Date().toISOString().slice(0, 10);

const src = readFileSync("src/App.jsx", "utf8");
const portalMatch = src.match(new RegExp(`id:"${portal}"[^}]*?brands:\\[([^\\]]+)\\]`, "s"));
let brands = [];
if (portalMatch) {
  brands = [...portalMatch[1].matchAll(/"([^"]+)"/g)].map(m => m[1]);
}
const slug = b => b.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const routes = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/?tab=search", changefreq: "daily", priority: "0.8" },
  { loc: "/?tab=coupons", changefreq: "weekly", priority: "0.7" },
  ...brands.map(b => ({ loc: `/brand/${slug(b)}`, changefreq: "daily", priority: "0.6" })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${base}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;
writeFileSync("public/sitemap.xml", xml);

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
writeFileSync("public/robots.txt", robots);

console.log(`sitemap: ${routes.length} URLs (${brands.length} brand pages) for portal=${portal}`);

// --- RSS feed generation ---
const SB_URL = "https://jcmkoooivghwrgezxode.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbWtvb29pdmdod3JnZXp4b2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDk4NjUsImV4cCI6MjA5NDA4NTg2NX0.mQJjh11x9nGen8KLYYwLLuHcm8Oyc89Nat9kwBxe3kA";

async function genFeed() {
  try {
    const r = await fetch(SB_URL + "/rest/v1/deals?active=eq.true&select=id,brand,product,sale_price,orig_price,url,blurb,created_at&order=created_at.desc&limit=200", {
      headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY }
    });
    if (!r.ok) { console.log("RSS: fetch failed", r.status); return; }
    const all = await r.json();
    const filtered = brands.length ? all.filter(d => brands.includes(d.brand)) : all;
    const top = filtered.slice(0, 50);
    const esc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
    const items = top.map(d => {
      const disc = d.orig_price > d.sale_price ? Math.round((1 - d.sale_price/d.orig_price)*100) : 0;
      const title = `${d.brand} ${d.product}${disc > 0 ? ` — ${disc}% off ($${d.sale_price})` : ` — $${d.sale_price}`}`;
      const link = `${base}/brand/${d.brand.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}?deal=${d.id}`;
      const pubDate = new Date(d.created_at).toUTCString();
      const desc = d.blurb || `${d.brand} ${d.product} on sale at $${d.sale_price}`;
      return `  <item>
    <title>${esc(title)}</title>
    <link>${link}</link>
    <guid isPermaLink="false">${d.id}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${esc(desc)}</description>
    <source url="${d.url}">${esc(d.brand)}</source>
  </item>`;
    }).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(portal === "timberline" ? "Timberline Deal Tracker" : portal === "whitetail" ? "Treestand Saver" : portal === "waterfowl" ? "Duck Blind Deals" : "Gobbler Deals")}</title>
  <link>${base}</link>
  <description>Real hunting deals, scraped fresh every morning. No fake markdowns.</description>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>
`;
    writeFileSync("public/feed.xml", xml);
    console.log(`RSS: ${top.length} items for portal=${portal}`);
  } catch (e) { console.log("RSS error:", e.message); }
}
await genFeed();

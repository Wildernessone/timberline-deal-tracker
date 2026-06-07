import { PORTAL } from "@/lib/constants";
import { getDeals } from "@/lib/data";
import { fmtPrice } from "@/lib/parse";
import { SITE_URL, dealUrl, discountPct } from "@/lib/seo";

export const revalidate = 3600;

const esc = s => String(s || "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function GET() {
  const all = await getDeals(PORTAL.id, { limit: 200 });
  const top = [...all]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 50);

  const items = top.map(d => {
    const disc = discountPct(d);
    const title = `${d.brand} ${d.product}${disc > 0 ? ` — ${disc}% off ($${fmtPrice(d.sale)})` : ` — $${fmtPrice(d.sale)}`}`;
    const pubDate = d.createdAt ? new Date(d.createdAt).toUTCString() : "";
    const desc = d.blurb || `${d.brand} ${d.product} on sale at $${fmtPrice(d.sale)}`;
    return `  <item>
    <title>${esc(title)}</title>
    <link>${dealUrl(d.id)}</link>
    <guid isPermaLink="false">${esc(d.id)}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${esc(desc)}</description>
    <source url="${esc(d.url)}">${esc(d.brand)}</source>
  </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(PORTAL.name)}</title>
  <link>${SITE_URL}</link>
  <description>Real hunting deals, scraped fresh every morning. No fake markdowns.</description>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

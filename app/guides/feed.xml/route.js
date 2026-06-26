// Editorial RSS feed of published GUIDES at /guides/feed.xml (distinct from the
// deals feed at /feed.xml). This is the feed to connect in MSN Partner Hub so the
// content engine's guides flow into Microsoft Start / the Windows widgets feed.
// Full content (content:encoded) + a hero image per item, ~30 freshest items.
import { PORTAL } from "@/lib/constants";
import { getArticlesForFeed } from "@/lib/data";
import { mdToHtml } from "@/lib/markdown";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const esc = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
const cdata = (s) => `<![CDATA[${String(s || "").replace(/]]>/g, "]]&gt;")}]]>`;

export async function GET() {
  const articles = await getArticlesForFeed(PORTAL.id, { limit: 30 });

  const items = articles
    .map((a) => {
      const link = `${SITE_URL}/guides/${a.slug}`;
      const pub = a.published_at ? new Date(a.published_at).toUTCString() : "";
      const cats = Array.isArray(a.tags) ? a.tags : [];
      const html = mdToHtml(a.body_md || "");
      return `  <item>
    <title>${esc(a.title)}</title>
    <link>${esc(link)}</link>
    <guid isPermaLink="true">${esc(link)}</guid>
    ${pub ? `<pubDate>${pub}</pubDate>` : ""}
    <dc:creator>${esc(a.author || PORTAL.name)}</dc:creator>
${cats.map((c) => `    <category>${esc(c)}</category>`).join("\n")}
    <description>${esc(a.dek || "")}</description>
    <content:encoded>${cdata(html)}</content:encoded>${
      a.hero_image
        ? `\n    <media:content url="${esc(a.hero_image)}" medium="image"/>\n    <media:thumbnail url="${esc(a.hero_image)}"/>\n    <enclosure url="${esc(a.hero_image)}" type="image/jpeg"/>`
        : ""
    }
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>${esc(PORTAL.name)} — Guides</title>
  <link>${SITE_URL}/guides</link>
  <description>Hunting gear guides, gear breakdowns, and how-tos from ${esc(PORTAL.name)}.</description>
  <language>en-us</language>
  <atom:link href="${SITE_URL}/guides/feed.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

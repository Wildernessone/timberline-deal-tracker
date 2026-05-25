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

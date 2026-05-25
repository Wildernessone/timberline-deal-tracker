import { writeFileSync } from "fs";

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

const routes = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/?tab=search", changefreq: "daily", priority: "0.8" },
  { path: "/?tab=coupons", changefreq: "weekly", priority: "0.7" },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${base}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

writeFileSync("public/sitemap.xml", xml);

const robots = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
writeFileSync("public/robots.txt", robots);

console.log(`sitemap + robots for portal=${portal} domain=${domain}`);

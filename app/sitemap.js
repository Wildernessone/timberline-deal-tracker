import { PORTAL, CATEGORY_GROUPS } from "@/lib/constants";
import { getAllActiveDealIdsForSitemap, getEffectiveBrands, getArticlesForSitemap } from "@/lib/data";
import { brandSlug } from "@/lib/parse";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap() {
  const [deals, brands, articles] = await Promise.all([
    getAllActiveDealIdsForSitemap({ max: 10000 }),
    getEffectiveBrands(PORTAL.id),
    getArticlesForSitemap(PORTAL.id),
  ]);

  const staticRoutes = [
    { url: SITE_URL + "/", changeFrequency: "daily", priority: 1.0 },
    { url: SITE_URL + "/coupons", changeFrequency: "weekly", priority: 0.7 },
    { url: SITE_URL + "/search", changeFrequency: "weekly", priority: 0.6 },
    ...(articles.length ? [{ url: SITE_URL + "/guides", changeFrequency: "daily", priority: 0.8 }] : []),
  ];

  const guideRoutes = articles.map(a => ({
    url: SITE_URL + "/guides/" + a.slug,
    lastModified: a.updated_at || a.published_at ? new Date(a.updated_at || a.published_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const brandRoutes = brands.map(b => ({
    url: SITE_URL + "/brand/" + brandSlug(b),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  // Durable category landing pages (always-current deal listings).
  const categoryRoutes = CATEGORY_GROUPS.map(g => ({
    url: SITE_URL + "/category/" + g.slug,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const dealRoutes = deals.map(d => ({
    url: SITE_URL + "/deal/" + d.id,
    lastModified: d.created_at ? new Date(d.created_at) : undefined,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  return [...staticRoutes, ...guideRoutes, ...categoryRoutes, ...brandRoutes, ...dealRoutes];
}

import { PORTAL } from "@/lib/constants";
import { getAllActiveDealIdsForSitemap, getEffectiveBrands } from "@/lib/data";
import { brandSlug } from "@/lib/parse";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap() {
  const [deals, brands] = await Promise.all([
    getAllActiveDealIdsForSitemap({ max: 10000 }),
    getEffectiveBrands(PORTAL.id),
  ]);

  const staticRoutes = [
    { url: SITE_URL + "/", changeFrequency: "daily", priority: 1.0 },
    { url: SITE_URL + "/coupons", changeFrequency: "weekly", priority: 0.7 },
    { url: SITE_URL + "/search", changeFrequency: "weekly", priority: 0.6 },
  ];

  const brandRoutes = brands.map(b => ({
    url: SITE_URL + "/brand/" + brandSlug(b),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const dealRoutes = deals.map(d => ({
    url: SITE_URL + "/deal/" + d.id,
    lastModified: d.created_at ? new Date(d.created_at) : undefined,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  return [...staticRoutes, ...brandRoutes, ...dealRoutes];
}

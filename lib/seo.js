// Server-side SEO helpers: canonical URLs + JSON-LD builders. Pure functions.
import { PORTAL } from "@/lib/constants";

export const SITE_URL = "https://" + (PORTAL.domain || "timberlinedeals.com");

export const dealUrl = (id) => `${SITE_URL}/deal/${id}`;
export const brandUrl = (slug) => `${SITE_URL}/brand/${slug}`;
export const guideUrl = (slug) => `${SITE_URL}/guides/${slug}`;

function discountPct(d) {
  return d.orig > d.sale ? Math.round((1 - d.sale / d.orig) * 100) : 0;
}

// Product + Offer — the core rich-result schema for a price/deals site.
export function productJsonLd(d) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${d.brand} ${d.product}`,
    brand: { "@type": "Brand", name: d.brand },
    image: d.image || PORTAL.ogImage,
    ...(d.blurb ? { description: d.blurb } : {}),
    ...(d.cat ? { category: d.cat } : {}),
    offers: {
      "@type": "Offer",
      price: Number(d.sale).toFixed(2),
      priceCurrency: "USD",
      priceValidUntil: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
      availability: "https://schema.org/InStock",
      url: dealUrl(d.id),
    },
  };
}

// ItemList of products (home + brand pages).
export function itemListJsonLd(deals, { name } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    ...(name ? { name } : {}),
    numberOfItems: deals.length,
    itemListElement: deals.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: dealUrl(d.id),
      name: `${d.brand} ${d.product}`,
    })),
  };
}

export function breadcrumbJsonLd(crumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

// Article schema for editorial guides (rich results + E-E-A-T signal).
export function articleJsonLd(a) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    ...(a.dek ? { description: a.dek } : {}),
    ...(a.hero_image ? { image: a.hero_image } : {}),
    ...(a.published_at ? { datePublished: a.published_at } : {}),
    dateModified: a.updated_at || a.published_at,
    author: { "@type": "Organization", name: a.author || PORTAL.name, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: PORTAL.name,
      ...(PORTAL.ogImage ? { logo: { "@type": "ImageObject", url: PORTAL.ogImage } } : {}),
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": guideUrl(a.slug) },
  };
}

// Server component that renders one or more JSON-LD blobs into first-byte HTML.
export function JsonLd({ data }) {
  const blobs = Array.isArray(data) ? data : [data];
  return (
    <>
      {blobs.map((blob, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }}
        />
      ))}
    </>
  );
}

export { discountPct };

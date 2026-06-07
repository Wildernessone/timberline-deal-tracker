// Server-side SEO helpers: canonical URLs + JSON-LD builders. Pure functions.
import { PORTAL } from "@/lib/constants";

export const SITE_URL = "https://" + (PORTAL.domain || "timberlinedeals.com");

export const dealUrl = (id) => `${SITE_URL}/deal/${id}`;
export const brandUrl = (slug) => `${SITE_URL}/brand/${slug}`;

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
    ...(d.image ? { image: d.image } : {}),
    ...(d.blurb ? { description: d.blurb } : {}),
    ...(d.cat ? { category: d.cat } : {}),
    offers: {
      "@type": "Offer",
      price: d.sale,
      priceCurrency: "USD",
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

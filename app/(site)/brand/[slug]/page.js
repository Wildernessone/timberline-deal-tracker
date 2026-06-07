// Brand page — UI rendered by the (site) shell (brand filter derived from the URL).
// This page contributes per-brand metadata + ItemList/Breadcrumb JSON-LD.
import { notFound } from "next/navigation";
import { PORTAL } from "@/lib/constants";
import { resolveBrandSlug, getDealsByBrand } from "@/lib/data";
import { brandSlug } from "@/lib/parse";
import { itemListJsonLd, breadcrumbJsonLd, JsonLd, SITE_URL, brandUrl } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (PORTAL.brands || []).map(b => ({ slug: brandSlug(b) }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const brand = resolveBrandSlug(slug, PORTAL.id);
  if (!brand) return { title: "Brand not found", robots: { index: false } };
  const title = `${brand} deals & sales`;
  const description = `Verified ${brand} sales tracked daily by ${PORTAL.shortName} — real prices, fake-sale detection, no inflated MSRPs.`;
  return {
    title,
    description,
    alternates: { canonical: `/brand/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: brandUrl(slug),
      images: PORTAL.ogImage ? [PORTAL.ogImage] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BrandPage({ params }) {
  const { slug } = await params;
  const { brand, deals } = await getDealsByBrand(PORTAL.id, slug);
  if (!brand) notFound();

  const jsonLd = [
    itemListJsonLd(deals, { name: `${brand} deals` }),
    breadcrumbJsonLd([
      { name: "Home", url: SITE_URL + "/" },
      { name: brand, url: brandUrl(slug) },
    ]),
  ];

  return <JsonLd data={jsonLd} />;
}

import { notFound } from "next/navigation";
import TimberlineApp from "@/components/TimberlineApp";
import { PORTAL } from "@/lib/constants";
import { getDeal, getDeals, getAppData } from "@/lib/data";
import { productJsonLd, breadcrumbJsonLd, JsonLd, SITE_URL, dealUrl, brandUrl, discountPct } from "@/lib/seo";
import { brandSlug } from "@/lib/parse";

export const revalidate = 3600;
export const dynamicParams = true;

// Pre-render the top deals; the long tail renders on-demand via ISR.
export async function generateStaticParams() {
  const deals = await getDeals(PORTAL.id, { limit: 50 });
  return deals.map(d => ({ id: String(d.id) }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const d = await getDeal(id);
  if (!d) return { title: "Deal not found", robots: { index: false } };
  const disc = discountPct(d);
  const title = `${d.brand} ${d.product} — $${d.sale}${disc > 0 ? ` (${disc}% off)` : ""}`;
  const description = d.blurb || `${d.brand} ${d.product} on sale at $${d.sale}${disc > 0 ? `, ${disc}% off` : ""} — verified by ${PORTAL.shortName}.`;
  return {
    title,
    description,
    alternates: { canonical: `/deal/${d.id}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: dealUrl(d.id),
      images: d.image ? [d.image] : (PORTAL.ogImage ? [PORTAL.ogImage] : undefined),
    },
    twitter: { card: "summary_large_image", title, description, images: d.image ? [d.image] : undefined },
  };
}

export default async function DealPage({ params }) {
  const { id } = await params;
  const d = await getDeal(id);
  if (!d) notFound();

  const { deals, coupons, shipping, clickCounts, brands } = await getAppData(PORTAL.id);
  // Ensure the linked deal is present in the grid even if outside the top page.
  const seededDeals = deals.some(x => String(x.id) === String(d.id)) ? deals : [d, ...deals];

  const jsonLd = [
    productJsonLd(d),
    breadcrumbJsonLd([
      { name: "Home", url: SITE_URL + "/" },
      { name: d.brand, url: brandUrl(brandSlug(d.brand)) },
      { name: d.product, url: dealUrl(d.id) },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <TimberlineApp
        initialDeals={seededDeals}
        initialCoupons={coupons}
        initialShipping={shipping}
        initialClickCounts={clickCounts}
        initialDealId={String(d.id)}
        initialBrands={brands}
      />
    </>
  );
}

// Category page — UI rendered by the (site) shell (category filter derived from the URL).
// This is the DURABLE link target for guides/articles: it re-queries the live active-deals
// set on every render, so "today's optics deals" stays accurate forever (a single
// /deal/<id> link 404s the moment that sale ends — never deep-link those from content).
import { notFound } from "next/navigation";
import { PORTAL, CATEGORY_GROUPS, categoryGroupBySlug } from "@/lib/constants";
import { getDealsByCategory } from "@/lib/data";
import { itemListJsonLd, breadcrumbJsonLd, JsonLd, SITE_URL, categoryUrl } from "@/lib/seo";

// 6h ISR backstop; the scraper purges on demand (revalidateTag('deals')) so the live
// active-deals set stays accurate the moment anything changes (see /deal/[id]).
export const revalidate = 21600;
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORY_GROUPS.map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const group = categoryGroupBySlug(slug);
  if (!group) return { title: "Category not found", robots: { index: false } };
  const title = `${group.label} deals & sales`;
  const description = `Live ${group.label.toLowerCase()} deals tracked daily by ${PORTAL.shortName} — ${group.blurb}. Real prices, fake-sale detection, updated every morning.`;
  return {
    title,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: categoryUrl(slug),
      images: PORTAL.ogImage ? [PORTAL.ogImage] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const group = categoryGroupBySlug(slug);
  if (!group) notFound();

  // For JSON-LD only — the visible grid is rendered + filtered client-side by the shell.
  // The page itself ALWAYS resolves 200 even when this comes back empty (off-season), so a
  // link from an article never dies; the shell shows a graceful "no live deals right now".
  const deals = await getDealsByCategory(PORTAL.id, group);

  const jsonLd = [
    itemListJsonLd(deals, { name: `${group.label} deals` }),
    breadcrumbJsonLd([
      { name: "Home", url: SITE_URL + "/" },
      { name: group.label, url: categoryUrl(slug) },
    ]),
  ];

  return <JsonLd data={jsonLd} />;
}

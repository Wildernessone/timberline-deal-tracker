// Guides index — lists published editorial articles for this portal.
import Link from "next/link";
import { PORTAL, PALETTE as T } from "@/lib/constants";
import { getArticles, getHubHeroPool, getTTHeroPool } from "@/lib/data";
import { pickMatchedHero } from "@/lib/parse";
import { JsonLd, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  const title = `${PORTAL.shortName} Guides — gear advice & buying guides`;
  const description = `Hunting gear guides, buying advice, and sale breakdowns from ${PORTAL.shortName}. ${PORTAL.tagline}.`;
  return {
    title,
    description,
    alternates: { canonical: "/guides" },
    openGraph: { type: "website", title, description, url: "/guides", images: PORTAL.ogImage ? [PORTAL.ogImage] : undefined },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function GuidesIndex() {
  const articles = await getArticles(PORTAL.id, { limit: 60 });
  // Topic-matched fallback thumbnails for any guide without its own hero.
  const needFallback = articles.some(a => !a.hero_image);
  const [ownPool, sibPool] = needFallback
    ? await Promise.all([getHubHeroPool(), getTTHeroPool()])
    : [[], []];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: PORTAL.shortName, url: SITE_URL + "/" },
        { name: "Guides", url: SITE_URL + "/guides" },
      ])} />

      <h1 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
        Guides
      </h1>
      <p style={{ color: T.textSub, fontSize: 15, margin: "0 0 28px" }}>
        Honest gear advice, buying guides, and sale breakdowns — written to actually help you hunt, not to fill a page.
      </p>

      {articles.length === 0 ? (
        <p style={{ color: T.textMuted, fontSize: 14 }}>New guides are on the way. Check back soon.</p>
      ) : (
        <div style={{ display: "grid", gap: 18 }}>
          {articles.map(a => {
            const thumb = a.hero_image || pickMatchedHero(a, ownPool, sibPool);
            return (
            <Link key={a.slug} href={`/guides/${a.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article style={{ display: "flex", gap: 16, padding: 16, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12 }}>
                {thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt={a.title} style={{ width: 132, height: 92, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                )}
                <div>
                  <h2 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 19, fontWeight: 600, margin: "0 0 6px", lineHeight: 1.25 }}>{a.title}</h2>
                  {a.dek && <p style={{ color: T.textSub, fontSize: 14, margin: 0, lineHeight: 1.5 }}>{a.dek}</p>}
                  {a.published_at && (
                    <div style={{ color: T.textMuted, fontSize: 11, marginTop: 8, fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.04em" }}>
                      {new Date(a.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                  )}
                </div>
              </article>
            </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

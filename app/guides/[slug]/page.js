// Editorial article page — server-rendered with Article + Breadcrumb JSON-LD.
import Link from "next/link";
import { notFound } from "next/navigation";
import { PORTAL, PALETTE as T } from "@/lib/constants";
import { getArticle } from "@/lib/data";
import { mdToHtml } from "@/lib/markdown";
import { JsonLd, articleJsonLd, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = await getArticle(slug, PORTAL.id);
  if (!a) return { title: "Guide not found", robots: { index: false } };
  return {
    title: a.title,
    description: a.dek || undefined,
    alternates: { canonical: `/guides/${a.slug}` },
    openGraph: {
      type: "article",
      title: a.title,
      description: a.dek || undefined,
      url: `/guides/${a.slug}`,
      images: a.hero_image ? [a.hero_image] : (PORTAL.ogImage ? [PORTAL.ogImage] : undefined),
      publishedTime: a.published_at || undefined,
      modifiedTime: a.updated_at || a.published_at || undefined,
    },
    twitter: { card: "summary_large_image", title: a.title, description: a.dek || undefined },
  };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const a = await getArticle(slug, PORTAL.id);
  if (!a) notFound();

  const html = mdToHtml(a.body_md);

  return (
    <>
      <JsonLd data={[
        articleJsonLd(a),
        breadcrumbJsonLd([
          { name: PORTAL.shortName, url: SITE_URL + "/" },
          { name: "Guides", url: SITE_URL + "/guides" },
          { name: a.title, url: SITE_URL + "/guides/" + a.slug },
        ]),
      ]} />

      <div style={{ marginBottom: 18 }}>
        <Link href="/guides" style={{ color: T.accent, fontSize: 13, textDecoration: "none", fontWeight: 600 }}>← All guides</Link>
      </div>

      <article>
        <h1 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 12px" }}>
          {a.title}
        </h1>
        {a.dek && <p style={{ color: T.textSub, fontSize: 17, lineHeight: 1.5, margin: "0 0 16px" }}>{a.dek}</p>}
        <div style={{ color: T.textMuted, fontSize: 12, fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.04em", marginBottom: 24 }}>
          {a.author || PORTAL.shortName}
          {a.published_at && " · " + new Date(a.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>

        {a.hero_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.hero_image} alt="" style={{ width: "100%", borderRadius: 12, marginBottom: 28 }} />
        )}

        <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      <div style={{ marginTop: 40, padding: 20, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>See today&apos;s live {PORTAL.shortName} deals</div>
        <p style={{ color: T.textSub, fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
          Real sales tracked fresh every morning — no fake markdowns.
        </p>
        <Link href="/" style={{ display: "inline-block", background: T.orange, color: "#fff", padding: "10px 18px", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
          Browse deals →
        </Link>
      </div>
    </>
  );
}

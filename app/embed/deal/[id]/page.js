// Server-rendered embeddable deal card (external iframes depend on /embed/deal/:id).
// Renders real content at first byte — no client fetch, no header/footer.
import { notFound } from "next/navigation";
import { PORTAL } from "@/lib/constants";
import { getDeal } from "@/lib/data";
import { discountPct } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

export const metadata = { robots: { index: false, follow: false } };

export default async function EmbedDealPage({ params }) {
  const { id } = await params;
  const d = await getDeal(id);
  if (!d) notFound();
  const disc = discountPct(d);
  return (
    <a
      href={d.url + "?ref=embed"}
      target="_top"
      style={{ display: "flex", gap: 12, padding: 14, background: "#fbfaf6", border: "1px solid #e6e1d4", borderRadius: 12, textDecoration: "none", color: "#1a1815", fontFamily: "Inter,system-ui,sans-serif", maxWidth: 380, margin: 0, boxSizing: "border-box" }}
    >
      {d.image && <img src={d.image} alt={d.product} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, color: "#2d5a3d", letterSpacing: "0.12em", fontFamily: "'Courier New',monospace", fontWeight: 700, marginBottom: 3 }}>{(d.brand || "").toUpperCase()}</div>
        <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 14, lineHeight: 1.2, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{d.product}</div>
        <div style={{ fontSize: 15, fontWeight: 800 }}>
          ${d.sale}
          {disc > 0 && <span style={{ textDecoration: "line-through", color: "#9a968c", fontWeight: 400, marginLeft: 8, fontSize: 12 }}>${d.orig}</span>}
          {disc > 0 && <span style={{ color: "#c4501e", fontWeight: 700, marginLeft: 8, fontSize: 12 }}>-{disc}%</span>}
        </div>
        <div style={{ fontSize: 9, color: "#9a968c", marginTop: 6, fontFamily: "'Courier New',monospace", letterSpacing: "0.08em" }}>via {PORTAL.shortName || "TIMBERLINE"}</div>
      </div>
    </a>
  );
}

// On-demand ISR revalidation. The scraper (DO droplet 164.92.89.41,
// /opt/timberline) calls this after each run so deal/coupon/shipping pages
// refresh immediately instead of waiting for the time-based ISR window.
//
// ISR caches are per-deployment, so the scraper must POST to EACH portal's
// production URL:
//
//   for host in timberlinedeals.com treestandsaver.com duckblinddeals.com; do
//     curl -fsS -X POST "https://$host/api/revalidate?secret=$REVALIDATE_SECRET" \
//       -H 'content-type: application/json' -d '{"tag":["deals","coupons","shipping"]}' || true
//   done
//
// With no JSON body it revalidates all known tags.
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const ALL_TAGS = ["deals", "coupons", "shipping", "clicks", "portal_brands"];

export async function POST(request) {
  const secret =
    request.nextUrl.searchParams.get("secret") ||
    request.headers.get("x-revalidate-secret");

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let tags = ALL_TAGS;
  try {
    const body = await request.json();
    if (body && body.tag) tags = Array.isArray(body.tag) ? body.tag : [body.tag];
  } catch {
    // no/invalid body → revalidate everything
  }

  tags.forEach(t => revalidateTag(t));
  return NextResponse.json({ ok: true, revalidated: tags });
}

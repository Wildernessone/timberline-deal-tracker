// Coupons — UI rendered by the (site) shell (view derived from the /coupons URL).
import { PORTAL } from "@/lib/constants";

export const revalidate = 3600;

export async function generateMetadata() {
  const title = "Hunting gear coupon codes";
  const description = `Active, verified coupon codes for hunting brands — checked by ${PORTAL.shortName}. No dead codes, no fake discounts.`;
  return {
    title,
    description,
    alternates: { canonical: "/coupons" },
    openGraph: { type: "website", title, description, url: "/coupons", images: PORTAL.ogImage ? [PORTAL.ogImage] : undefined },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function CouponsPage() {
  return null;
}

import TimberlineApp from "@/components/TimberlineApp";
import { PORTAL } from "@/lib/constants";
import { getAppData } from "@/lib/data";

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

export default async function CouponsPage() {
  const { deals, coupons, shipping, clickCounts } = await getAppData(PORTAL.id);
  return (
    <TimberlineApp
      initialDeals={deals}
      initialCoupons={coupons}
      initialShipping={shipping}
      initialClickCounts={clickCounts}
      initialTab="coupons"
    />
  );
}

import TimberlineApp from "@/components/TimberlineApp";
import { PORTAL } from "@/lib/constants";
import { getAppData } from "@/lib/data";

export const revalidate = 3600;

export async function generateMetadata() {
  const title = "Price search & deal alerts";
  const description = `Search ${PORTAL.shortName} for the gear you want and get an email the moment it drops to a real, verified sale price.`;
  return {
    title,
    description,
    alternates: { canonical: "/search" },
    openGraph: { type: "website", title, description, url: "/search", images: PORTAL.ogImage ? [PORTAL.ogImage] : undefined },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SearchPage() {
  const { deals, coupons, shipping, clickCounts } = await getAppData(PORTAL.id);
  return (
    <TimberlineApp
      initialDeals={deals}
      initialCoupons={coupons}
      initialShipping={shipping}
      initialClickCounts={clickCounts}
      initialTab="search"
    />
  );
}

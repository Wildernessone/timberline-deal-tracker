import TimberlineApp from "@/components/TimberlineApp";
import { PORTAL } from "@/lib/constants";
import { getDeals, getCoupons, getBrandShipping, getClickCounts } from "@/lib/data";

export const revalidate = 3600;

export default async function Home() {
  const [deals, coupons, shipping, clickCounts] = await Promise.all([
    getDeals(PORTAL.id),
    getCoupons(),
    getBrandShipping(),
    getClickCounts(),
  ]);

  return (
    <TimberlineApp
      initialDeals={deals}
      initialCoupons={coupons}
      initialShipping={shipping}
      initialClickCounts={clickCounts}
    />
  );
}

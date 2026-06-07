// Shared shell for the browsable views (/, /search, /coupons, /brand/*, /profile).
// TimberlineApp is mounted ONCE here and persists across client-side navigation
// between these routes, so switching views preserves auth/family/deal state with
// no remount or refetch. The active view is derived from the URL inside the app.
// (Landing routes /deal/[id] and /embed/* render their own instances, outside this group.)
import TimberlineApp from "@/components/TimberlineApp";
import { PORTAL } from "@/lib/constants";
import { getAppData } from "@/lib/data";

export const revalidate = 3600;

export default async function SiteLayout({ children }) {
  const { deals, coupons, shipping, clickCounts, brands } = await getAppData(PORTAL.id);
  return (
    <>
      <TimberlineApp
        initialDeals={deals}
        initialCoupons={coupons}
        initialShipping={shipping}
        initialClickCounts={clickCounts}
        initialBrands={brands}
      />
      {children}
    </>
  );
}

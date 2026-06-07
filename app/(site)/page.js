// Home — the visible UI is rendered by the (site) layout's persistent shell.
// This page contributes the home ItemList JSON-LD (server-rendered).
import { PORTAL } from "@/lib/constants";
import { getDeals } from "@/lib/data";
import { itemListJsonLd, JsonLd } from "@/lib/seo";

export const revalidate = 3600;

export default async function Home() {
  const deals = await getDeals(PORTAL.id);
  return <JsonLd data={itemListJsonLd(deals.slice(0, 50), { name: `${PORTAL.name} — active deals` })} />;
}

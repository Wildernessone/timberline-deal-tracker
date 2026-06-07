// Price search — UI rendered by the (site) shell (view derived from the /search URL).
import { PORTAL } from "@/lib/constants";

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

export default function SearchPage() {
  return null;
}

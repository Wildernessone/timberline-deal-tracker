import { ACTIVE_PORTAL_ID } from "@/lib/constants";

// AvantLink affiliate-application FILE verification. AvantLink fetches
// /avantlink_confirmation.txt and reads the authentication response from it.
// Scoped to the timberline portal (timberlinedeals.com) — the token is
// single-domain; other portals return 404.
//
// CONTENT: the authResponse value from AvantLink's confirmation snippet. If
// AvantLink's application email specifies different/additional content for this
// file, replace AUTH_RESPONSE below with exactly what they provided.
const AUTH_RESPONSE = "31a011aed9ef24a6bdfcc8ee45cd14f9ce3b2ab9";

export const dynamic = "force-static";

export async function GET() {
  if (ACTIVE_PORTAL_ID !== "timberline") {
    return new Response("Not found", { status: 404 });
  }
  return new Response(AUTH_RESPONSE + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

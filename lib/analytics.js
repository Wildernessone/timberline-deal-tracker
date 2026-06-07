"use client";
// Client-only data helpers: anon REST reads, click/analytics beacons, and
// authed family/wishlist read-writes. All fire-and-forget paths swallow errors
// so they can never break the UI. Never call these during SSR.
import { SB_URL, SB_KEY, SB_H, ACTIVE_PORTAL_ID, PORTAL_TO_PRODUCT } from "@/lib/constants";
import { supabase } from "@/lib/supabaseClient";

export function sbGet(table, params) {
  const url = new URL(SB_URL + "/rest/v1/" + table);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return fetch(url, { headers: SB_H }).then(r => r.json());
}

export function getSessionId() {
  try {
    let s = localStorage.getItem("timberline-sid");
    if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("timberline-sid", s); }
    return s;
  } catch { return null; }
}

export function logClick(d) {
  try {
    fetch(SB_URL + "/rest/v1/clicks", {
      method: "POST",
      headers: { ...SB_H, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({
        deal_id: d.id, brand: d.brand, product: d.product, url: d.url,
        session_id: getSessionId(),
      }),
      keepalive: true,
    }).catch(() => {});
    track("click", { brand: d.brand, deal_product: d.product });
  } catch { /* never block the click */ }
}

// ── Command Center analytics beacon → hub analytics_events ──
let TRACK_USER_ID = null;
export function setTrackUser(id) { TRACK_USER_ID = id || null; }
export function track(eventType, props = {}) {
  try {
    const body = {
      product: PORTAL_TO_PRODUCT[ACTIVE_PORTAL_ID] || "timberline",
      event_type: eventType,
      anon_id: getSessionId(),
      session_id: getSessionId(),
      path: (typeof location !== "undefined" ? location.pathname : null),
      props,
      ua: (typeof navigator !== "undefined" ? navigator.userAgent : null),
    };
    if (TRACK_USER_ID) body.user_id = TRACK_USER_ID;
    fetch(SB_URL + "/rest/v1/analytics_events", {
      method: "POST",
      headers: { ...SB_H, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch { /* analytics must never break the app */ }
}
export function trackSessionStart() { try { if (sessionStorage.getItem("cc_session_started")) return; sessionStorage.setItem("cc_session_started", "1"); } catch { /* ignore */ } track("session_start"); }
export function trackLogin() { try { if (sessionStorage.getItem("cc_logged_in")) return; sessionStorage.setItem("cc_logged_in", "1"); } catch { /* ignore */ } track("login"); }

export async function loadFamily(userId, token) {
  const r = await fetch(SB_URL + "/rest/v1/family_members?user_id=eq." + userId + "&order=sort_order.asc", {
    headers: { apikey: SB_KEY, Authorization: "Bearer " + token },
  });
  return r.json();
}

export async function loadWishlist(token) {
  try {
    const r = await fetch(SB_URL + "/rest/v1/wishlist_searches?select=id,query,created_at&muted=eq.false&order=created_at.desc", {
      headers: { apikey: SB_KEY, Authorization: "Bearer " + token },
    });
    if (!r.ok) return [];
    const rows = await r.json();
    return rows.map(r => ({ id: r.id, query: r.query, addedAt: r.created_at }));
  } catch { return []; }
}

export async function saveWishlistItem(query, token, portal) {
  try {
    const r = await fetch(SB_URL + "/rest/v1/wishlist_searches", {
      method: "POST",
      headers: { apikey: SB_KEY, Authorization: "Bearer " + token, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ query, portal: portal || "timberline" }),
    });
    if (!r.ok) return null;
    const rows = await r.json();
    return rows[0]?.id || null;
  } catch { return null; }
}

export async function deleteWishlistItem(id, token) {
  try {
    await fetch(SB_URL + "/rest/v1/wishlist_searches?id=eq." + id, {
      method: "DELETE",
      headers: { apikey: SB_KEY, Authorization: "Bearer " + token },
    });
  } catch { /* ignore */ }
}

export async function saveFamily(members, userId) {
  if (!members.length) return;
  const rows = members.map((m, i) => ({
    user_id: userId, name: m.name, gender: m.gender || "mens",
    jacket: m.jacket || "L", shirt: m.shirt || "L", base: m.base || "L", pants: m.pants || "34x32",
    boots: m.boots || "10",
    looking_for: m.lookingFor || [],
    sort_order: i,
  }));
  await supabase.from("family_members").upsert(rows, { onConflict: "user_id,name" });
}

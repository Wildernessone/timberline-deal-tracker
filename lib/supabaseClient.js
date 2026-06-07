"use client";
// Browser-only Supabase client (auth + authed table writes). Persists the
// session in localStorage; must never be imported into a Server Component path.
import { createClient } from "@supabase/supabase-js";
import { SB_URL, SB_KEY } from "@/lib/constants";

const timberlineStorage = {
  getItem: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  setItem: (key, value) => { try { localStorage.setItem(key, value); } catch { /* ignore */ } },
  removeItem: (key) => { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};

export const supabase = createClient(SB_URL, SB_KEY, {
  auth: {
    persistSession: true,
    storageKey: "timberline-auth",
    storage: timberlineStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: "implicit",
  },
});

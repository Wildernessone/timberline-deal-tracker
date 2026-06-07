// Pure theme builder — merges base PALETTE with the active portal's accent
// overrides into the `T` object used by inline styles throughout the app.
import { PALETTE, PORTAL } from "@/lib/constants";

export function buildTheme(portal = PORTAL) {
  return {
    ...PALETTE,
    accent: portal.accent || PALETTE.accent,
    accentLight: portal.accentLight || PALETTE.accentLight,
    accentBorder: portal.accentBorder || PALETTE.accentBorder,
    panelAccent: portal.panelAccent || PALETTE.panelAccent,
  };
}

// The active portal's theme — stable across server and client (portal is build-time).
export const T = buildTheme(PORTAL);

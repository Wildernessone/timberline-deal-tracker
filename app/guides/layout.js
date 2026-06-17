// Clean reading layout for editorial guides — its own chrome (NOT the deal-app
// shell), so articles read like articles. On-brand header + footer with the
// standing affiliate disclosure.
import Link from "next/link";
import { PORTAL, PALETTE as T } from "@/lib/constants";

export default function GuidesLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
      <header style={{ background: T.bgHeader, borderBottom: `1px solid ${T.panelBorder}` }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ color: T.panelText, textDecoration: "none", fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}>
            {PORTAL.shortName || PORTAL.name}
          </Link>
          <nav style={{ marginLeft: "auto", display: "flex", gap: 18, fontSize: 13 }}>
            <Link href="/" style={{ color: T.panelSub, textDecoration: "none" }}>Deals</Link>
            <Link href="/guides" style={{ color: T.panelText, textDecoration: "none", fontWeight: 600 }}>Guides</Link>
            <Link href="/coupons" style={{ color: T.panelSub, textDecoration: "none" }}>Coupons</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "32px 20px 64px" }}>
        {children}
      </main>

      <footer style={{ borderTop: `1px solid ${T.border}`, background: T.bgHeader }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 20px", fontSize: 12, color: T.panelSub, lineHeight: 1.6 }}>
          © {new Date().getFullYear()} {PORTAL.name}. We may earn a commission when you buy through links on this site — your price never changes. We don&apos;t accept payment to feature, promote, or rank any product.
        </div>
      </footer>
    </div>
  );
}

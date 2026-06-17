import "./global.css";
import Script from "next/script";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { PORTAL, ACTIVE_PORTAL_ID } from "@/lib/constants";

// Self-hosted via next/font — automatic fallback size-adjust metrics eliminate
// the font-swap layout shift (CLS) the external <link> caused. Exposed as CSS
// variables consumed by the inline styles (var(--font-fraunces), etc.).
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-fraunces", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jetbrains", display: "swap" });
const fontVars = `${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`;

const SITE_URL = "https://" + (PORTAL.domain || "timberlinedeals.com");
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GSC_TOKEN = process.env.NEXT_PUBLIC_GSC_TOKEN;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: PORTAL.name, template: `%s · ${PORTAL.shortName || PORTAL.name}` },
  description: PORTAL.description,
  applicationName: PORTAL.name,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: { icon: PORTAL.favicon },
  openGraph: {
    type: "website",
    siteName: PORTAL.name,
    title: PORTAL.name,
    description: PORTAL.description,
    url: SITE_URL,
    images: PORTAL.ogImage ? [PORTAL.ogImage] : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: PORTAL.name,
    description: PORTAL.description,
    images: PORTAL.ogImage ? [PORTAL.ogImage] : undefined,
  },
  ...(GSC_TOKEN ? { verification: { google: GSC_TOKEN } } : {}),
};

export const viewport = {
  themeColor: "#15140f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Organization + WebSite JSON-LD (site-wide, server-rendered into first-byte HTML).
const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#org",
      name: PORTAL.name,
      url: SITE_URL,
      logo: PORTAL.ogImage || undefined,
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      name: PORTAL.name,
      url: SITE_URL,
      publisher: { "@id": SITE_URL + "/#org" },
      description: PORTAL.description,
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontVars}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* AvantLink affiliate-application confirmation tag — placed in <head> so
            AvantLink's verifier finds it near the top of the document. The homepage
            body is ~590KB and a body-placed tag sits ~84% down, almost certainly
            past where the verifier reads. timberline portal only. */}
        {ACTIVE_PORTAL_ID === "timberline" && (
          <script
            async
            type="text/javascript"
            src="https://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=31a011aed9ef24a6bdfcc8ee45cd14f9ce3b2ab9"
          />
        )}
      </head>
      <body>
        {children}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

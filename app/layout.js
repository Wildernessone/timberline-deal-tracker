import "./global.css";
import Script from "next/script";
import { PORTAL, PORTALS } from "@/lib/constants";

const SITE_URL = "https://" + (PORTAL.domain || "timberlinedeals.com");
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GSC_TOKEN = process.env.NEXT_PUBLIC_GSC_TOKEN;

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap";

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
      sameAs: Object.values(PORTALS).filter(p => p.domain && p.id !== PORTAL.id).map(p => "https://" + p.domain),
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONTS_HREF} rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
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

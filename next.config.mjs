/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The app renders brand/product images from many arbitrary third-party hosts
  // (plus Google's favicon service). We use plain <img> tags rather than
  // next/image to avoid maintaining a remotePatterns allowlist for every brand.
  // No image config needed as a result.

  // The only real sitemap is the dynamic /sitemap.xml (app/sitemap.js). Any other
  // sitemap-ish path falls through to the Next 404, which is served as text/html —
  // so if one of those gets submitted to Search Console, Google reports
  // "Sitemap is HTML". Redirect the common variants to the real one so a
  // mis-submitted/guessed path still resolves to valid XML instead of an HTML 404.
  async redirects() {
    return [
      { source: '/sitemap', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemap_index.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemap-index.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemaps.xml', destination: '/sitemap.xml', permanent: true },
    ];
  },
};

export default nextConfig;

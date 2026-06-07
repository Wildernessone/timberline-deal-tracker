/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The app renders brand/product images from many arbitrary third-party hosts
  // (plus Google's favicon service). We use plain <img> tags rather than
  // next/image to avoid maintaining a remotePatterns allowlist for every brand.
  // No image config needed as a result.
};

export default nextConfig;

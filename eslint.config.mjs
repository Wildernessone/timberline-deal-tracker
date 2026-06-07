import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Plain <img> is intentional: brand/product images come from many arbitrary
      // third-party hosts, so next/image's remotePatterns allowlist is impractical.
      "@next/next/no-img-element": "off",
    },
  },
  { ignores: [".next/**", "node_modules/**"] },
];

export default eslintConfig;

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PORTAL_META = {
  timberline: {
    name: "Timberline Deal Tracker",
    domain: "timberlinedeals.com",
    desc: "Real Western hunting deals — scraped fresh every morning from 70+ backcountry brands. No fake markdowns, no inflated MSRPs.",
    og: "/og-timberline.png",
  },
  whitetail: {
    name: "Treestand Saver",
    domain: "treestandsaver.com",
    desc: "Real whitetail gear deals — treestand, saddle, scent control, and rut gear. Updated every morning. No fake markdowns.",
    og: "/og-treestand-saver.png",
  },
  waterfowl: {
    name: "Duck Blind Deals",
    domain: "duckblinddeals.com",
    desc: "Real waterfowl gear deals — waders, blinds, decoys, layouts. Updated every morning. No fake markdowns.",
    og: "/og-duck-blind-deals.png",
  },
  turkey: {
    name: "Gobbler Deals",
    domain: "gobblerdeals.com",
    desc: "Real spring turkey gear deals — calls, decoys, vests. Updated every morning. No fake markdowns.",
    og: "/og-gobbler-deals.png",
  },
};

function portalHtmlMeta() {
  return {
    name: 'portal-html-meta',
    transformIndexHtml(html) {
      const portal = process.env.VITE_PORTAL || 'timberline';
      const m = PORTAL_META[portal] || PORTAL_META.timberline;
      const url = `https://${m.domain}`;
      return html
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${m.name}</title>`)
        .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${m.desc}" />`)
        .replace(/<meta property="og:site_name"[^>]*>/, `<meta property="og:site_name" content="${m.name}" />`)
        .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${m.name}" />`)
        .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${m.desc}" />`)
        .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${url}${m.og}" />`)
        .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
        .replace(/<meta name="twitter:card"[^>]*>/, `<meta name="twitter:card" content="summary_large_image" />`)
        .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${m.name}" />`)
        .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${m.desc}" />`)
        .replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${url}${m.og}" />`);
    }
  }
}

export default defineConfig({
  plugins: [react(), portalHtmlMeta()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    }
  }
})

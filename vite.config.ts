import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import type { Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import vike from "vike/plugin";
import Components from "unplugin-vue-components/vite";
import Icons from "unplugin-icons/vite";
import IconsResolve from "unplugin-icons/resolver";
import { VitePWA } from "vite-plugin-pwa";
import VueDevTools from "vite-plugin-vue-devtools";

const pkg = JSON.parse(readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf-8"));

// `vike build` also builds the server bundle, which executes in Node during
// prerendering. There the NocoDB service singletons throw without a baseId at
// module scope. No API calls happen during prerendering (data loads are
// client-only), so dummy values keep the build hermetic when the real env
// vars are absent (e.g. local builds).
function ensurePrerenderEnv() {
  process.env.VITE_APP_NOCODB_URL ??= "https://nocodb.invalid";
  process.env.VITE_APP_NOCODB_TOKEN ??= "vike";
  process.env.VITE_APP_NOCODB_BASE_ID ??= "vike";
}

// The server bundle (dist/server) processes CSS imports in Node, where the
// bare `@import "tailwindcss"` from src/assets/main.css does not resolve:
// SSR module resolution has no "style" condition, so the package does not map
// to its CSS entry. Alias the bare specifier to the real CSS file (same file
// the client build resolves to via the "style" condition); @tailwindcss/postcss
// then expands it as usual.
const tailwindCssEntry = fileURLToPath(new URL("./node_modules/tailwindcss/index.css", import.meta.url));

// Restrict plugins to Vike's client environment (the server bundle in
// dist/server must not run them).
function clientEnvOnly(plugins: Plugin[]): Plugin[] {
  return plugins.map((plugin) => ({
    ...plugin,
    applyToEnvironment(env) {
      const consumer = (env.config as { consumer?: string }).consumer ?? (env.name === "client" ? "client" : "server");
      return consumer === "client";
    },
  }));
}

// The app only uses square (1x1) flags (CSS class "fis"). Every flag rule of
// flag-icons references a 4x3 variant as well, which pulls all 4x3 SVGs
// (~2.7 MB) into the build and the PWA precache. Serving a trimmed version
// via load() ensures only the used 1x1 SVGs get bundled.
function trimFlagIcons() {
  const flagCssId = /flag-icons[\\/]css[\\/]flag-icons\.min\.css/;
  return {
    name: "trim-flag-icons",
    enforce: "pre",
    load(id: string) {
      if (!flagCssId.test(id)) return;
      const css = readFileSync(id, "utf-8");
      const rules = css.match(/[^{}]+\{[^{}]*\}/g) ?? [];
      return rules.filter((rule) => !rule.includes("4x3")).join("");
    },
  };
}

// https://vitejs.dev/config/
const config = {
  define: {
    // Inject package version as global variable for client-side access
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    trimFlagIcons(),
    // Optimized Leaflet and MarkerCluster handling
    // 1. Force Vite to pre-bundle leaflet and leaflet.markercluster together
    // 2. Ensure window.L is available before markercluster IIFE executes
    // 3. Use ESM imports for better tree-shaking
    {
      name: "leaflet-esm-optimization",
      transform(code: string, id: string) {
        if (/node_modules\/leaflet\.markercluster\.js$/.test(id) ||
            /node_modules\/vue-leaflet-markercluster\/.*\.js$/.test(id)) {
          return {
            code:
              `import L from 'leaflet';\n` +
              `if (typeof globalThis !== 'undefined' && !globalThis.L) globalThis.L = L;\n` +
              code,
            map: null,
          };
        }
      },
    },
    vue(),
    vike(),
    VueDevTools(),
    Components({
      resolvers: [IconsResolve()],
      dts: true,
    }),
    Icons({
      compiler: "vue3",
      autoInstall: true,
    }),
    ...clientEnvOnly(
      VitePWA({
        registerType: "autoUpdate",
        // Vike renders the HTML shell in pages/+onRenderHtml.ts, so the plugin
        // cannot inject the registration script into index.html.
        // pages/+onRenderClient.ts registers the service worker via
        // virtual:pwa-register instead.
        injectRegister: null,
        devOptions: {
          // Vike cannot apply vite-plugin-pwa's dev-time HTML transformer
          // (https://github.com/vikejs/vike/issues/388) — the service worker
          // is registered manually in pages/+onRenderClient.ts instead.
          enabled: false,
        },
        manifest: {
          name: "JWF Projects",
          short_name: "JWF Projects",
          description: "Overview of projects in Westafrica by JWF and Humanaktiv",
          theme_color: "#3d5e9e",
          background_color: "#ffffff",
          display: "standalone",
          icons: [
            {
              src: "img/cropped-joerg-wolff-stiftung.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "img/cropped-joerg-wolff-stiftung.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
        workbox: {
          // Precache app shell only; flags are cached on demand via runtimeCaching
          globPatterns: ["**/*.{js,css,html,ico,png,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /\.svg$/,
              handler: "CacheFirst" as const,
              options: {
                cacheName: "flag-icons-svg",
                expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 90 },
              },
            },
          ],
          skipWaiting: true,
          clientsClaim: true,
        },
      }),
    ),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      tailwindcss: tailwindCssEntry,
    },
  },
  build: {
    // Reduced warning limit to catch larger chunks earlier
    chunkSizeWarningLimit: 500,
    // Disable source maps in production to reduce bundle size and avoid exposing source code
    sourcemap: false,
    // Minify options (use Vite's default minifier to avoid requiring the 'terser' package)
    minify: "esbuild",
  },
  environments: {
    // Chunk naming/splitting applies to the client build only; Vike manages
    // the file names of the server bundle (dist/server) itself.
    client: {
      build: {
        rollupOptions: {
          output: {
            // Manual code splitting for better caching
            manualChunks(id) {
              if (id.includes("node_modules")) {
                if (id.includes("vue-router")) return "vendor-vue-router";
                if (id.includes("pinia")) return "vendor-pinia";
                if (id.includes("/vue/") || id.includes("unhead") || id.includes("vike")) return "vendor-vue-core";
                // Combine leaflet and markercluster into single chunk
                if (id.includes("leaflet")) return "vendor-leaflet";
                if (id.includes("axios")) return "vendor-axios";
                if (id.includes("unplugin")) return "vendor-unplugin";
              }
            },
            // Optimize chunk size
            // (assetFileNames is managed by Vike itself — it needs the hashes
            // for its assets manifest)
            chunkFileNames: "assets/js/[name]-[hash].js",
            entryFileNames: "assets/js/[name]-[hash].js",
          },
        },
      },
    },
  },
  // Optimize dependencies to pre-bundle leaflet and markercluster together
  optimizeDeps: {
    include: ["leaflet", "leaflet.markercluster", "@vue-leaflet/vue-leaflet"],
  },
};

export default defineConfig(({ command }) => {
  if (command === "build") {
    ensurePrerenderEnv();
  }
  return config;
});

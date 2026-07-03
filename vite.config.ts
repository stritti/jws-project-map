import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import Icons from "unplugin-icons/vite";
import IconsResolve from "unplugin-icons/resolver";
import { VitePWA } from "vite-plugin-pwa";
import version from "vite-plugin-package-version";
import VueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
    VueDevTools(),
    Components({
      resolvers: [IconsResolve()],
      dts: true,
    }),
    version(),
    Icons({
      compiler: "vue3",
      autoInstall: true,
    }),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
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
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Reduced warning limit to catch larger chunks earlier
    chunkSizeWarningLimit: 500,
    // Disable source maps in production to reduce bundle size and avoid exposing source code
    sourcemap: false,
    // Minify options (use Vite's default minifier to avoid requiring the 'terser' package)
    minify: "esbuild",
    // Configure Rollup options
    rollupOptions: {
      output: {
        // Manual code splitting for better caching
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("vue-router")) return "vendor-vue-router";
            if (id.includes("pinia")) return "vendor-pinia";
            if (id.includes("/vue/")) return "vendor-vue-core";
            // Combine leaflet and markercluster into single chunk
            if (id.includes("leaflet")) return "vendor-leaflet";
            if (id.includes("axios")) return "vendor-axios";
            if (id.includes("unplugin")) return "vendor-unplugin";
          }
        },
        // Optimize chunk size
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
  },
  // Optimize dependencies to pre-bundle leaflet and markercluster together
  optimizeDeps: {
    include: ["leaflet", "leaflet.markercluster", "@vue-leaflet/vue-leaflet"],
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
});

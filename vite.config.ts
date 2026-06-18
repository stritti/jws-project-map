import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { BootstrapVueNextResolver } from "bootstrap-vue-next";
import Icons from "unplugin-icons/vite";
import IconsResolve from "unplugin-icons/resolver";
import { VitePWA } from "vite-plugin-pwa";
import version from "vite-plugin-package-version";
import VueDevTools from "vite-plugin-vue-devtools";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // vue-leaflet-markercluster's ESM wraps the leaflet.markercluster UMD in an
    // IIFE that reads `window.L` (the Leaflet global) at module-evaluation time.
    // Vite/Rolldown wraps Leaflet in a lazy CJS getter (`xu`) so `window.L` is
    // only populated when that getter is first called — which happens inside
    // LMap.onMounted, well after the vendor chunk is evaluated.  The result is a
    // TypeError that prevents the whole bundle from loading and leaves the app
    // stuck on the loading spinner forever.
    //
    // Fix: prepend a synchronous `import L from 'leaflet'` to the markercluster
    // module source.  Rolldown sees a real ESM dependency edge from markercluster
    // → leaflet and will call the Leaflet CJS getter (`Tu()`) to resolve the
    // binding, which runs the factory and sets `window.L` before the IIFE fires.
    {
      name: "leaflet-markercluster-global-fix",
      transform(code: string, id: string) {
        if (/node_modules\/vue-leaflet-markercluster\/.*\.js$/.test(id)) {
          return {
            code:
              `import _leafletLib from 'leaflet';\n` +
              `if (typeof globalThis !== 'undefined' && !globalThis.L) globalThis.L = _leafletLib;\n` +
              code,
            map: null,
          };
        }
      },
    },
    vue(),
    VueDevTools(),
    Components({
      resolvers: [BootstrapVueNextResolver(), IconsResolve()],
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
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Increase the warning limit to avoid unnecessary warnings
    chunkSizeWarningLimit: 800,
    // Disable source maps in production to reduce bundle size and avoid exposing source code
    sourcemap: false,
    // Minify options (use Vite's default minifier to avoid requiring the 'terser' package)
    minify: "esbuild",
    // Configure Rollup options
    rollupOptions: {
      output: {
        // Manual code splitting
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("vue-router")) return "vendor-vue-router";
            if (id.includes("pinia")) return "vendor-pinia";
            if (id.includes("/vue/")) return "vendor-vue-core";
            if (id.includes("bootstrap-vue-next"))
              return "vendor-bootstrap-vue";
            if (id.includes("bootstrap")) return "vendor-bootstrap-core";
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
  // Optimize CSS
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        charset: false,
        quietDeps: true,
      },
    },
  },
});

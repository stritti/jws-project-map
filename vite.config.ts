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
        charset: false,
      },
    },
  },
});

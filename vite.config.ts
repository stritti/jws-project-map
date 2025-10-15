import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { BootstrapVueNextResolver } from 'bootstrap-vue-next';
import Icons from "unplugin-icons/vite";
import IconsResolve from "unplugin-icons/resolver";
import { VitePWA } from "vite-plugin-pwa";
import version from "vite-plugin-package-version";
import VueDevTools from 'vite-plugin-vue-devtools';

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
        theme_color: "#3d5e9e"
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
    // Enable source map for production build for better debugging
    sourcemap: false,
    // Minify options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Configure Rollup options
    rollupOptions: {
      output: {
        // Manual code splitting
        manualChunks: {
          // Split vendor code into separate chunks
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-bootstrap': ['bootstrap-vue-next', 'bootstrap'],
          'vendor-leaflet': ['leaflet', '@vue-leaflet/vue-leaflet'],
          'vendor-utils': ['axios', 'markdown-it'],
          // Split components by feature
          'feature-map': [
            './src/components/map/LocationMap.vue',
          ],
          'feature-project': [
            './src/components/project/ProjectDetails.vue',
            './src/components/project/ProjectGallery.vue',
            './src/components/project/ProjectListItem.vue',
          ],
        },
        // Optimize chunk size
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
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

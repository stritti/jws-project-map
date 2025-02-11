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
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/server\.arcgisonline\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tile-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60 // 24 hours
              }
            }
          },
        ]
      },
      manifest: {
        name: "JWF Projects",
        short_name: "JWF Projects",
        description: "Overview of projects in Westafrica by JWF and Humanaktiv",
        theme_color: "#3d5e9e",
        icons: [
          {
            src: '/img/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/img/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) return 'leaflet';
            if (id.includes('bootstrap')) return 'bootstrap';
            if (id.includes('flag')) return 'flag';
            if (id.includes('vue-router')) return 'vue-router';
            if (id.includes('vue3-markdown-it')) return 'vue3-markdown-it';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
});

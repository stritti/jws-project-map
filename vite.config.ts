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
});

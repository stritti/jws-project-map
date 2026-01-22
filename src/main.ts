import { createApp } from "vue";
import { createPinia } from "pinia";
import {createBootstrap} from 'bootstrap-vue-next'

import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "./router";

import "./assets/style-config.scss";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(createBootstrap())

// Lazy load Vue3VideoPlayer only when needed (not on initial load)
// This reduces initial bundle size significantly
import("@cloudgeek/vue3-video-player/dist/vue3-video-player.css");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Dynamic import for lazy loading
import("@cloudgeek/vue3-video-player").then((module) => {
  app.use(module.default, {
    lang: "en",
  });
});

app.mount("#app");

// Hide app shell and show app after mount
requestAnimationFrame(() => {
  const appElement = document.getElementById('app');
  const shellElement = document.getElementById('app-shell');
  
  if (appElement) {
    appElement.classList.add('mounted');
  }
  
  if (shellElement) {
    shellElement.classList.add('fade-out');
    setTimeout(() => {
      if (shellElement.parentNode) {
        shellElement.parentNode.removeChild(shellElement);
      }
    }, 300);
  }
});

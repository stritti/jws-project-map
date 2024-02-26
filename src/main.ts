import { createApp } from "vue";
import { createPinia } from "pinia";

import Vue3VideoPlayer from "@cloudgeek/vue3-video-player";
import "@cloudgeek/vue3-video-player/dist/vue3-video-player.css";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import App from "./App.vue";
import router from "./router";

import "./assets/style-config.scss";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(Vue3VideoPlayer, {
  lang: "en",
});

// app.component('vue-picture-swipe', VuePictureSwipe)

app.mount("#app");

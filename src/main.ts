import { createApp } from "vue";
import { createPinia } from "pinia";

import VueSidePanel from "vue3-side-panel";
import "vue3-side-panel/dist/vue3-side-panel.css";

import Vue3VideoPlayer from "@cloudgeek/vue3-video-player";
import "@cloudgeek/vue3-video-player/dist/vue3-video-player.css";

import App from "./App.vue";
import router from "./router";

import "./assets/style-config.scss";

const pinia = createPinia();

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(VueSidePanel);
app.use(Vue3VideoPlayer, {
  lang: "en",
});

// app.component('vue-picture-swipe', VuePictureSwipe)

app.mount("#app");

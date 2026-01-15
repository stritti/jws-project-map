import { createApp } from "vue";
import { createPinia } from "pinia";
import {createBootstrap} from 'bootstrap-vue-next'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Vue3VideoPlayer from "@cloudgeek/vue3-video-player";
import "@cloudgeek/vue3-video-player/dist/vue3-video-player.css";
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
app.use(Vue3VideoPlayer, {
  lang: "en",
});

// Remove blocking store initialization - stores will load data when needed in components
// This allows the app to mount and show the UI immediately

app.mount("#app");

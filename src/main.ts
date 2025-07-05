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

// Import stores
import { useProjectStore } from "./stores/project.store";
import { useCategoryStore } from "./stores/category.store";
import { useCountryStore } from "./stores/country.store";

import "./assets/style-config.scss";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// Initialize stores after Pinia is created but before the app mounts
// Note: Stores need the Pinia instance implicitly provided by app.use(pinia)
// We call init *after* app.use(pinia)

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(createBootstrap())
app.use(Vue3VideoPlayer, {
  lang: "en",
});

// Initialize stores after Pinia is attached to the app
// This ensures they can access the Pinia instance
const projectStore = useProjectStore(pinia);
const categoryStore = useCategoryStore(pinia);
const countryStore = useCountryStore(pinia);




// app.component('vue-picture-swipe', VuePictureSwipe)

app.mount("#app");

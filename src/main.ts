import { createApp } from "vue";
import { createPinia } from "pinia";

import VueSidePanel from "vue3-side-panel";
import "vue3-side-panel/dist/vue3-side-panel.css";

import Vue3VideoPlayer from "@cloudgeek/vue3-video-player";
import "@cloudgeek/vue3-video-player/dist/vue3-video-player.css";

import App from "./App.vue";
import router from "./router";

import "./assets/style-config.scss";

import { useCountryStore } from "./stores/country.store";
import { useCategoryStore } from "./stores/category.store";
import { useProjectStore } from "./stores/project.store";

const pinia = createPinia();

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(VueSidePanel);
app.use(Vue3VideoPlayer, {
  lang: "en",
});

// app.component('vue-picture-swipe', VuePictureSwipe)

const projectStore = useProjectStore();
projectStore.init();

const countryStore = useCountryStore();
countryStore.init();

const categoryStore = useCategoryStore();
categoryStore.init();

app.mount("#app");

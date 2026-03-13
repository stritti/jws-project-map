import { createApp } from "vue";
import { createPinia } from "pinia";
// Removed global bootstrap registration for better code splitting

import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "./router";

// Import stores
import { useProjectStore } from "@/features/projects/stores/project.store";
import { useCategoryStore } from "./stores/category.store";
import { useCountryStore } from "./stores/country.store";

import "./assets/style-config.scss";
import "flag-icons/css/flag-icons.min.css";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(pinia);
app.use(router);
// Bootstrap components should be imported locally per view

// Initialize stores after Pinia is attached to the app
// This ensures they can access the Pinia instance
useProjectStore(pinia);
useCategoryStore(pinia);
useCountryStore(pinia);

// app.component('vue-picture-swipe', VuePictureSwipe)

app.mount("#app");

// Hide app shell and show app after mount
requestAnimationFrame(() => {
  const appElement = document.getElementById("app");
  const shellElement = document.getElementById("app-shell");

  if (appElement) {
    appElement.classList.add("mounted");
  }

  if (shellElement) {
    shellElement.classList.add("fade-out");
    setTimeout(() => {
      if (shellElement.parentNode) {
        shellElement.parentNode.removeChild(shellElement);
      }
    }, 300);
  }
});

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

import { i18n } from "./plugins/i18n";
import { useHtmlLang } from "./composables/useAccessibility";

import "./assets/style-config.scss";
import "flag-icons/css/flag-icons.min.css";
import "./assets/a11y.scss";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(i18n);
// Bootstrap components should be imported locally per view

// Initialize stores after Pinia is attached to the app
// This ensures they can access the Pinia instance
const projectStore = useProjectStore(pinia);
const categoryStore = useCategoryStore(pinia);
const countryStore = useCountryStore(pinia);

// Start loading map data immediately, before any route is rendered
projectStore
  .preloadMapData()
  .catch((err) => console.error("Map preload failed:", err));
categoryStore
  .load()
  .catch((err) => console.error("Category load failed:", err));
countryStore.load().catch((err) => console.error("Country load failed:", err));

// app.component('vue-picture-swipe', VuePictureSwipe)

app.mount("#app");

// Bind HTML lang attribute to current i18n locale
useHtmlLang(i18n);

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

  // Stale-data check: Bild-URLs könnten abgelaufen sein wenn die Daten älter als 1h sind
  projectStore.refreshIfStale();
});

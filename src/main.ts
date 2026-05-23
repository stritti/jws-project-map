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

const TAXONOMY_IDLE_TIMEOUT_MS = 1200;
const TAXONOMY_FALLBACK_DELAY_MS = 100;

// Prioritize map data for first paint; defer taxonomy loading slightly so
// markers can appear as early as possible.
projectStore.preloadMapData().catch((err) => {
  console.error("Initial map data load failed:", err);
});

const loadTaxonomies = () => {
  Promise.allSettled([categoryStore.load(), countryStore.load()]).then(
    (results) => {
      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Initial taxonomy load failed:", result.reason);
        }
      });
    },
  );
};

if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
  window.requestIdleCallback(loadTaxonomies, { timeout: TAXONOMY_IDLE_TIMEOUT_MS });
} else {
  setTimeout(loadTaxonomies, TAXONOMY_FALLBACK_DELAY_MS);
}

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

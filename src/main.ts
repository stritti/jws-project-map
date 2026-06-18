import { createApp } from "vue";
import { createPinia } from "pinia";

import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "./router";

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

// Initialize stores after Pinia is attached to the app
const projectStore = useProjectStore(pinia);
const categoryStore = useCategoryStore(pinia);
const countryStore = useCountryStore(pinia);

// Load all data on startup
Promise.allSettled([
  projectStore.load(),
  categoryStore.load(),
  countryStore.load(),
]).then((results) => {
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("Initial data load failed:", result.reason);
    }
  });
});

app.mount("#app");

// Bind HTML lang attribute to current i18n locale
useHtmlLang(i18n);

// Vite preload errors occur when a dynamic import's dependency chunk cannot be
// fetched — typically because the PWA service worker is serving stale cached
// chunks after a new deployment (new file hashes, old SW cache). Reloading the
// page forces the new SW to serve the freshly cached files.
let reloadOnPreloadError = false;
window.addEventListener("vite:preloadError", (event) => {
  console.warn("Vite preload error — reloading to pick up fresh assets:", (event as VitePreloadErrorEvent).payload);
  if (!reloadOnPreloadError) {
    reloadOnPreloadError = true;
    window.location.reload();
  }
});

// When a new service worker activates and claims this page (skipWaiting +
// clientsClaim), the page is still running old JavaScript that references old
// chunk hashes. A controllerchange reload ensures we immediately get the new
// SW's fresh assets instead of running a stale bundle under a new SW.
if ("serviceWorker" in navigator) {
  let reloadOnController = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!reloadOnController) {
      reloadOnController = true;
      window.location.reload();
    }
  });
}

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

import { createApp } from "vue";
import { createPinia } from "pinia";
import { watch } from "vue";

import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "./router";

import { useProjectStore } from "@/features/projects/stores/project.store";
import { useCategoryStore } from "@/stores/category.store";
import { useCountryStore } from "@/stores/country.store";

import { i18n, initializeLocale } from "@/plugins/i18n";
import { useHtmlLang } from "./composables/useAccessibility";

import "./assets/main.css";
import "flag-icons/css/flag-icons.min.css";
import "./assets/a11y.css";
import "./assets/iframe.css";

interface VitePreloadErrorEvent extends Event {
  payload: Error;
}

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

async function initializeApp() {
  try {
    await initializeLocale();
  } catch (error) {
    console.error("Initialization failed:", error);
  } finally {
    app.mount("#app");
    useHtmlLang(i18n);

    async function loadWithStartupRetry(load: () => Promise<void>, isInitialized: () => boolean, isLoading: () => boolean) {
      await load();

      if (isInitialized()) {
        return;
      }

      if (isLoading()) {
        await new Promise<void>((resolve) => {
          const stop = watch(
            isLoading,
            (loading: boolean) => {
              if (!loading) {
                stop();
                resolve();
              }
            },
            { immediate: true },
          );
        });
      }

      if (!isInitialized()) {
        await load();
      }
    }

    // Defer the initial data loads until after the first paint.
    requestAnimationFrame(() => {
      setTimeout(() => {
        Promise.allSettled([
          loadWithStartupRetry(() => projectStore.loadMapData(), () => projectStore.mapInitialized, () => projectStore.mapLoading),
          loadWithStartupRetry(() => categoryStore.load(), () => categoryStore.initialized, () => categoryStore.loading),
          loadWithStartupRetry(() => countryStore.load(), () => countryStore.initialized, () => countryStore.loading),
        ]).then((results) => {
          results.forEach((result) => {
            if (result.status === "rejected") {
              console.error("Initial data load failed:", result.reason);
            }
          });
          void loadWithStartupRetry(() => projectStore.load(), () => projectStore.initialized, () => projectStore.loading);
        }).catch((error) => {
          console.error("Unexpected startup data load failure:", error);
        });
      }, 0);
    });
  }
}

initializeApp();

// Vite preload errors occur when a dynamic import's dependency chunk cannot be
// fetched — typically because the PWA service worker is serving stale cached
// chunks after a new deployment (new file hashes, old SW cache). Reloading the
// page forces the new SW to serve the freshly cached files.
let hasReloadedOnPreloadError = false;
window.addEventListener("vite:preloadError", (event) => {
  console.warn("Vite preload error — reloading to pick up fresh assets:", (event as VitePreloadErrorEvent).payload);
  if (!hasReloadedOnPreloadError) {
    hasReloadedOnPreloadError = true;
    window.location.reload();
  }
});

// When a new service worker activates and claims this page (skipWaiting +
// clientsClaim), the page is still running old JavaScript that references old
// chunk hashes. A controllerchange reload ensures we immediately get the new
// SW's fresh assets instead of running a stale bundle under a new SW.
if ("serviceWorker" in navigator) {
  let hasReloadedOnController = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hasReloadedOnController) {
      hasReloadedOnController = true;
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

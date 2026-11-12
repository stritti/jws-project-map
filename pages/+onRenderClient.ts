// https://vike.dev/onRenderClient
export { onRenderClient };

import { watch } from "vue";
import type { PageContextClient } from "vike/types";
import { registerSW } from "virtual:pwa-register";

import { createApp } from "@/app";
import { i18n } from "@/plugins/i18n";
import { useHtmlLang } from "@/composables/useAccessibility";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { useCategoryStore } from "@/stores/category.store";
import { useCountryStore } from "@/stores/country.store";

interface VitePreloadErrorEvent extends Event {
  payload: Error;
}

// Client-only entry: Vike runs this hook exclusively in the browser, so all
// browser globals (window/document/service worker) are safe here.
async function onRenderClient(_pageContext: PageContextClient) {
  const { app, pinia, router } = await createApp();
  await router.isReady();
  app.mount("#app");

  useHtmlLang(i18n);

  const projectStore = useProjectStore(pinia);
  const categoryStore = useCategoryStore(pinia);
  const countryStore = useCountryStore(pinia);

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
            if (!loading || isInitialized()) {
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

  function loadProjectMapData() {
    return loadWithStartupRetry(
      () => projectStore.loadMapData(),
      () => projectStore.mapInitialized,
      () => projectStore.mapLoading || projectStore.loading,
    );
  }

  function loadProjectDetails() {
    return loadWithStartupRetry(
      () => projectStore.load(),
      () => projectStore.initialized,
      () => projectStore.loading,
    );
  }

  // Defer the initial data loads until after the first paint.
  requestAnimationFrame(() => {
    setTimeout(() => {
      const mapLoad = loadProjectMapData();

      void Promise.allSettled([
        loadWithStartupRetry(() => categoryStore.load(), () => categoryStore.initialized, () => categoryStore.loading),
        loadWithStartupRetry(() => countryStore.load(), () => countryStore.initialized, () => countryStore.loading),
      ]).then((results) => {
        results.forEach((result) => {
          if (result.status === "rejected") {
            console.error("Initial data load failed:", result.reason);
          }
        });
      }).catch((error) => {
        console.error("Unexpected startup data load failure:", error);
      });

      void mapLoad.finally(() => {
        void loadProjectDetails();
      });
    }, 0);
  });

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

  // When a new service worker activates and claims the page (skipWaiting +
  // clientsClaim), the page may still be running old JavaScript that references
  // old chunk hashes. A controllerchange reload then ensures we immediately get
  // the new SW's fresh assets instead of running a stale bundle under a new SW.
  // Only the very first claim is exempt: on a fresh origin the page was served
  // from the network and is not stale, so reloading would just discard the
  // freshly loaded app a few seconds after the initial load. Later controller
  // changes (a new SW taking over a page that already has a controller) still
  // trigger the reload.
  if ("serviceWorker" in navigator) {
    let hasController = Boolean(navigator.serviceWorker.controller);
    let hasReloadedOnController = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      const isInitialClaim = !hasController;
      hasController = true;
      if (hasReloadedOnController || isInitialClaim) return;
      hasReloadedOnController = true;
      window.location.reload();
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

  // Register the PWA service worker in production (vite-plugin-pwa runs with
  // injectRegister: null because Vike renders the HTML shell itself, and its
  // dev-time registration is incompatible with Vike's dev server).
  if (import.meta.env.PROD) {
    registerSW({ immediate: true });
  }
}

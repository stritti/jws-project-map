import { createSSRApp } from "vue";
import type { App as VueApp } from "vue";
import { createPinia } from "pinia";
import type { Pinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createHead } from "@unhead/vue/client";
import { createHead as createSSRHead } from "@unhead/vue/server";
import type { VueHeadClient } from "@unhead/vue";
import type { Router } from "vue-router";

import App from "./App.vue";
import { createAppRouter } from "./router";

import { i18n, initializeLocale } from "@/plugins/i18n";

import "./assets/main.css";
import "flag-icons/css/flag-icons.min.css";
import "./assets/a11y.css";
import "./assets/iframe.css";

export interface AppContext {
  app: VueApp;
  pinia: Pinia;
  router: Router;
  head: VueHeadClient;
}

// Shared app factory used by both Vike render hooks: pages/+onRenderHtml.ts
// (server/prerendering) and pages/+onRenderClient.ts (browser). vue-router
// stays the client-side router; Vike only renders the shell around it.
export async function createApp(): Promise<AppContext> {
  const app = createSSRApp(App);

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);

  app.use(i18n);

  const head = import.meta.env.SSR ? createSSRHead() : createHead();
  app.use(head);

  const router = createAppRouter();
  app.use(router);

  // Load locale messages before mount so the first paint (and the prerendered
  // HTML) has real translations. During prerendering there is no
  // localStorage or navigator, so this resolves to the "en" fallback.
  try {
    await initializeLocale();
  } catch (error) {
    console.error("Initialization failed:", error);
  }

  return { app, pinia, router, head };
}

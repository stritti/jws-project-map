import { createMemoryHistory, createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw, Router } from "vue-router";
import HomeView from "../views/HomeView.vue";

// Plain route records. The router instance itself is created by
// createAppRouter() (see src/app.ts), which swaps in a memory history during
// SSR/prerendering and a web history in the browser.
export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/project/",
    name: "ProjectList",
    component: () =>
      import(
        /* webpackChunkName: "project-list" */ "../views/ProjectListView.vue"
      ),
  },
  {
    path: "/project/:projectId",
    props: true,
    name: "ProjectDetail",
    component: () =>
      import(
        /* webpackChunkName: "project-detail" */ "../views/ProjectDetailView.vue"
      ),
  },
  {
    path: "/about",
    redirect: "/",
  },
];

export function createAppRouter(): Router {
  return createRouter({
    // import.meta.env.SSR is true in Vike's server build (prerendering)
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  });
}

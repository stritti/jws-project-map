import type { RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

// Plain route records: the router instance itself is created by vite-ssg
// (see src/main.ts), which swaps in a memory history during SSG.
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

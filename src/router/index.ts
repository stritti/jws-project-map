import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/project/",

    name: "ProjectList",
    component: () =>
      import(/* webpackChunkName: "project" */ "../views/ProjectListView.vue"),
  },
  {
    path: "/project/:projectId",
    props: true,
    name: "ProjectDetail",
    component: () =>
      import(
        /* webpackChunkName: "project" */ "../views/ProjectDetailView.vue"
      ),
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

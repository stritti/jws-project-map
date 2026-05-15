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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Update document title on route changes
const BASE_TITLE = "Jörg Wolff Foundation — Projects in West Africa";
router.afterEach(() => {
  document.title = BASE_TITLE;
});

export default router;

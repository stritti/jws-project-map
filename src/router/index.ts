import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useProjectStore } from "@/stores/project.store";
import { useCategoryStore } from "@/stores/category.store";
import { useCountryStore } from "@/stores/country.store";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    beforeEnter: async (
      _to: RouteLocationNormalized,
      _from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const projectStore = useProjectStore();
      const categoryStore = useCategoryStore();
      const countryStore = useCountryStore();
      await Promise.all([
        projectStore.load(),
        categoryStore.load(),
        countryStore.load(),
      ]);
      next();
    },
  },
  {
    path: "/project/",

    name: "ProjectList",
    component: () =>
      import(/* webpackChunkName: "project" */ "../views/ProjectListView.vue"),
    beforeEnter: async (
      _to: RouteLocationNormalized,
      _from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const projectStore = useProjectStore();
      const categoryStore = useCategoryStore();
      const countryStore = useCountryStore();
      await Promise.all([
        projectStore.load(),
        categoryStore.load(),
        countryStore.load(),
      ]);
      next();
    },
  },
  {
    path: "/project/:projectId",
    props: true,
    name: "ProjectDetail",
    component: () =>
      import(
        /* webpackChunkName: "project" */ "../views/ProjectDetailView.vue"
      ),
    beforeEnter: async (
      _to: RouteLocationNormalized,
      _from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const projectStore = useProjectStore();
      const categoryStore = useCategoryStore();
      const countryStore = useCountryStore();
      await Promise.all([
        projectStore.load(),
        categoryStore.load(),
        countryStore.load(),
      ]);
      next();
    },
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

// Removing the beforeEach guard that was causing navigation delays
// Data initialization is handled within the components that need it (e.g., ProjectListView mounted hook)

export default router;


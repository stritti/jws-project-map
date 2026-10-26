import { watch } from "vue";
import { useI18n } from "vue-i18n";
import type { Router, RouteLocationNormalizedLoaded } from "vue-router";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { parseProjectId } from "@/utils/slug";

/**
 * Update document.title on route changes.
 * Must be called from within a component setup (uses useI18n).
 *
 * Kept separate from useAccessibility so that the project store
 * (and its NocoDB service dependency chain) is not pulled into
 * every component that only needs focus or announcement helpers.
 */
export function useProjectPageTitle(router: Router): void {
  const { t } = useI18n();
  const projectStore = useProjectStore();

  function updateTitle(route: RouteLocationNormalizedLoaded) {
    const projectId = route.params.projectId;
    if (projectId) {
      const id = parseProjectId(String(projectId));
      const project = projectStore.projects.find((p) => p.id === id);
      const name = project?.name ?? String(projectId);
      document.title = `${name} — JWS Project Map`;
    } else {
      // Map route titles by path
      const path = route.path;
      let viewName: string;
      if (path === "/" || path === "") {
        viewName = t("nav.map");
      } else if (path.startsWith("/project")) {
        viewName = t("nav.list");
      } else {
        viewName = "JWS Project Map";
      }
      document.title = `${viewName} — JWS Project Map`;
    }
  }

  // Set title on init
  updateTitle(router.currentRoute.value);

  // Recompute title when project data arrives for an already-open project route.
  watch(
    () => {
      const route = router.currentRoute.value;
      const projectId = route.params.projectId;

      if (!projectId) {
        return [route.path, null];
      }

      const id = parseProjectId(String(projectId));
      const project = projectStore.projects.find((p) => p.id === id);
      return [route.path, project?.id ?? null, project?.name ?? null];
    },
    () => {
      if (router.currentRoute.value.params.projectId) {
        updateTitle(router.currentRoute.value);
      }
    },
  );

  // Update on every route change
  router.afterEach((to) => {
    updateTitle(to);
  });
}

import { computed } from "vue";
import { useHead } from "@unhead/vue";
import { useI18n } from "vue-i18n";
import type { Router } from "vue-router";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { parseProjectId } from "@/utils/slug";

/**
 * Update the document title (and the matching social tags) on route changes.
 * Must be called from within a component setup (uses useI18n).
 *
 * Uses unhead so the title is rendered into the prerendered (SSG) HTML and
 * updated on client-side navigation.
 *
 * Kept separate from useAccessibility so that the project store
 * (and its NocoDB service dependency chain) is not pulled into
 * every component that only needs focus or announcement helpers.
 */
export function useProjectPageTitle(router: Router): void {
  const { t } = useI18n();
  const projectStore = useProjectStore();

  const title = computed(() => {
    const route = router.currentRoute.value;
    const projectId = route.params.projectId;
    if (projectId) {
      const id = parseProjectId(String(projectId));
      const project = projectStore.projects.find((p) => p.id === id);
      const name = project?.name ?? String(projectId);
      return `${name} — JWS Project Map`;
    }

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
    return `${viewName} — JWS Project Map`;
  });

  useHead({
    title,
    meta: [
      { property: "og:title", content: title },
      { name: "twitter:title", content: title },
    ],
  });
}

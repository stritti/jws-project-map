import Fuse from "fuse.js";
import { computed, ref, type Ref } from "vue";
import type { Project } from "@/interfaces/Project";

const DEFAULT_MAX_RESULTS = 20;

export type ProjectState = "all" | "planned" | "under construction" | "finished";

export function useProjectSearch(projects: Ref<Project[]>, options?: { limit?: number }) {
  const query = ref("");
  const stateFilter = ref<ProjectState>("all");
  const limit = options?.limit || DEFAULT_MAX_RESULTS;

  const fuse = computed(
    () =>
      new Fuse(projects.value, {
        threshold: 0.35,
        minMatchCharLength: 2,
        includeScore: true,
        keys: [
          { name: "name", weight: 3 },
          { name: "notes", weight: 1 },
          { name: "state", weight: 1 },
          { name: "country.Name", weight: 2 },
          { name: "category.Name", weight: 2 },
        ],
      }),
  );

  const results = computed<Project[]>(() => {
    const q = query.value.trim();
    let filteredProjects: Project[];

    if (q.length < 2) {
      filteredProjects = projects.value;
    } else {
      filteredProjects = fuse.value
        .search(q, { limit })
        .map((r) => r.item);
    }

    // Apply state filter
    if (stateFilter.value !== "all") {
      filteredProjects = filteredProjects.filter(
        (p) => p.state === stateFilter.value
      );
    }

    return filteredProjects;
  });

  function reset() {
    query.value = "";
    stateFilter.value = "all";
  }

  return { query, stateFilter, results, reset };
}

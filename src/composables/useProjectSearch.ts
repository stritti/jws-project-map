import Fuse from "fuse.js";
import { computed, ref, type Ref } from "vue";
import type { Project } from "@/interfaces/Project";

const MAX_RESULTS = 20;

export function useProjectSearch(projects: Ref<Project[]>) {
  const query = ref("");

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
    if (q.length < 2) return [];
    return fuse.value
      .search(q, { limit: MAX_RESULTS })
      .map((r) => r.item);
  });

  function reset() {
    query.value = "";
  }

  return { query, results, reset };
}

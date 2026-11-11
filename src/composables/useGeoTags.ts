import { computed, type Ref } from "vue";
import { useHead } from "@unhead/vue";
import type { Project } from "@/interfaces/Project";

/**
 * Composable to manage SEO GEO-tags in the document head.
 * Uses unhead so the tags are rendered into prerendered (SSG) HTML and
 * follow the project ref on client-side navigation.
 * @param project Ref to the current project
 */
export function useGeoTags(project: Ref<Project | undefined>) {
  const meta = computed(() => {
    const p = project.value;
    if (!p) return [];
    return [
      { name: "geo.region", content: p.country?.fields.Name || "" },
      { name: "geo.placename", content: p.name },
      { name: "geo.position", content: `${p.latitude};${p.longitude}` },
      { name: "ICBM", content: `${p.latitude}, ${p.longitude}` },
    ];
  });

  useHead({ meta });
}

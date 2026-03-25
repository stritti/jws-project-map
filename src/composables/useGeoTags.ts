import { onUnmounted, watch, type Ref } from "vue";
import type { Project } from "@/interfaces/Project";

/**
 * Composable to manage SEO GEO-tags in the document head.
 * @param project Ref to the current project
 */
export function useGeoTags(project: Ref<Project | undefined>) {
  const metaTags = [
    { name: "geo.region", value: (p: Project) => p.country?.code || "" },
    { name: "geo.placename", value: (p: Project) => p.name },
    { name: "geo.position", value: (p: Project) => `${p.latitude};${p.longitude}` },
    { name: "ICBM", value: (p: Project) => `${p.latitude}, ${p.longitude}` },
  ];

  const updateMetaTags = (p: Project | undefined) => {
    if (!p) {
      removeMetaTags();
      return;
    }

    metaTags.forEach((tag) => {
      let element = document.head.querySelector(`meta[name="${tag.name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("name", tag.name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", tag.value(p));
    });
  };

  const removeMetaTags = () => {
    metaTags.forEach((tag) => {
      const element = document.head.querySelector(`meta[name="${tag.name}"]`);
      if (element) {
        document.head.removeChild(element);
      }
    });
  };

  // Update tags when the project changes
  watch(
    project,
    (newProject) => {
      updateMetaTags(newProject);
    },
    { immediate: true },
  );

  // Clean up when the component is unmounted
  onUnmounted(() => {
    removeMetaTags();
  });
}

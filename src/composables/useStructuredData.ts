import { onUnmounted, watch, type Ref } from "vue";
import type { Project } from "@/interfaces/Project";
import { projectRoute } from "@/utils/slug";

/**
 * Injects/removes `<script type="application/ld+json">` (JSON‑LD structured
 * data) into the document head for a project detail page.
 *
 * Uses schema.org `Place` — a good fit for geo‑located projects.
 */
export function useStructuredData(project: Ref<Project | undefined>) {
  const SCRIPT_ID = "jsonld-structured-data";
  const siteUrl =
    import.meta.env.VITE_SITE_URL ??
    "https://jws-projects-map.netlify.app";

  function buildJsonLd(p: Project): string {
    const url = `${siteUrl}${projectRoute(p)}`;
    const description = p.notes
      ? p.notes.replace(/<[^>]*>/g, "").substring(0, 300)
      : undefined;

    const image =
      p.teaserImg?.[0]?.signedUrl ?? p.gallery?.[0]?.signedUrl ?? undefined;

    const geo =
      p.latitude && p.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: p.latitude,
            longitude: p.longitude,
          }
        : undefined;

    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Place",
      name: p.name,
      identifier: p.id,
      url,
    };

    if (description) schema.description = description;
    if (image) schema.image = image;
    if (geo) schema.geo = geo;

    return JSON.stringify(schema, null, 2);
  }

  function inject(json: string) {
    remove(); // clean up any previous injection
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "application/ld+json";
    script.textContent = json;
    document.head.appendChild(script);
  }

  function remove() {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) existing.remove();
  }

  watch(
    project,
    (p) => {
      if (p) {
        inject(buildJsonLd(p));
      } else {
        remove();
      }
    },
    { immediate: true },
  );

  onUnmounted(() => remove());
}

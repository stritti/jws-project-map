import { computed } from "vue";
import { useHead } from "@unhead/vue";
import type { Router, RouteLocationNormalizedLoaded } from "vue-router";

/**
 * Sets `<link rel="canonical">` (and the matching `og:url`) to the current
 * page's absolute URL on every route change.
 *
 * Call once from App.vue setup. Prevents duplicate‑content issues
 * from query strings, hash fragments, or multiple paths resolving to
 * the same page. Uses unhead so the tags are also part of the
 * prerendered (SSG) HTML.
 */
export function useCanonicalUrl(router: Router) {
  const siteUrl =
    import.meta.env.VITE_SITE_URL ??
    "https://jws-projects-map.netlify.app";

  function buildUrl(route: RouteLocationNormalizedLoaded): string {
    const path = route.path;
    // Root → site root, otherwise strip trailing slash for consistency
    return path === "/" ? siteUrl : `${siteUrl}${path.replace(/\/$/, "")}`;
  }

  const canonical = computed(() => buildUrl(router.currentRoute.value));

  useHead({
    link: [{ rel: "canonical", href: canonical }],
    meta: [{ property: "og:url", content: canonical }],
  });
}

import type { Router, RouteLocationNormalizedLoaded } from "vue-router";

/**
 * Sets `<link rel="canonical">` to the current page's absolute URL
 * on every route change.
 *
 * Call once from App.vue setup.  Prevents duplicate‑content issues
 * from query strings, hash fragments, or multiple paths resolving to
 * the same page.
 */
export function useCanonicalUrl(router: Router) {
  const siteUrl =
    import.meta.env.VITE_SITE_URL ??
    "https://jws-projects-map.netlify.app";

  function setCanonical(url: string) {
    let link = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;
  }

  function buildUrl(route: RouteLocationNormalizedLoaded): string {
    const path = route.path;
    // Root → site root, otherwise strip trailing slash for consistency
    return path === "/" ? siteUrl : `${siteUrl}${path.replace(/\/$/, "")}`;
  }

  // Set on initial route
  setCanonical(buildUrl(router.currentRoute.value));

  // Update on every route change (after slug URLs are in the browser bar)
  router.afterEach((to) => {
    setCanonical(buildUrl(to));
  });
}

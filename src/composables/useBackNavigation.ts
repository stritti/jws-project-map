import { useRouter } from "vue-router";

const HOME_ROUTE = "/";

/**
 * Vue Router stores the previous in-app entry in `history.state.back`. It is
 * `null` for the first app entry — a direct deep link, a bookmark or a hard
 * reload — where `window.history.length > 1` only reflects earlier browser
 * entries outside the app.
 */
export function hasAppHistory(): boolean {
  const state = window.history.state as { back?: unknown } | null;
  return typeof state?.back === "string" && state.back.length > 0;
}

/**
 * Back navigation that never leaves the app: without an in-app predecessor it
 * navigates to `fallback` (the home page with the map) instead of going back
 * to whatever page the browser had before.
 */
export function useBackNavigation(fallback: string = HOME_ROUTE) {
  const router = useRouter();

  function goBack(): void {
    if (hasAppHistory()) {
      router.back();
    } else {
      void router.push(fallback);
    }
  }

  return { goBack, hasAppHistory };
}

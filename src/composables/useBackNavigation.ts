import { useRouter } from "vue-router";

const HOME_ROUTE = "/";

/**
 * Vue Router stores the previous in-app entry in `history.state.back`. It is
 * `null` for the first entry of a navigation the app started itself — a direct
 * deep link, a bookmark or a URL typed into the address bar — where
 * `window.history.length > 1` only reflects earlier browser entries outside
 * the app. A reload keeps the state of the entry it reloads.
 */
export function hasAppHistory(): boolean {
  const state = window.history.state as { back?: unknown } | null;
  return typeof state?.back === "string" && state.back.length > 0;
}

/**
 * Back navigation that never leaves the app: without an in-app predecessor it
 * replaces the current entry with `fallback` (the home page with the map).
 * `replace` rather than `push`, so the page the user wanted to leave does not
 * become the target of the system back gesture one tap later.
 */
export function useBackNavigation(fallback: string = HOME_ROUTE) {
  const router = useRouter();

  function goBack(): void {
    if (hasAppHistory()) {
      router.back();
    } else {
      void router.replace(fallback);
    }
  }

  return { goBack };
}

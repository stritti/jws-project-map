export async function reloadAppWithCacheReset(): Promise<void> {
  try {
    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.allSettled(cacheKeys.map((key) => caches.delete(key)));
    }

    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch (error) {
      console.warn("Could not clear web storage:", error);
    }

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(
        registrations.map((registration) => registration.unregister()),
      );
    }
  } catch (error) {
    console.error("Cache reset failed:", error);
  } finally {
    const reloadUrl = new URL(window.location.href);
    reloadUrl.searchParams.set("cacheBust", String(Date.now()));
    window.location.replace(reloadUrl.toString());
  }
}

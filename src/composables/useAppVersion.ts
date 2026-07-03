import { ref, onMounted } from 'vue';

/**
 * Composable to access the current app version
 * The version is injected by vite-plugin-package-version during build
 */
export function useAppVersion() {
  const version = ref<string>('');

  onMounted(() => {
    // The version is available as a global variable injected by vite-plugin-package-version
    if (typeof window !== 'undefined' && window.__APP_VERSION__) {
      version.value = window.__APP_VERSION__;
    }
  });

  return {
    version,
  };
}

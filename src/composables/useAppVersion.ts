import { ref, onMounted } from 'vue';

/**
 * Composable to access the current app version
 * The version is injected as a global constant during build
 */
export function useAppVersion() {
  const version = ref<string>('');

  onMounted(() => {
    // The version is available as a global constant injected by vite.config.ts
    // It's available as __APP_VERSION__ in the global scope
    if (typeof window !== 'undefined' && window.__APP_VERSION__) {
      version.value = window.__APP_VERSION__;
    }
  });

  return {
    version,
  };
}

import { ref, onMounted } from 'vue';

/**
 * Composable to detect if the application is running inside an iframe.
 */
export function useWebFrame() {
  const isIFrame = ref(false);

  onMounted(() => {
    try {
      // Standard way to detect if the page is in an iframe
      isIFrame.value = window.self !== window.top;
    } catch {
      // In case of security restrictions (e.g., cross-origin top access),
      // we usually assume it IS an iframe if we can't access window.top.
      isIFrame.value = true;
    }
  });

  return {
    isIFrame
  };
}

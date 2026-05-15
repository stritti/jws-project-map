import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export type IFrameMessage =
  | { type: 'navigate'; path: string }
  | { type: 'ready' }
  | { type: 'resize'; height: number }
  | { type: 'navigateRequest'; path: string; projectId?: number };

/**
 * Composable to detect if the application is running inside an iframe
 * and manage postMessage communication with the parent frame.
 *
 * Detection is synchronous (no onMounted) so downstream components can
 * use `isIFrame.value` during setup, avoiding flash-of-wrong-layout.
 *
 * URL query parameter `?embed=1` or `?iframe=1` overrides auto-detection.
 */
export function useWebFrame() {
  const isIFrame = ref(false);
  const router = useRouter();

  // ── Synchronous detection ────────────────────────────
  function detectIFrame(): boolean {
    // 1. URL param override (allows testing without actual iframe)
    const params = new URLSearchParams(window.location.search);
    if (params.get('embed') === '1' || params.get('iframe') === '1') {
      return true;
    }
    // 2. Standard browser detection
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  isIFrame.value = detectIFrame();

  // ── Apply CSS class to <html> ────────────────────────
  if (isIFrame.value) {
    document.documentElement.classList.add('is-iframe');
    // Prevent overscroll/bounce in iframe
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
  }

  // ── postMessage handlers ─────────────────────────────
  function handleMessage(event: MessageEvent) {
    const msg = event.data as IFrameMessage;
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'navigate':
        // Parent tells us to navigate to a path
        if (msg.path && router) {
          router.push(msg.path);
        }
        break;
    }
  }

  function postMessage(msg: IFrameMessage) {
    if (!isIFrame.value) return;
    try {
      window.parent.postMessage(msg, '*');
    } catch {
      // Silently fail if parent is unreachable
    }
  }

  // ── Lifecycle ────────────────────────────────────────
  onMounted(() => {
    window.addEventListener('message', handleMessage);

    // Signal parent that we're ready
    postMessage({ type: 'ready' });

    // Observe height changes and report them (for auto-resize of iframe)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = Math.ceil(entry.contentRect.height);
        postMessage({ type: 'resize', height });
        break;
      }
    });

    // Observe the app wrapper for height changes
    const appElement = document.getElementById('app');
    if (appElement) {
      resizeObserver.observe(appElement);
    } else {
      // Fallback: observe body
      resizeObserver.observe(document.body);
    }
  });

  onUnmounted(() => {
    window.removeEventListener('message', handleMessage);
  });

  /**
   * Call this when the user navigates so the parent frame can react
   * (e.g., update URL or highlight a nav item).
   */
  function notifyNavigate(path: string, projectId?: number) {
    postMessage({ type: 'navigateRequest', path, projectId });
  }

  /**
   * Navigate to a project detail page.
   *
   * Inside an iframe the detail opens in a new browser tab (window.open)
   * so the parent page stays in place. Outside an iframe the app navigates
   * in-place via the router as before.
   */
  function navigateToProject(projectId: number | string): void {
    const path = `/project/${projectId}`;
    if (isIFrame.value) {
      notifyNavigate(path, Number(projectId));
      const url = router.resolve(path).href;
      window.open(url, '_blank');
    } else {
      router.push(path);
    }
  }

  return {
    isIFrame,
    notifyNavigate,
    postMessage,
    navigateToProject,
  };
}

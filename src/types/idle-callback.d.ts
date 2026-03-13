// Typdeklaration für requestIdleCallback
interface Window {
  requestIdleCallback(
    callback: (deadline: {
      didTimeout: boolean;
      timeRemaining: () => number;
    }) => void,
    options?: { timeout: number }
  ): number;
  cancelIdleCallback(handle: number): void;
}

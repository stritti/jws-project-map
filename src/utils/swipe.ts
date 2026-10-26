/**
 * Swipe gesture resolution for the fullscreen gallery.
 *
 * Kept free of DOM access so the thresholds can be unit tested: a horizontal
 * drag has to be either long enough or fast enough to count, and it must be
 * clearly more horizontal than vertical so a sloppy diagonal does not flip
 * the image while the user meant to scroll.
 */

export interface SwipeGesture {
  /** Horizontal distance in px; negative is a leftward drag. */
  dx: number;
  /** Vertical distance in px. */
  dy: number;
  /** Gesture duration in ms. */
  durationMs: number;
}

export interface SwipeOptions {
  /** Distance that always counts as a swipe. */
  minDistance?: number;
  /** Speed in px/ms that counts even below `minDistance` (a flick). */
  minVelocity?: number;
  /** How much more horizontal than vertical the gesture has to be. */
  axisRatio?: number;
}

export type SwipeDirection = "next" | "previous";

const DEFAULTS: Required<SwipeOptions> = {
  minDistance: 50,
  minVelocity: 0.35,
  axisRatio: 1.2,
};

/**
 * Resolve a pointer/touch gesture into a gallery step.
 *
 * Swiping left advances to the next image, swiping right goes back, matching
 * the arrow keys and the on-screen arrow buttons.
 */
export function resolveSwipe(
  gesture: SwipeGesture,
  options: SwipeOptions = {},
): SwipeDirection | null {
  const { minDistance, minVelocity, axisRatio } = { ...DEFAULTS, ...options };
  const { dx, dy, durationMs } = gesture;

  const distance = Math.abs(dx);
  const velocity = distance / Math.max(durationMs, 1);

  const isLongEnough = distance >= minDistance;
  const isFastEnough = velocity >= minVelocity;
  if (!isLongEnough && !isFastEnough) return null;

  // A gesture that travelled further vertically than horizontally was a
  // scroll or a pinch, not an image change.
  if (distance <= Math.abs(dy) * axisRatio) return null;

  return dx < 0 ? "next" : "previous";
}

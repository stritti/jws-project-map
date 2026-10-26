/**
 * Scroll lock for fullscreen overlays.
 *
 * Locks the document without losing the scroll position. The body is pinned
 * with `position: fixed` offset by the current scroll offset — the only variant
 * that also holds on iOS Safari, where `overflow: hidden` on the body is
 * ignored. The scrollbar width is compensated so the page behind does not shift,
 * and every inline style is restored verbatim on unlock.
 *
 * Locks nest: only the outermost lock touches the DOM.
 *
 * While locked, `window.scrollY` reads 0. Scroll-driven layout must ignore those
 * events (see `isScrollLocked`) — otherwise a collapsing header would reflow the
 * page under the overlay and shift the restored scroll position.
 */

const LOCKED_PROPERTIES = [
  "position",
  "top",
  "left",
  "right",
  "width",
  "overflow",
  "paddingRight",
] as const;

type LockedProperty = (typeof LOCKED_PROPERTIES)[number];
type SavedStyles = Record<LockedProperty, string>;

let lockCount = 0;
let savedStyles: SavedStyles | null = null;
let savedScrollY = 0;

function applyLock(): void {
  const body = document.body;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  savedScrollY = window.scrollY;
  savedStyles = LOCKED_PROPERTIES.reduce((styles, property) => {
    styles[property] = body.style[property];
    return styles;
  }, {} as SavedStyles);

  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

function releaseLock(): void {
  const body = document.body;
  const styles = savedStyles;
  const scrollY = savedScrollY;

  savedStyles = null;
  savedScrollY = 0;

  if (styles) {
    for (const property of LOCKED_PROPERTIES) {
      body.style[property] = styles[property];
    }
  }

  // Restore the scroll position, bypassing any smooth-scroll behaviour.
  const html = document.documentElement;
  const previousBehaviour = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, scrollY);
  html.style.scrollBehavior = previousBehaviour;
}

export function useScrollLock() {
  let held = false;

  function lock(): void {
    if (held) return;
    held = true;
    lockCount += 1;
    if (lockCount === 1) applyLock();
  }

  function unlock(): void {
    if (!held) return;
    held = false;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0 && savedStyles) releaseLock();
  }

  return { lock, unlock };
}

/**
 * Whether the document scroll is currently frozen by a lock. Scroll handlers
 * that drive layout must bail out while this is true.
 */
export function isScrollLocked(): boolean {
  return lockCount > 0;
}

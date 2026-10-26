import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollLock, isScrollLocked } from "@/composables/useScrollLock";

type Lock = ReturnType<typeof useScrollLock>;

function setScrollY(value: number): void {
  Object.defineProperty(window, "scrollY", { value, configurable: true });
}

function setScrollbarWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", { value: 1015, configurable: true });
  Object.defineProperty(document.documentElement, "clientWidth", {
    value: 1015 - width,
    configurable: true,
  });
}

describe("useScrollLock", () => {
  const held: Lock[] = [];
  let scrollTo: ReturnType<typeof vi.spyOn>;

  // Every lock is released again so the module-level counter starts at zero.
  function lockScroll(): Lock {
    const lock = useScrollLock();
    held.push(lock);
    return lock;
  }

  beforeEach(() => {
    document.body.removeAttribute("style");
    setScrollY(0);
    setScrollbarWidth(15);
    scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    held.splice(0).forEach((lock) => lock.unlock());
    scrollTo.mockRestore();
    document.body.removeAttribute("style");
  });

  it("pins the body at the current scroll offset", () => {
    setScrollY(640);

    lockScroll().lock();

    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-640px");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.width).toBe("100%");
  });

  it("compensates the scrollbar so the page behind does not shift", () => {
    lockScroll().lock();

    expect(document.body.style.paddingRight).toBe("15px");
  });

  it("restores every inline style and the scroll position on unlock", () => {
    document.body.style.overflow = "scroll";
    document.body.style.margin = "0 auto";
    setScrollY(1200);
    const lock = lockScroll();

    lock.lock();
    lock.unlock();

    expect(document.body.style.position).toBe("");
    expect(document.body.style.top).toBe("");
    expect(document.body.style.paddingRight).toBe("");
    // Pre-existing inline styles survive untouched.
    expect(document.body.style.overflow).toBe("scroll");
    expect(document.body.style.margin).toBe("0px auto");
    expect(scrollTo).toHaveBeenCalledWith(0, 1200);
  });

  it("keeps the body locked until the last holder releases", () => {
    const first = lockScroll();
    const second = lockScroll();

    first.lock();
    second.lock();
    first.unlock();

    expect(document.body.style.position).toBe("fixed");

    second.unlock();

    expect(document.body.style.position).toBe("");
  });

  it("ignores a repeated unlock", () => {
    const lock = lockScroll();

    lock.lock();
    lock.unlock();
    lock.unlock();

    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it("reports the locked state so scroll-driven layout can pause", () => {
    const lock = lockScroll();

    expect(isScrollLocked()).toBe(false);

    lock.lock();
    expect(isScrollLocked()).toBe(true);

    lock.unlock();
    expect(isScrollLocked()).toBe(false);
  });

  it("stays reported as locked until the last holder releases", () => {
    const first = lockScroll();
    const second = lockScroll();

    first.lock();
    second.lock();
    first.unlock();
    expect(isScrollLocked()).toBe(true);

    second.unlock();
    expect(isScrollLocked()).toBe(false);
  });
});

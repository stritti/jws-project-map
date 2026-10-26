import { describe, expect, it } from "vitest";
import { resolveSwipe } from "@/utils/swipe";

describe("resolveSwipe", () => {
  it("ignores a short, slow drag", () => {
    expect(resolveSwipe({ dx: -30, dy: 4, durationMs: 600 })).toBeNull();
  });

  it("advances on a long left drag", () => {
    expect(resolveSwipe({ dx: -120, dy: 10, durationMs: 500 })).toBe("next");
  });

  it("goes back on a long right drag", () => {
    expect(resolveSwipe({ dx: 120, dy: 10, durationMs: 500 })).toBe("previous");
  });

  it("accepts a fast flick below the distance threshold", () => {
    // 30px in 40ms is 0.75 px/ms, well above the flick velocity.
    expect(resolveSwipe({ dx: -30, dy: 2, durationMs: 40 })).toBe("next");
  });

  it("rejects a vertical scroll", () => {
    expect(resolveSwipe({ dx: -70, dy: 180, durationMs: 400 })).toBeNull();
  });

  it("accepts a diagonal that is still clearly horizontal", () => {
    expect(resolveSwipe({ dx: -120, dy: 60, durationMs: 400 })).toBe("next");
  });

  it("rejects a diagonal that is not clearly horizontal", () => {
    expect(resolveSwipe({ dx: -60, dy: 60, durationMs: 400 })).toBeNull();
  });

  it("does not divide by zero on an instant gesture", () => {
    expect(resolveSwipe({ dx: -80, dy: 0, durationMs: 0 })).toBe("next");
  });

  it("honours custom thresholds", () => {
    expect(
      resolveSwipe(
        { dx: -40, dy: 0, durationMs: 800 },
        { minDistance: 30, minVelocity: 1 },
      ),
    ).toBe("next");
    expect(
      resolveSwipe(
        { dx: -80, dy: 0, durationMs: 400 },
        { minDistance: 100, minVelocity: 1 },
      ),
    ).toBeNull();
  });
});

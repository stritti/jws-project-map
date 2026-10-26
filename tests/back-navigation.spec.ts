import { beforeEach, describe, expect, it, vi } from "vitest";

const back = vi.fn();
const push = vi.fn();
const replace = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ back, push, replace }),
}));

import {
  hasAppHistory,
  useBackNavigation,
} from "@/composables/useBackNavigation";

describe("back navigation", () => {
  beforeEach(() => {
    back.mockReset();
    push.mockReset();
    replace.mockReset();
    window.history.replaceState(null, "");
  });

  it("has no app history when history.state is empty", () => {
    expect(hasAppHistory()).toBe(false);
  });

  it("goes back when the app has a previous entry", () => {
    window.history.replaceState({ back: "/project/", current: "/project/1" }, "");
    expect(hasAppHistory()).toBe(true);
    useBackNavigation().goBack();
    expect(back).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("replaces the entry on a direct deep link instead of pushing", () => {
    // Shape vue-router writes for the first entry of a fresh navigation.
    window.history.replaceState(
      {
        back: null,
        current: "/project/gui-boke-102",
        forward: null,
        position: 0,
        replaced: true,
      },
      "",
    );
    useBackNavigation().goBack();
    expect(back).not.toHaveBeenCalled();
    // push would make the detail page the target of the system back gesture
    // one tap later, which is the complaint this fix is about.
    expect(push).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("accepts a custom fallback route", () => {
    useBackNavigation("/project/").goBack();
    expect(replace).toHaveBeenCalledWith("/project/");
  });

  // A native <button> turns Enter and Space into one click by itself. jsdom
  // does not synthesise that click, so "one key press navigates once" is
  // verified in the browser, not here.
});

describe("hasAppHistory", () => {
  it("ignores a non-string or empty back entry", () => {
    window.history.replaceState({ back: 42 }, "");
    expect(hasAppHistory()).toBe(false);
    window.history.replaceState({ back: "" }, "");
    expect(hasAppHistory()).toBe(false);
  });
});

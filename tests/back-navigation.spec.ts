import { beforeEach, describe, expect, it, vi } from "vitest";

const back = vi.fn();
const push = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ back, push }),
}));

import {
  hasAppHistory,
  useBackNavigation,
} from "@/composables/useBackNavigation";

describe("back navigation", () => {
  beforeEach(() => {
    back.mockReset();
    push.mockReset();
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
  });

  it("navigates to the home page on a direct deep link", () => {
    // Shape vue-router writes for the first entry of a fresh navigation.
    window.history.replaceState(
      {
        back: null,
        current: "/project/gui-boke-102",
        forward: null,
        position: 6,
        replaced: true,
      },
      "",
    );
    useBackNavigation().goBack();
    expect(back).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/");
  });

  it("accepts a custom fallback route", () => {
    useBackNavigation("/project/").goBack();
    expect(push).toHaveBeenCalledWith("/project/");
  });
});

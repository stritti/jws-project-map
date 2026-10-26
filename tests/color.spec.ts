import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  hexToRgb,
  readableTextColor,
  relativeLuminance,
} from "@/utils/color";

describe("hexToRgb", () => {
  it("parses six-digit hex with and without a leading hash", () => {
    expect(hexToRgb("#3d5e9e")).toEqual([61, 94, 158]);
    expect(hexToRgb("3d5e9e")).toEqual([61, 94, 158]);
  });

  it("expands three-digit hex", () => {
    expect(hexToRgb("#fff")).toEqual([255, 255, 255]);
  });

  it("rejects unparseable values", () => {
    expect(hexToRgb("rebeccapurple")).toBeNull();
    expect(hexToRgb("#12345")).toBeNull();
  });
});

describe("relativeLuminance", () => {
  it("matches the WCAG reference values", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });

  it("returns null for unparseable input", () => {
    expect(relativeLuminance("not-a-colour")).toBeNull();
  });
});

describe("contrastRatio", () => {
  it("is 21:1 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#3d5e9e", "#ffffff")).toBeCloseTo(
      contrastRatio("#ffffff", "#3d5e9e") as number,
      5,
    );
  });
});

describe("readableTextColor", () => {
  it("keeps white text on the brand blue", () => {
    expect(readableTextColor("#3d5e9e")).toBe("#ffffff");
  });

  it("falls back to dark text on light colours", () => {
    expect(readableTextColor("#f0f0f0")).toBe("#212529");
    expect(readableTextColor("#ffff00")).toBe("#212529");
  });

  it("chooses dark text on a mid-tone orange that white text would fail", () => {
    // #ff6a00 is a real category colour; white on it is only 2.9:1.
    expect(contrastRatio("#ffffff", "#ff6a00")).toBeLessThan(3);
    expect(readableTextColor("#ff6a00")).toBe("#212529");
  });

  it("defaults to the light foreground for unparseable colours", () => {
    expect(readableTextColor("rgb(255, 255, 255)")).toBe("#ffffff");
  });
});

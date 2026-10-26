import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  cssColorToRgb,
  readableTextColor,
  relativeLuminance,
} from "@/utils/color";

describe("cssColorToRgb", () => {
  it("parses six-digit hex with and without a leading hash", () => {
    expect(cssColorToRgb("#3d5e9e")).toEqual([61, 94, 158]);
    expect(cssColorToRgb("3d5e9e")).toEqual([61, 94, 158]);
  });

  it("expands three-digit hex", () => {
    expect(cssColorToRgb("#fff")).toEqual([255, 255, 255]);
  });

  it("rejects unparseable values", () => {
    expect(cssColorToRgb("rebeccapurple")).toBeNull();
    expect(cssColorToRgb("#12345")).toBeNull();
  });

  it("parses rgb() and rgba()", () => {
    expect(cssColorToRgb("rgb(255, 106, 0)")).toEqual([255, 106, 0]);
    expect(cssColorToRgb("rgba(255, 106, 0, 0.5)")).toEqual([255, 106, 0]);
    expect(cssColorToRgb("rgb(255 106 0 / 50%)")).toEqual([255, 106, 0]);
  });

  it("parses percentage channels", () => {
    expect(cssColorToRgb("rgb(100%, 0%, 0%)")).toEqual([255, 0, 0]);
  });

  it("ignores the alpha channel of four- and eight-digit hex", () => {
    expect(cssColorToRgb("#ff6a0080")).toEqual([255, 106, 0]);
    expect(cssColorToRgb("#f008")).toEqual([255, 0, 0]);
  });

  it("returns null for values it cannot read", () => {
    expect(cssColorToRgb("rebeccapurple")).toBeNull();
    expect(cssColorToRgb("rgb(1, 2)")).toBeNull();
    expect(cssColorToRgb("rgb(a, b, c)")).toBeNull();
  });
});

describe("relativeLuminance", () => {
  it("matches the WCAG reference values", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });

  it("accepts rgb() notation", () => {
    expect(relativeLuminance("rgb(255, 255, 255)")).toBeCloseTo(1, 5);
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

  it("reads the same colour written as rgb()", () => {
    expect(readableTextColor("rgb(255, 106, 0)")).toBe("#212529");
    expect(readableTextColor("rgb(61, 94, 158)")).toBe("#ffffff");
  });

  it("still fails AA-adjacent colours gracefully instead of throwing", () => {
    // Mid grey: neither candidate reaches 4.5:1 — the better one still wins.
    expect(contrastRatio("#ffffff", "#808080")).toBeCloseTo(3.95, 1);
    expect(contrastRatio("#212529", "#808080")).toBeCloseTo(3.9, 1);
    expect(readableTextColor("#808080")).toBe("#ffffff");
  });

  it("defaults to the light foreground for unreadable colours", () => {
    expect(readableTextColor("rebeccapurple")).toBe("#ffffff");
  });
});

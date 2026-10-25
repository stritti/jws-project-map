import { describe, expect, it } from "vitest";
import { slugify } from "@/utils/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Solar Powered Water Pump")).toBe("solar-powered-water-pump");
  });

  it("removes special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("collapses multiple hyphens and spaces", () => {
    expect(slugify("  a   --  b  ")).toBe("a-b");
  });

  it("caps the length at 80 characters", () => {
    expect(slugify("x".repeat(120)).length).toBeLessThanOrEqual(80);
  });

  it("strips umlaut characters", () => {
    expect(slugify("Grüße aus Köln")).toBe("gre-aus-kln");
  });
});

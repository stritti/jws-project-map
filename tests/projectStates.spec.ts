import { describe, expect, it } from "vitest";
import {
  ALL_PROJECT_STATES,
  PROJECT_STATES,
  isValidProjectState,
  normaliseProjectState,
} from "@/constants/projectStates";

describe("projectStates", () => {
  it("exposes all canonical states", () => {
    expect(ALL_PROJECT_STATES).toEqual([
      PROJECT_STATES.FINISHED,
      PROJECT_STATES.UNDER_CONSTRUCTION,
      PROJECT_STATES.PLANNED,
    ]);
  });

  it("validates known states", () => {
    expect(isValidProjectState("finished")).toBe(true);
    expect(isValidProjectState("planned")).toBe(true);
    expect(isValidProjectState("under construction")).toBe(true);
    expect(isValidProjectState("on hold")).toBe(false);
    expect(isValidProjectState("")).toBe(false);
  });

  describe("normaliseProjectState", () => {
    it("maps canonical values unchanged", () => {
      expect(normaliseProjectState("finished")).toBe(PROJECT_STATES.FINISHED);
      expect(normaliseProjectState("planned")).toBe(PROJECT_STATES.PLANNED);
      expect(normaliseProjectState("under construction")).toBe(
        PROJECT_STATES.UNDER_CONSTRUCTION,
      );
    });

    it("maps common variants", () => {
      expect(normaliseProjectState("under_construction")).toBe(
        PROJECT_STATES.UNDER_CONSTRUCTION,
      );
      expect(normaliseProjectState("construction")).toBe(
        PROJECT_STATES.UNDER_CONSTRUCTION,
      );
    });

    it("is case-insensitive and trims whitespace", () => {
      expect(normaliseProjectState("  PLANNED  ")).toBe(PROJECT_STATES.PLANNED);
      expect(normaliseProjectState("Construction")).toBe(
        PROJECT_STATES.UNDER_CONSTRUCTION,
      );
    });

    it("falls back to FINISHED for unknown values (documented behaviour)", () => {
      expect(normaliseProjectState("on hold")).toBe(PROJECT_STATES.FINISHED);
      expect(normaliseProjectState("")).toBe(PROJECT_STATES.FINISHED);
      expect(normaliseProjectState("unknown-state")).toBe(
        PROJECT_STATES.FINISHED,
      );
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMapData = vi.fn();
const fetchFull = vi.fn();

vi.mock("@/features/projects/repositories/project.repository", () => ({
  projectRepository: {
    fetchMapData: (...args: unknown[]) => fetchMapData(...args),
    fetchFull: (...args: unknown[]) => fetchFull(...args),
  },
}));

vi.mock("@/plugins/i18n", () => ({
  i18n: { global: { t: (key: string) => (key === "project.unnamed" ? "Unnamed" : key) } },
}));

import projectService from "@/features/projects/services/project.service";
import type { RawProjectRecord } from "@/features/projects/repositories/project.repository";

function makeRecord(overrides: Partial<RawProjectRecord> = {}): RawProjectRecord {
  return {
    id: 1,
    Latitude: 10.5,
    Longitude: 20.25,
    Name: "Test Project",
    State: "finished",
    ...overrides,
  } as RawProjectRecord;
}

describe("projectService data transformation", () => {
  beforeEach(() => {
    fetchMapData.mockReset();
    fetchFull.mockReset();
  });

  it("maps flat records into Project objects", async () => {
    fetchMapData.mockResolvedValue([makeRecord()]);
    const result = await projectService.getMapData();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 1,
      name: "Test Project",
      latitude: 10.5,
      longitude: 20.25,
      state: "finished",
    });
  });

  it("reads records from the nested fields wrapper", async () => {
    fetchFull.mockResolvedValue([
      makeRecord({ fields: { Name: "Wrapped", Latitude: 1, Longitude: 2, State: "planned" } }),
    ]);
    const result = await projectService.getAll();
    expect(result[0]).toMatchObject({ name: "Wrapped", latitude: 1, longitude: 2, state: "planned" });
  });

  it("skips records without a resolvable id", async () => {
    fetchMapData.mockResolvedValue([
      makeRecord({ id: "invalid" as unknown as number, Id: undefined }),
    ]);
    const result = await projectService.getMapData();
    expect(result).toHaveLength(0);
  });

  it("skips records with invalid coordinates", async () => {
    fetchMapData.mockResolvedValue([makeRecord({ Latitude: "abc" as unknown as number })]);
    const result = await projectService.getMapData();
    expect(result).toHaveLength(0);
  });

  it("falls back to the Name field when the locale field is missing", async () => {
    fetchMapData.mockResolvedValue([makeRecord({ Name: "Fallback Name" })]);
    const result = await projectService.getMapData();
    expect(result[0]?.name).toBe("Fallback Name");
  });

  it("provides a fallback name when no name field exists", async () => {
    fetchMapData.mockResolvedValue([makeRecord({ Name: undefined })]);
    const result = await projectService.getMapData();
    expect(typeof result[0]?.name).toBe("string");
    expect(result[0]?.name.length).toBeGreaterThan(0);
  });

  it("accepts a numeric string id and Id field variants", async () => {
    fetchMapData.mockResolvedValue([makeRecord({ id: "42" as unknown as number })]);
    const result = await projectService.getMapData();
    expect(result[0]?.id).toBe(42);
  });

  it("returns an empty array for non-array input", async () => {
    fetchMapData.mockResolvedValue(undefined);
    const result = await projectService.getMapData();
    expect(result).toEqual([]);
  });
});

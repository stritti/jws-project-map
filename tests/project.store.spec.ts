import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const getAll = vi.fn();
const getMapData = vi.fn();

vi.mock("@/features/projects/services/project.service", () => ({
  default: {
    getAll: (...args: unknown[]) => getAll(...args),
    getMapData: (...args: unknown[]) => getMapData(...args),
  },
}));

import { useProjectStore } from "@/features/projects/stores/project.store";
import type { Project } from "@/interfaces/Project";

function makeProject(id: number): Project {
  return {
    id,
    name: `Project ${id}`,
    latitude: 1,
    longitude: 2,
    state: "finished",
    category: undefined,
    country: undefined,
    notes: "",
    link: undefined,
  };
}

describe("project store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    getAll.mockReset();
    getMapData.mockReset();
  });

  it("marks store initialized on empty successful result", async () => {
    getAll.mockResolvedValue([]);
    const store = useProjectStore();
    await store.load();
    expect(store.initialized).toBe(true);
    expect(store.projects).toEqual([]);
    expect(store.error).toBeNull();
  });

  it("stores the projects on successful result", async () => {
    const projects = [makeProject(1), makeProject(2)];
    getAll.mockResolvedValue(projects);
    const store = useProjectStore();
    await store.load();
    expect(store.initialized).toBe(true);
    expect(store.projects).toEqual(projects);
  });

  it("exposes error and stays uninitialized on failure", async () => {
    getAll.mockRejectedValue(new Error("api down"));
    const store = useProjectStore();
    await store.load();
    expect(store.initialized).toBe(false);
    expect(store.error).toBeInstanceOf(Error);
    expect(store.error?.message).toBe("api down");
  });

  it("exposes mapError when map data fails", async () => {
    getMapData.mockRejectedValue(new Error("map api down"));
    const store = useProjectStore();
    await store.loadMapData();
    expect(store.mapInitialized).toBe(false);
    expect(store.mapError).toBeInstanceOf(Error);
  });

  it("does not reload once initialized", async () => {
    getAll.mockResolvedValue([makeProject(1)]);
    const store = useProjectStore();
    await store.load();
    await store.load();
    expect(getAll).toHaveBeenCalledTimes(1);
  });
});

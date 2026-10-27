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

  it("shares one in-flight request between concurrent callers", async () => {
    let resolveAll!: (value: Project[]) => void;
    getAll.mockImplementation(
      () => new Promise<Project[]>((resolve) => (resolveAll = resolve)),
    );
    const store = useProjectStore();
    const first = store.load();
    const second = store.load();
    expect(getAll).toHaveBeenCalledTimes(1);
    expect(store.loading).toBe(true);
    resolveAll([makeProject(1)]);
    await Promise.all([first, second]);
    expect(store.projects).toHaveLength(1);
    expect(store.loading).toBe(false);
  });

  it("does not drop a load requested while the map data is loading", async () => {
    let resolveMap!: (value: Project[]) => void;
    getMapData.mockImplementation(
      () => new Promise<Project[]>((resolve) => (resolveMap = resolve)),
    );
    getAll.mockResolvedValue([makeProject(1)]);
    const store = useProjectStore();
    const mapLoad = store.loadMapData();
    expect(store.mapLoading).toBe(true);
    await store.load();
    expect(getAll).toHaveBeenCalledTimes(1);
    expect(store.initialized).toBe(true);
    resolveMap([makeProject(1)]);
    await mapLoad;
  });

  it("shares one in-flight map request", async () => {
    let resolveMap!: (value: Project[]) => void;
    getMapData.mockImplementation(
      () => new Promise<Project[]>((resolve) => (resolveMap = resolve)),
    );
    const store = useProjectStore();
    const first = store.loadMapData();
    const second = store.loadMapData();
    expect(getMapData).toHaveBeenCalledTimes(1);
    resolveMap([makeProject(1)]);
    await Promise.all([first, second]);
    expect(store.mapProjects).toHaveLength(1);
  });

  it("recovers on a forced retry after a failure", async () => {
    getAll.mockRejectedValueOnce(new Error("timeout of 30000ms exceeded"));
    getAll.mockResolvedValueOnce([makeProject(7)]);
    const store = useProjectStore();
    await store.load();
    expect(store.error?.message).toContain("timeout");
    expect(store.initialized).toBe(false);
    await store.load({ force: true });
    expect(store.error).toBeNull();
    expect(store.initialized).toBe(true);
    expect(store.projects).toHaveLength(1);
  });

  it("keeps the full project list when the map request resolves last", async () => {
    let resolveMap!: (value: Project[]) => void;
    getMapData.mockImplementation(
      () => new Promise<Project[]>((resolve) => (resolveMap = resolve)),
    );
    getAll.mockResolvedValue([makeProject(1), makeProject(2)]);
    const store = useProjectStore();

    const mapLoad = store.loadMapData();
    await store.load();
    // The map payload arrives after the full load has already landed.
    resolveMap([makeProject(9)]);
    await mapLoad;

    expect(store.mapProjects).toEqual([makeProject(9)]);
    expect(store.projects).toEqual([makeProject(1), makeProject(2)]);
    expect(store.filteredList).toEqual([makeProject(1), makeProject(2)]);
  });
});

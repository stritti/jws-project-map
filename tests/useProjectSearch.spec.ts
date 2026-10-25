import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useProjectSearch } from "@/composables/useProjectSearch";
import { PROJECT_STATES } from "@/constants/projectStates";
import type { Project } from "@/interfaces/Project";

function makeProject(id: number, name: string, state: string, notes = ""): Project {
  return {
    id,
    name,
    latitude: 1,
    longitude: 2,
    state,
    category: undefined,
    country: undefined,
    notes,
    link: undefined,
  };
}

const projects = ref<Project[]>([
  makeProject(1, "Solar Water Pump", PROJECT_STATES.FINISHED, "A pump for the village"),
  makeProject(2, "School Building", PROJECT_STATES.UNDER_CONSTRUCTION, "New classrooms"),
  makeProject(3, "Midwife Training", PROJECT_STATES.PLANNED, "Healthcare training"),
]);

describe("useProjectSearch", () => {
  it("returns all projects with an empty query", () => {
    const { results } = useProjectSearch(projects);
    expect(results.value).toHaveLength(3);
  });

  it("returns all projects for a single-character query (below min length)", () => {
    const { query, results } = useProjectSearch(projects);
    query.value = "s";
    expect(results.value).toHaveLength(3);
  });

  it("finds projects by name", () => {
    const { query, results } = useProjectSearch(projects);
    query.value = "solar";
    expect(results.value.map((p) => p.id)).toContain(1);
    expect(results.value).not.toContainEqual(expect.objectContaining({ id: 3 }));
  });

  it("finds projects by notes content", () => {
    const { query, results } = useProjectSearch(projects);
    query.value = "classrooms";
    expect(results.value.map((p) => p.id)).toContain(2);
  });

  it("applies the state filter", () => {
    const { stateFilter, results } = useProjectSearch(projects);
    stateFilter.value = PROJECT_STATES.PLANNED;
    expect(results.value).toHaveLength(1);
    expect(results.value[0]?.id).toBe(3);
  });

  it("combines query and state filter", () => {
    const { query, stateFilter, results } = useProjectSearch(projects);
    query.value = "school";
    stateFilter.value = PROJECT_STATES.FINISHED;
    expect(results.value).toHaveLength(0);
  });

  it("reset clears query and state filter", () => {
    const { query, stateFilter, results, reset } = useProjectSearch(projects);
    query.value = "solar";
    stateFilter.value = "planned";
    reset();
    expect(query.value).toBe("");
    expect(stateFilter.value).toBe("all");
    expect(results.value).toHaveLength(3);
  });
});

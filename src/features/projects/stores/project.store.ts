import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { PROJECT_STATES } from "@/constants/projectStates";
import projectService from "@/features/projects/services/project.service";
import { useLoadingStore } from "@/stores/loading.store";
import type { Project } from "@/interfaces/Project";

export const useProjectStore = defineStore("project", () => {
  const projects = ref<Project[]>([]);
  const mapProjects = ref<Project[]>([]);
  const filteredList = ref<Project[]>([]);
  const initialized = ref(false);
  const mapInitialized = ref(false);
  const loading = ref(false);
  const mapLoading = ref(false);
  const error = ref<Error | null>(null);
  const mapError = ref<Error | null>(null);

  const getAll = computed(() => projects.value);
  const getMapAll = computed(() => mapProjects.value);
  const getById = (id: number): Project | undefined =>
    projects.value.find((project) => project.id === id);
  const projectsByState = computed<Record<string, Project[]>>(() => {
    const result: Record<string, Project[]> = {
      [PROJECT_STATES.FINISHED]: [],
      [PROJECT_STATES.UNDER_CONSTRUCTION]: [],
      [PROJECT_STATES.PLANNED]: [],
    };
    projects.value.forEach((project) => {
      if (project.state && result[project.state]) {
        result[project.state].push(project);
      }
    });
    return result;
  });
  const projectsFinished = computed(() =>
    projects.value.filter((p) => p.state === PROJECT_STATES.FINISHED),
  );
  const projectsUnderConstruction = computed(() =>
    projects.value.filter((p) => p.state === PROJECT_STATES.UNDER_CONSTRUCTION),
  );
  const projectsPlanned = computed(() =>
    projects.value.filter((p) => p.state === PROJECT_STATES.PLANNED),
  );

  async function loadMapData(): Promise<void> {
    if (mapInitialized.value || loading.value || mapLoading.value) {
      return;
    }
    mapLoading.value = true;
    mapError.value = null;
    try {
      const result = await projectService.getMapData();
      if (result && Array.isArray(result)) {
        mapProjects.value = result;
        filteredList.value = result;
        mapInitialized.value = true;
      }
    } catch (cause) {
      mapError.value = cause instanceof Error ? cause : new Error(String(cause));
      console.error("Error fetching map projects:", cause);
    } finally {
      mapLoading.value = false;
    }
  }

  async function load(): Promise<void> {
    if (initialized.value && projects.value.length > 0) {
      return;
    }
    if (loading.value || mapLoading.value) {
      return;
    }
    loading.value = true;
    const loadingStore = useLoadingStore();
    loadingStore.updateLoading(true);
    error.value = null;
    try {
      const result = await projectService.getAll();
      if (result && Array.isArray(result)) {
        projects.value = result;
        mapProjects.value = result;
        filteredList.value = result;
        mapInitialized.value = true;
        initialized.value = true;
      } else {
        console.warn(
          "Project store: service returned unexpected data:",
          result,
        );
      }
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error(String(cause));
      console.error("Error fetching projects:", cause);
      // Do NOT set initialized — allow retry on next navigation
    } finally {
      loading.value = false;
      loadingStore.updateLoading(false);
    }
  }

  function filter(
    stateFilter: Array<string>,
    categoryFilter: Array<number>,
    countryFilter: Array<number>,
  ): void {
    filteredList.value = projects.value.filter(
      (project) =>
        (stateFilter.length === 0 || stateFilter.includes(project.state)) &&
        (categoryFilter.length === 0 ||
          (project.category?.some((cat) => categoryFilter.includes(cat.id)) ??
            false)) &&
        (countryFilter.length === 0 ||
          (project.country && countryFilter.includes(project.country.id))),
    );
  }

  return {
    projects,
    mapProjects,
    filteredList,
    initialized,
    mapInitialized,
    loading,
    mapLoading,
    error,
    mapError,
    getAll,
    getMapAll,
    getById,
    projectsByState,
    projectsFinished,
    projectsUnderConstruction,
    projectsPlanned,
    loadMapData,
    load,
    filter,
  };
});

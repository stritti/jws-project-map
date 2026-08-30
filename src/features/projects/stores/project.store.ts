import { defineStore } from "pinia";
import { PROJECT_STATES } from "@/constants/projectStates";
import projectService from "@/features/projects/services/project.service";
import { useLoadingStore } from "@/stores/loading.store";
import type { Project } from "@/interfaces/Project";

interface State {
  projects: Project[];
  filteredList: Project[];
  initialized: boolean;
  mapInitialized: boolean;
  loading: boolean;
  mapLoading: boolean;
}

export const useProjectStore = defineStore("project", {
  state: (): State => ({
    projects: [],
    filteredList: [],
    initialized: false,
    mapInitialized: false,
    loading: false,
    mapLoading: false,
  }),
  persist: false,
  getters: {
    getAll: (state) => state.projects as Array<Project>,
    getById: (state) => (id: number) =>
      state.projects.find((project: Project) => project.id === id) as Project,
    projectsByState: (
      state,
    ): Record<string, Project[]> => {
      const result: Record<string, Project[]> = {
        [PROJECT_STATES.FINISHED]: [],
        [PROJECT_STATES.UNDER_CONSTRUCTION]: [],
        [PROJECT_STATES.PLANNED]: [],
      };
      state.projects.forEach((project) => {
        if (project.state && result[project.state]) {
          result[project.state].push(project);
        }
      });
      return result;
    },
    projectsFinished: (state): Project[] =>
      state.projects.filter((p) => p.state === PROJECT_STATES.FINISHED),
    projectsUnderConstruction: (state): Project[] =>
      state.projects.filter((p) => p.state === PROJECT_STATES.UNDER_CONSTRUCTION),
    projectsPlanned: (state): Project[] =>
      state.projects.filter((p) => p.state === PROJECT_STATES.PLANNED),
  },
  actions: {
    async loadMapData(): Promise<void> {
      if (this.mapInitialized || this.loading || this.mapLoading) {
        return;
      }

      this.mapLoading = true;

      try {
        const result = await projectService.getMapData();
        if (result && Array.isArray(result)) {
          this.projects = result;
          this.filteredList = result;
          this.mapInitialized = true;
        }
      } catch (error) {
        console.error("Error fetching map projects:", error);
      } finally {
        this.mapLoading = false;
      }
    },

    async load(): Promise<void> {
      if (this.initialized && this.projects.length > 0) {
        return;
      }

      if (this.loading || this.mapLoading) {
        return;
      }

      this.loading = true;

      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);

      try {
        const result = await projectService.getAll();
        if (result && Array.isArray(result) && result.length > 0) {
          this.projects = result;
          this.filteredList = result;
          this.mapInitialized = true;
          this.initialized = true;
        } else {
          console.warn(
            "Project store: service returned unexpected data:",
            result,
          );
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        // Do NOT set initialized — allow retry on next navigation
      } finally {
        this.loading = false;
        loadingStore.updateLoading(false);
      }
    },

    doFilter(
      stateFilter: Array<string>,
      categoryFilter: Array<number>,
      countryFilter: Array<number>,
    ) {
      this.filteredList = this.projects.filter(
        (project: Project) =>
          (stateFilter.length === 0 || stateFilter.includes(project.state)) &&
          (categoryFilter.length === 0 ||
            (project.category?.some((cat) => categoryFilter.includes(cat.id)) ??
              false)) &&
          (countryFilter.length === 0 ||
            (project.country && countryFilter.includes(project.country.id))),
      );
    },

    doStateFilter(stateFilter: Array<string>) {
      this.filteredList = this.projects.filter(
        (project: Project) =>
          stateFilter.length === 0 || stateFilter.includes(project.state),
      );
    },
  },
});

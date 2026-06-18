import { defineStore } from "pinia";
import projectService from "@/features/projects/services/project.service";
import { useLoadingStore } from "@/stores/loading.store";
import type { Project } from "@/interfaces/Project";

interface State {
  projects: Project[];
  filteredList: Project[];
  initialized: boolean;
  loading: boolean;
}

export const useProjectStore = defineStore("project", {
  state: (): State => ({
    projects: [],
    filteredList: [],
    initialized: false,
    loading: false,
  }),
  persist: false,
  getters: {
    getAll: (state) => state.projects as Array<Project>,
    getById: (state) => (id: number) =>
      state.projects.find((project: Project) => project.id === id) as Project,
    projectsByState: (
      state,
    ): {
      finished: Project[];
      "under construction": Project[];
      planned: Project[];
    } => {
      const result = {
        finished: [] as Project[],
        "under construction": [] as Project[],
        planned: [] as Project[],
      };
      state.projects.forEach((project) => {
        if (project.state && result[project.state as keyof typeof result]) {
          result[project.state as keyof typeof result].push(project);
        }
      });
      return result;
    },
    projectsFinished: (state): Project[] =>
      state.projects.filter((p) => p.state === "finished"),
    projectsUnderConstruction: (state): Project[] =>
      state.projects.filter((p) => p.state === "under construction"),
    projectsPlanned: (state): Project[] =>
      state.projects.filter((p) => p.state === "planned"),
  },
  actions: {
    async load(): Promise<void> {
      if (this.loading) {
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
          this.initialized = true;
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
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

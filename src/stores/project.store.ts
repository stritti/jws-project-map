import { defineStore } from "pinia";
import projectService from "../services/project.service";
import { useLoadingStore } from "./loading.store";
import type { Project } from "@/interfaces/Project";

interface State {
  projects: Project[];
  filteredList: Project[];
}

export const useProjectStore = defineStore("project", {
  state: (): State => {
    return {
      projects: [],
      filteredList: [],
    };
  },
  getters: {
    getAll: (state) => state.projects as Array<Project>,
    getById: (state) => (id: string) =>
      state.projects.find((project: Project) => project.id === id) as Project,
    projectsFinished: (state) => {
      if (state.projects.length > 0) {
        return state.projects.filter((project) => project.state === "finished");
      } else {
        return [];
      }
    },
    projectsUnderConstruction: (state) => {
      if (state.projects.length > 0) {
        return state.projects.filter(
          (project) => project.state === "under construction",
        );
      } else {
        return [];
      }
    },
    projectsPlanned: (state) => {
      if (state.projects.length > 0) {
        return state.projects.filter((project) => project.state === "planned");
      } else {
        return [];
      }
    },
  },
  actions: {
    async init(): Promise<void> {
      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);
      projectService.getAll().then((result) => {
        this.projects = result as Array<Project>;
        loadingStore.updateLoading(false);
      });
    },
    doFilter(
      stateFilter: Array<string>,
      categoryFilter: Array<string>,
      countryFilter: Array<string>,
    ) {
      this.filteredList = [];

      this.projects.forEach((project: Project) => {
        if (
          (stateFilter.length === 0 || stateFilter.includes(project.state)) &&
          (categoryFilter.length === 0 ||
            categoryFilter.some((r) => project.category.includes(r))) &&
          (countryFilter.length === 0 ||
            countryFilter.includes(project.country[0]))
        ) {
          this.filteredList.push(project);
        }
      })
    },
  },
});

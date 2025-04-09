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
  persist: true,
  getters: {
    getAll: (state) => state.projects as Array<Project>,
    getById: (state) => (id: number) =>
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
      // Check if we already have data and it's not stale
      const lastFetch = localStorage.getItem('project_last_fetch');
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
      
      // If we have data and it's less than an hour old, don't fetch again
      if (this.projects.length > 0 && lastFetch && (now - parseInt(lastFetch)) < oneHour) {
        return;
      }
      
      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);
      try {
        const result = await projectService.getAll();
        this.projects = result as Array<Project>;
        // Store the fetch time
        localStorage.setItem('project_last_fetch', now.toString());
      } catch (error) {
        console.error('Error fetching Items:', error);
        // Don't throw, just log the error
      } finally {
        loadingStore.updateLoading(false);
      }
    },
    doFilter(
      stateFilter: Array<string>,
      categoryFilter: Array<number>,
      countryFilter: Array<number>,
    ) {
      this.filteredList = [];

      this.projects.forEach((project: Project) => {
        if (
          (stateFilter.length === 0 || stateFilter.includes(project.state)) &&
          (categoryFilter.length === 0 ||
            categoryFilter.some((category) => project.category.includes(category))) &&
          (countryFilter.length === 0 ||
            countryFilter.some((country) => project.country === country))) {
          this.filteredList.push(project);
        }
      });
    },
    doStateFilter( stateFilter: Array<string>,) {
      this.filteredList = [];

      this.projects.forEach((project: Project) => {
        if (stateFilter.length === 0 || stateFilter.includes(project.state)) {
          this.filteredList.push(project);
        }
      });
    },
  },
});

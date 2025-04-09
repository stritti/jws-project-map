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
      const loadingStore = useLoadingStore();
      
      // Zeige den Ladeindikator nur, wenn wir keine Daten haben
      if (this.projects.length === 0) {
        loadingStore.updateLoading(true);
      }
      
      try {
        // Der verbesserte projectService kümmert sich jetzt selbst um das Caching
        const result = await projectService.getAll();
        
        if (result && Array.isArray(result)) {
          // Validate projects before storing them
          const validProjects = result.filter(project => 
            project && 
            typeof project.id === 'number' &&
            typeof project.latitude === 'number' && 
            typeof project.longitude === 'number' &&
            !isNaN(project.latitude) && 
            !isNaN(project.longitude)
          );
          
          if (validProjects.length > 0) {
            this.projects = validProjects as Array<Project>;
            console.log(`Loaded ${validProjects.length} valid projects`);
          } else {
            console.error('No valid projects found in API response');
          }
        } else {
          console.error('Invalid response format from API');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
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

import { defineStore } from "pinia";
import projectService from "../services/project.service";
import { useLoadingStore } from "./loading.store";
import type { Project } from "@/interfaces/Project";

interface State {
  projects: Project[];
  filteredList: Project[];
  initialized: boolean; // Flag to track initialization
  loading: boolean;
  lastFetched: number | null;
}

// Konstante für Cache-Gültigkeit (30 Minuten)
const CACHE_VALIDITY_MS = 30 * 60 * 1000;

export const useProjectStore = defineStore("project", {
  state: (): State => {
    return {
      projects: [],
      filteredList: [],
      initialized: false,
      loading: false,
      lastFetched: null,
    };
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'project-store',
        storage: localStorage,
        paths: ['projects', 'lastFetched']
      }
    ]
  },
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
    async load(): Promise<void> {
      // Wenn bereits geladen und nicht zu alt, nicht erneut laden
      if (this.initialized && !this.shouldRefreshCache()) {
        return;
      }
      
      // Wenn bereits ein Ladevorgang läuft, nicht erneut starten
      if (this.loading) {
        return;
      }
      
      this.loading = true;
      this.initialized = true;

      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);

      try {
        // Zuerst prüfen, ob wir gecachte Daten haben, die wir sofort anzeigen können
        if (this.projects.length > 0) {
          console.log("Using cached projects while refreshing data");
        }
        
        // Daten im Hintergrund laden
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
            this.lastFetched = Date.now();
            console.log(`Loaded ${validProjects.length} valid projects`);
          } else {
            console.error('No valid projects found in API response');
          }
        } else {
          console.error('Invalid response format from API');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Wenn ein Fehler auftritt und wir haben gecachte Daten, behalten wir diese
      } finally {
        this.loading = false;
        loadingStore.updateLoading(false);
      }
    },
    
    // Hilfsmethode, um zu prüfen, ob der Cache aktualisiert werden sollte
    shouldRefreshCache(): boolean {
      if (!this.lastFetched) return true;
      return (Date.now() - this.lastFetched) > CACHE_VALIDITY_MS;
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
            (project.category?.some(cat => 
              categoryFilter.includes(cat.Id)
            ) ?? false)) &&
          (countryFilter.length === 0 ||
            (project.country && countryFilter.includes(project.country.Id)))) {
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

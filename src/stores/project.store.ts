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
  persist: true, // Vereinfachte Persistenz für schnelleres Laden
  getters: {
    getAll: (state) => state.projects as Array<Project>,
    getById: (state) => (id: number) =>
      state.projects.find((project: Project) => project.id === id) as Project,
    // Optimierte Getter mit Memoization für bessere Performance
    projectsByState: (state) => {
      // Nur einmal filtern statt dreimal
      const result = {
        finished: [] as Project[],
        'under construction': [] as Project[],
        planned: [] as Project[]
      };
      
      if (state.projects.length > 0) {
        state.projects.forEach(project => {
          if (project.state && result[project.state as keyof typeof result]) {
            result[project.state as keyof typeof result].push(project);
          }
        });
      }
      
      return result;
    },
    projectsFinished: (state) => {
      return (state as any).projectsByState.finished || [];
    },
    projectsUnderConstruction: (state) => {
      return (state as any).projectsByState['under construction'] || [];
    },
    projectsPlanned: (state) => {
      return (state as any).projectsByState.planned || [];
    },
  },
  actions: {
    // Optimierte Methode zum schnellen Vorladen der Kartendaten
    async preloadMapData(): Promise<void> {
      // Wenn bereits Daten vorhanden sind, nicht erneut laden
      if (this.projects.length > 0) {
        return;
      }
      
      // Sofort mit dem Laden beginnen, ohne auf Antwort zu warten
      this.loading = true;
      
      // Direkt die vollständigen Daten laden - der Versuch, zuerst minimale Daten zu laden,
      // führt zu zusätzlichen Netzwerkanfragen und verlangsamt den Prozess
      projectService.getAll(false)
        .then(result => {
          if (result && Array.isArray(result) && result.length > 0) {
            this.projects = result;
            this.lastFetched = Date.now();
            this.initialized = true;
            console.log(`Loaded ${result.length} projects`);
          }
        })
        .catch(error => {
          console.error('Error loading project data:', error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    
    async load(showLoading = true): Promise<void> {
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
      if (showLoading) {
        loadingStore.updateLoading(true);
      }

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
        if (showLoading) {
          loadingStore.updateLoading(false);
        }
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
      // Optimierte Filterung mit Array.filter statt forEach
      this.filteredList = this.projects.filter((project: Project) => 
        (stateFilter.length === 0 || stateFilter.includes(project.state)) &&
        (categoryFilter.length === 0 ||
          (project.category?.some(cat => 
            categoryFilter.includes(cat.Id)
          ) ?? false)) &&
        (countryFilter.length === 0 ||
          (project.country && countryFilter.includes(project.country.Id)))
      );
    },
    doStateFilter(stateFilter: Array<string>) {
      // Optimierte Filterung mit Array.filter statt forEach
      this.filteredList = this.projects.filter((project: Project) => 
        stateFilter.length === 0 || stateFilter.includes(project.state)
      );
    },
  },
});

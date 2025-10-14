import { defineStore } from "pinia";
import projectService from "../services/project.service";
import { useLoadingStore } from "./loading.store";
import type { Project } from "@/interfaces/Project";
import { shallowRef } from "vue";

interface State {
  projects: Project[];
  mapProjects: Project[]; // Separate Sammlung für Kartendaten
  filteredList: Project[];
  initialized: boolean;
  mapInitialized: boolean; // Separater Flag für Kartendaten
  loading: boolean;
  lastFetched: number | null;
}

// Konstante für Cache-Gültigkeit (30 Minuten)
const CACHE_VALIDITY_MS = 30 * 60 * 1000;

export const useProjectStore = defineStore("project", {
  state: (): State => {
    return {
      projects: [],
      mapProjects: [], // Separate Sammlung für Kartendaten
      filteredList: [],
      initialized: false,
      mapInitialized: false,
      loading: false,
      lastFetched: null,
    };
  },
  persist: {
    paths: ['mapProjects', 'lastFetched', 'mapInitialized'], // Nur die wichtigsten Daten persistieren
  },
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
    // Schnelles Laden nur der Kartendaten mit Promise-Rückgabe
    async preloadMapData(): Promise<Array<Project>> {
      // Wenn bereits Kartendaten vorhanden sind und nicht zu alt, nicht erneut laden
      if (this.mapInitialized && this.mapProjects.length > 0 && !this.shouldRefreshCache()) {
        return this.mapProjects;
      }
      
      // Wenn bereits ein Ladevorgang läuft, warten wir auf dessen Abschluss
      if (this.loading) {
        // Warte auf den nächsten Tick, um sicherzustellen, dass die Daten geladen sind
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.mapProjects;
      }
      
      // Sofort mit dem Laden beginnen
      this.loading = true;
      
      try {
        // Nur die für die Karte notwendigen Daten laden
        const mapData = await projectService.getMapData();
        
        if (mapData && Array.isArray(mapData) && mapData.length > 0) {
          this.mapProjects = mapData;
          this.mapInitialized = true;
          this.lastFetched = Date.now();
          
          // Auch die Hauptprojektliste aktualisieren, wenn sie leer ist
          if (this.projects.length === 0) {
            this.projects = [...mapData];
          }
          
          return mapData;
        }
        return [];
      } catch (error) {
        console.error('Error loading map data:', error);
        return this.mapProjects;
      } finally {
        this.loading = false;
      }
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
        // Zuerst prüfen, ob wir Kartendaten haben, die wir sofort anzeigen können
        if (!this.projects.length && this.mapProjects.length > 0) {
          // Temporär die Kartendaten verwenden, während die vollständigen Daten geladen werden
          this.projects = [...this.mapProjects];
          console.log("Using map data while loading full details");
        }
        
        // Vollständige Daten im Hintergrund laden
        const result = await projectService.getAll();

        if (result && Array.isArray(result) && result.length > 0) {
          this.projects = result;
          this.lastFetched = Date.now();
          console.log(`Loaded ${result.length} complete projects`);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Wenn ein Fehler auftritt und wir haben Kartendaten, behalten wir diese
        if (!this.projects.length && this.mapProjects.length > 0) {
          this.projects = [...this.mapProjects];
        }
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

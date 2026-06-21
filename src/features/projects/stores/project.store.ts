import { defineStore } from "pinia";
import projectService from "@/features/projects/services/project.service";
import { useLoadingStore } from "@/stores/loading.store";
import type { Project } from "@/interfaces/Project";

interface State {
  projects: Project[];
  filteredList: Project[];
  initialized: boolean;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

// Batch size for initial and subsequent loads
const INITIAL_BATCH_SIZE = 100;
const SUBSEQUENT_BATCH_SIZE = 200;

export const useProjectStore = defineStore("project", {
  state: (): State => ({
    projects: [],
    filteredList: [],
    initialized: false,
    loading: false,
    loadingMore: false,
    hasMore: true,
    currentPage: 0,
    totalPages: 1,
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
    isLoadingInitial: (state): boolean => state.loading && state.currentPage === 0,
    isLoadingMore: (state): boolean => state.loadingMore,
  },
  actions: {
    /**
     * Load initial batch of projects (fast)
     * This is called on app startup to show something quickly
     */
    async loadInitial(): Promise<void> {
      if (this.loading) return;
      if (this.initialized && this.projects.length > 0) return;

      this.loading = true;
      this.currentPage = 0;

      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);

      try {
        console.log("[ProjectStore] Loading initial batch...");
        const startTime = Date.now();
        
        // Load first batch quickly
        const result = await projectService.fetchPaginated(
          INITIAL_BATCH_SIZE,
          0
        );
        
        if (result && Array.isArray(result)) {
          this.projects = result;
          this.filteredList = result;
          this.currentPage = 1;
          this.hasMore = result.length >= INITIAL_BATCH_SIZE;
          this.initialized = true;
          
          const duration = Date.now() - startTime;
          console.log(`[ProjectStore] Initial batch: ${result.length} projects in ${duration}ms`);
        }
      } catch (error) {
        console.error("[ProjectStore] Error loading initial projects:", error);
      } finally {
        this.loading = false;
        loadingStore.updateLoading(false);
      }
    },

    /**
     * Load more projects in the background
     * This continues loading the rest of the projects after initial load
     */
    async loadMore(): Promise<void> {
      if (!this.hasMore || this.loadingMore || this.loading) return;

      this.loadingMore = true;

      try {
        console.log(`[ProjectStore] Loading more projects (page ${this.currentPage})...`);
        const startTime = Date.now();
        
        const offset = this.currentPage * SUBSEQUENT_BATCH_SIZE;
        const result = await projectService.fetchPaginated(
          SUBSEQUENT_BATCH_SIZE,
          offset
        );
        
        if (result && Array.isArray(result) && result.length > 0) {
          this.projects = [...this.projects, ...result];
          this.filteredList = [...this.filteredList, ...result];
          this.currentPage++;
          this.hasMore = result.length >= SUBSEQUENT_BATCH_SIZE;
          
          const duration = Date.now() - startTime;
          console.log(`[ProjectStore] Loaded ${result.length} more projects in ${duration}ms`);
          
          // Continue loading more if there might be more
          if (this.hasMore) {
            // Small delay to avoid overwhelming the API
            setTimeout(() => this.loadMore(), 100);
          }
        } else {
          this.hasMore = false;
        }
      } catch (error) {
        console.error("[ProjectStore] Error loading more projects:", error);
        this.hasMore = false;
      } finally {
        this.loadingMore = false;
      }
    },

    /**
     * Load all projects at once (fallback for compatibility)
     * This is kept for backward compatibility but should be avoided
     */
    async load(): Promise<void> {
      if (this.initialized && this.projects.length > 0) {
        return;
      }

      if (this.loading) {
        return;
      }

      this.loading = true;

      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);

      try {
        const result = await projectService.getAll();
        if (result && Array.isArray(result)) {
          this.projects = result;
          this.filteredList = result;
          this.initialized = true;
          this.hasMore = false;
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        this.loading = false;
        loadingStore.updateLoading(false);
      }
    },

    /**
     * Load projects with lazy loading
     * This is the new recommended method that loads projects in batches
     */
    async loadWithLazyLoading(): Promise<void> {
      await this.loadInitial();
      
      // Start loading more in the background after initial load
      if (this.hasMore) {
        // Small delay before loading more to prioritize UI rendering
        setTimeout(() => this.loadMore(), 200);
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

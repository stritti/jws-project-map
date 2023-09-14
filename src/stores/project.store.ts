import { defineStore } from "pinia";
import projectService from "../services/project.service";
import { useLoadingStore } from "./loading.store";
import type { Project } from "@/interfaces/Project";

interface State {
  projects: Project[];
}

export const useProjectStore = defineStore("project", {
  state: (): State => {
    return {
      projects: [],
    };
  },
  getters: {
    getAll: (state) => state.projects,
    getById: (state) => (id: string) =>
      state.projects.find((project: Project) => project.id === id),
  },
  actions: {
    async init() {
      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);
      projectService.getAll().then((result) => {
        this.projects = result as Array<Project>;
        loadingStore.updateLoading(false);
      });
    },
  },
});

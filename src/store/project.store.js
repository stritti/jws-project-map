import { defineStore } from 'pinia';
import projectService from '../services/project.service';
import { useLoadingStore } from './loading.store';

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
  }),
  getters: {
    getAll: (state) => state.projects,
    getById: (state) => (id) =>
      state.projects.find((project) => project.id === id),
  },
  actions: {
    async init() {
      const loadingStore = useLoadingStore();
      loadingStore.updateLoading(true);
      this.projects = projectService.getAll().then((result) => {
        this.projects = result;
        loadingStore.updateLoading(false);
      });
    },
  },
});

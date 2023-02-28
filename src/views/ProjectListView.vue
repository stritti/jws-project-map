<template>
  <b-container>
    <div class="project-list">
      <h1>JWF + Humanaktiv: Project Overview</h1>

      <b-skeleton-wrapper :loading="showLoadingSpinner">
        <template #loading>
          <h3><b-skeleton width="75%"></b-skeleton></h3>
          <p>
            <b-skeleton width="85%"></b-skeleton>
            <b-skeleton width="55%"></b-skeleton>
            <b-skeleton width="70%"></b-skeleton>
          </p>
        </template>

        <h3 class="my-3">
          Projects: {{ projectCount }} (including:
          {{ projectsUnderConstruction.length }} under construction,
          {{ projectsPlanned.length }} planned)
        </h3>

        <b-button
          :class="showFilters ? null : 'collapsed'"
          :aria-expanded="showFilters ? 'true' : 'false'"
          aria-controls="collapse-filter"
          @click="showFilters = !showFilters"
          variant="primary"
        >
          <bootstrap-icon icon="filter" />
          Filter
        </b-button>
        <b-collapse id="collapse-filter" v-model="showFilters">
          <b-card bg-variant="light" class="mb-5">
            <b-form-group label="Project State:">
              <b-form-checkbox-group
                v-model="stateFilter"
                name="stateFilter"
                :options="stateOptions"
                size="sm"
              >
              </b-form-checkbox-group>
            </b-form-group>
            <b-form-group label="Project Category:">
              <b-form-checkbox-group
                v-model="categoryFilter"
                :options="categoryList"
                text-field="name"
                value-field="id"
                size="sm"
              >
              </b-form-checkbox-group>
            </b-form-group>
            <b-form-group label="Country:">
              <b-form-checkbox-group
                v-model="countryFilter"
                :options="countryList"
                text-field="name"
                value-field="id"
                size="sm"
              >
              </b-form-checkbox-group>
            </b-form-group>
            <h3 class="mt-3">
              {{ filteredProjectList.length }} filtered Projects
            </h3>
          </b-card>
        </b-collapse>
      </b-skeleton-wrapper>
      <b-overlay :show="showLoadingSpinner" fixed :opacity="0.5">
        <b-card-group columns="true" class="my-3">
          <project-list-item
            v-for="project in filteredProjectList"
            :key="project.id"
            :project="project"
          />
        </b-card-group>
      </b-overlay>
    </div>
  </b-container>
  <site-footer />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useLoadingStore } from "../stores/loading.store";
import { useProjectStore } from "../stores/project.store";
import { useCategoryStore } from "../stores/category.store";
import { useCountryStore } from "../stores/country.store";

import BootstrapIcon from "@dvuckovic/vue3-bootstrap-icons";
import ProjectListItem from "../components/project/ProjectListItem.vue";
import SiteFooter from "../components/SiteFooter.vue";

import type { Category } from "@/interfaces/Category";
import type { Country } from "@/interfaces/Country";
import type { Project } from "@/interfaces/Project";

export default defineComponent({
  name: "ProjectListView",
  components: { BootstrapIcon, ProjectListItem, SiteFooter },
  data() {
    return {
      showFilters: false,
      stateFilter: ["finished", "planned", "under construction"],
      stateOptions: [
        { text: "finished", value: "finished" },
        { text: "under construction", value: "under construction" },
        { text: "planned", value: "planned" },
      ],
      categoryFilter: [] as Array<Category>,
      countryFilter: [] as Array<Country>,
      loadingStore: useLoadingStore(),
    };
  },
  computed: {
    ...mapState(useLoadingStore, {
      showLoadingSpinner: (store) => store.showLoadingSpinner as boolean,
    }),
    ...mapState(useProjectStore, {
      projectList: (store) => store.projects as Array<Project>,
    }),
    ...mapState(useCategoryStore, {
      categoryList: (store) => store.categories as Array<Category>,
    }),
    ...mapState(useCountryStore, {
      countryList: (store) => store.countries as Array<Country>,
    }),
    filteredProjectList(): Array<Project> {
      this.loadingStore.updateLoading(true);
      const filteredList = [] as Array<Project>;

      this.projectList.forEach((project: Project) => {
        if (
          (this.stateFilter.length === 0 ||
            this.stateFilter.includes(project.state)) &&
          (this.categoryFilter.length === 0 ||
            this.categoryFilter.some((r) => project.category.includes(r))) &&
          (this.countryFilter.length === 0 ||
            this.countryFilter.includes(project.country[0]))
        ) {
          filteredList.push(project);
        }
      });

      this.loadingStore.updateLoading(false);
      return filteredList;
    },
    projectCount(): number {
      return this.projectList.length;
    },
    projectsFinished() {
      if (this.projectList.length > 0) {
        return this.projectList.filter(
          (loc: Project) => loc.state === "finished"
        );
      } else {
        return [];
      }
    },
    projectsUnderConstruction() {
      if (this.projectList.length > 0) {
        return this.projectList.filter(
          (loc: Project) => loc.state === "under construction"
        );
      } else {
        return [];
      }
    },
    projectsPlanned() {
      if (this.projectList.length > 0) {
        return this.projectList.filter(
          (loc: Project) => loc.state === "planned"
        );
      } else {
        return [];
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.project-list {
  min-height: calc(100vh - 7rem);
  padding: 1rem;
}
</style>

<template>
  <b-container>
    <div class="project-list">
      <h1>JWF + Humanaktiv: Project Overview</h1>

      <b-placeholder-wrapper :loading="showLoadingSpinner">
        <template #loading>
          <h3><b-placeholder width="75%"></b-placeholder></h3>
          <p>
            <b-placeholder width="85%"></b-placeholder>
            <b-placeholder width="55%"></b-placeholder>
            <b-placeholder width="70%"></b-placeholder>
          </p>
          <b-card-group columns="true" class="my-3">
            <BPlaceholderCard animation="wave" no-footer />
            <BPlaceholderCard animation="wave" no-footer />
            <BPlaceholderCard animation="wave" no-footer />
          </b-card-group>
        </template>

        <h3 class="my-3">
          Projects: {{ projectCount }} (including:
          {{ projectsUnderConstructionCount }} under construction,
          {{ projectsPlannedCount }} planned)
        </h3>

        <b-button v-b-toggle.collapse-filter variant="primary">
          <IBiFilter />
          Filter
        </b-button>
        <b-collapse id="collapse-filter">
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
      </b-placeholder-wrapper>
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

import ProjectListItem from "../components/project/ProjectListItem.vue";
import SiteFooter from "../components/SiteFooter.vue";

import type { Category } from "@/interfaces/Category";
import type { Country } from "@/interfaces/Country";
import type { Project } from "@/interfaces/Project";

export default defineComponent({
  name: "ProjectListView",
  components: { ProjectListItem, SiteFooter },
  data() {
    return {
      stateOptions: [
        { text: "finished", value: "finished" },
        { text: "under construction", value: "under construction" },
        { text: "planned", value: "planned" },
      ],
      stateFilter: [] as Array<string>,
      categoryFilter: [] as Array<string>,
      countryFilter: [] as Array<string>,
    };
  },
  mounted() {
    this.stateFilter.push("finished", "planned", "under construction");
  },
  computed: {
    ...mapState(useLoadingStore, {
      showLoadingSpinner: (store) => store.showLoadingSpinner as boolean,
    }),
    ...mapState(useProjectStore, {
      filteredProjectList: (store) => store.filteredList as Array<Project>,
    }),
    ...mapState(useProjectStore, {
      projects: (store) => store.projects as Array<Project>,
    }),
    projectList() {
      return this.projects.map((project) => {
        return { text: project.name, value: project.id, ...project };
      });
    },
    ...mapState(useCategoryStore, {
      categories: (store) => store.categories as Array<Category>,
    }),
    categoryList() {
      return this.categories.map((category) => {
        return { text: category.name, value: category.id, ...category };
      });
    },
    ...mapState(useCountryStore, {
      countryies: (store) => store.countries as Array<Country>,
    }),
    countryList() {
      return this.countryies.map((country) => {
        return { text: country.name, value: country.id, ...country };
      });
    },
    projectCount(): number {
      return this.projectList.length;
    },
    projectsPlannedCount(): number {
      return useProjectStore().projectsPlanned.length;
    },
    projectsUnderConstructionCount(): number {
      return useProjectStore().projectsUnderConstruction.length;
    },
  },
  watch: {
    projects: function () {
      useProjectStore().doFilter(
        this.stateFilter,
        this.categoryFilter,
        this.countryFilter,
      );
    },
    stateFilter: function (newVal) {
      useProjectStore().doFilter(
        newVal,
        this.categoryFilter,
        this.countryFilter,
      );
    },
    categoryFilter: function (newVal) {
      useProjectStore().doFilter(this.stateFilter, newVal, this.countryFilter);
    },
    countryFilter: function (newVal) {
      useProjectStore().doFilter(this.stateFilter, this.categoryFilter, newVal);
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

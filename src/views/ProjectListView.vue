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
          <b-card-group columns class="my-3">
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
        <b-card-group columns class="my-3">
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

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useLoadingStore } from "../stores/loading.store";
import { useProjectStore } from "../stores/project.store";
import { useCategoryStore } from "../stores/category.store";
import { useCountryStore } from "../stores/country.store";
import ProjectListItem from "../components/project/ProjectListItem.vue";
import SiteFooter from "../components/SiteFooter.vue";

const loadingStore = useLoadingStore();
const projectStore = useProjectStore();
const categoryStore = useCategoryStore();
const countryStore = useCountryStore();

const { showLoadingSpinner } = storeToRefs(loadingStore);
const { filteredList: filteredProjectList, projects } = storeToRefs(projectStore);
const { categories } = storeToRefs(categoryStore);
const { countries } = storeToRefs(countryStore);

const stateOptions = [
  { text: "finished", value: "finished" },
  { text: "under construction", value: "under construction" },
  { text: "planned", value: "planned" },
];

const stateFilter = ref<string[]>([]);
const categoryFilter = ref<string[]>([]);
const countryFilter = ref<string[]>([]);

const projectList = computed(() =>
  projects.value.map((project) => ({ text: project.name, value: project.id, ...project }))
);

const categoryList = computed(() =>
  categories.value.map((category) => ({ text: category.name, value: Number(category.id), ...category }))
);

const countryList = computed(() =>
  countries.value.map((country) => ({ text: country.name, value: Number(country.id), ...country }))
);

const projectCount = computed(() => projectList.value.length);
const projectsPlannedCount = computed(() => projectStore.projectsPlanned.length);
const projectsUnderConstructionCount = computed(() => projectStore.projectsUnderConstruction.length);

onMounted(async () => {
  // Load data asynchronously after mount
  const promises = [
    projectStore.load(),
    categoryStore.load(),
    countryStore.load(),
  ];
  Promise.all(promises);

  if (stateFilter.value.length === 0) {
    stateFilter.value = ["finished", "planned", "under construction"];
  }
});

watch(
  [projects, stateFilter, categoryFilter, countryFilter],
  () => {
    projectStore.doFilter(
      stateFilter.value,
      categoryFilter.value.map(Number),
      countryFilter.value.map(Number)
    );
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.project-list {
  min-height: calc(100vh - 7rem);
  padding: 1rem;
}
</style>

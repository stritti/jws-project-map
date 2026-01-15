<script setup lang="ts">
import { onBeforeMount } from "vue";
import LocationMap from "../components/map/LocationMap.vue";
import { useProjectStore } from "../stores/project.store";
import { useCategoryStore } from "../stores/category.store";
import { useCountryStore } from "../stores/country.store";

// Start loading data as early as possible (before mount)
onBeforeMount(() => {
  const projectStore = useProjectStore();
  const categoryStore = useCategoryStore();
  const countryStore = useCountryStore();
  
  // Load data in parallel without blocking rendering
  Promise.all([
    projectStore.load(),
    categoryStore.load(),
    countryStore.load(),
  ]);
});
</script>

<template>
  <div class="home">
    <h1>JWF + Humanaktiv: Projects in Westafrica</h1>
    <div class="project-map">
      <location-map />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
  h1 {
    top: env(safe-area-inset-top);
    right: env(safe-area-inset-right);
    padding: 1rem;
    margin-left: 60px;
    position: absolute;
    z-index: 10;
    background-color: rgba($color: #ffffff, $alpha: 0.5);
  }

  .project-map {
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 1;
  }
}
</style>

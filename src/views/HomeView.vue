<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useProjectStore } from "@/features/projects/stores/project.store";

const projectStore = useProjectStore();

// Start loading project data immediately, in parallel with the map component
projectStore.load(false);

// Lazy-load the map component (Leaflet stays out of the initial bundle)
const LocationMap = defineAsyncComponent(
  () => import("../components/map/LocationMap.vue"),
);
</script>

<template>
  <div class="home">
    <h1>JWF + Humanaktiv: Projects in Westafrica</h1>
    <div class="project-map">
      <!-- Map and data load in parallel: map tiles show immediately, pins appear when data is ready -->
      <Suspense>
        <template #default>
          <location-map />
        </template>
        <template #fallback>
          <div class="map-loading">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading map...</span>
            </div>
            <p class="mt-2">Loading map...</p>
          </div>
        </template>
      </Suspense>
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

  .map-loading {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
  }
}
</style>

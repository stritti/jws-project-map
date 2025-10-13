<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue';
import { useProjectStore } from '../stores/project.store';

// Sofort mit dem Laden der Projektdaten beginnen
const projectStore = useProjectStore();
const mapVisible = ref(true); // Sofort sichtbar machen

// Direkt importieren statt async für schnelleres Rendering
import LocationMap from "../components/map/LocationMap.vue";

// Daten im Hintergrund laden
if (projectStore.projects.length === 0) {
  // Nur laden, wenn keine Daten vorhanden sind
  projectStore.preloadMapData();
}
</script>

<template>
  <div class="home">
    <h1>JWF + Humanaktiv: Projects in Westafrica</h1>
    <div class="project-map">
      <!-- Sofort sichtbarer Platzhalter -->
      <div v-if="!mapVisible" class="map-loading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading map...</span>
        </div>
        <p class="mt-2">Loading map...</p>
      </div>
      
      <!-- Karte wird erst nach kurzer Verzögerung geladen -->
      <Suspense v-if="mapVisible">
        <template #default>
          <location-map />
        </template>
        <template #fallback>
          <div class="map-loading">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading map...</span>
            </div>
            <p class="mt-2">Loading map components...</p>
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

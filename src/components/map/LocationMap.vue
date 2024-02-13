<template>
  <div class="map">
    <b-overlay :show="isLoadingMap" fixed style="height: 100vh" :opacity="0.5">
      <l-map
        v-if="locations.length > 0"
        ref="map"
        v-model:zoom="zoom"
        class="map"
        :center="currentCenter"
        crs="EPSG:4326"
        :min-zoom="4"
        :max-zoom="17"
        :bounds="bounds"
        :max--bounds="maxBounds"
        :use-global-leaflet="true"
        :options="mapOptions"
        @click="addMarker"
        @ready="mapLoaded"
      >
        <l-control-layers
          ref="control"
          position="bottomright"
        ></l-control-layers>
        <l-tile-layer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          layer-type="base"
          name="Satellite"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        ></l-tile-layer>

        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        ></l-tile-layer>

        <l-layer-group
          v-if="projectsFinished"
          layer-type="overlay"
          :name="layerLabelProjectsFinished"
        >
          <l-marker
            v-for="loc in projectsFinished"
            :id="loc.id"
            :key="loc.id"
            :lat-lng="[loc.latitude, loc.longitude]"
            layer-type="project"
            @click="onMarkerClick(loc)"
          >
            <l-icon
              :icon-url="getPin(loc)"
              :class-name="pinClass(loc)"
              :icon-size="[28, 39]"
              :icon-anchor="[14, 39]"
            ></l-icon>
            <l-tooltip>
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>

        <l-layer-group
          v-if="projectsUnderConstruction"
          layer-type="overlay"
          :name="layerLabelProjectsUnderConstruction"
        >
          <l-marker
            v-for="loc in projectsUnderConstruction"
            :id="loc.id"
            :key="loc.id"
            :lat-lng="[loc.latitude, loc.longitude]"
            layer-type="project"
            @click="onMarkerClick(loc)"
          >
            <l-icon
              :icon-url="getPin(loc)"
              :class-name="pinClass(loc)"
              :icon-size="[28, 39]"
              :icon-anchor="[14, 39]"
            ></l-icon>
            <l-tooltip>
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>

        <l-layer-group
          v-if="projectsPlanned"
          layer-type="overlay"
          :name="layerLabelProjectsPlanned"
        >
          <l-marker
            v-for="loc in projectsPlanned"
            :id="loc.id"
            :key="loc.id"
            :lat-lng="[loc.latitude, loc.longitude]"
            layer-type="project"
            @click="onMarkerClick(loc)"
          >
            <l-icon
              :icon-url="getPin(loc)"
              :class-name="pinClass(loc)"
              :icon-size="[28, 39]"
              :icon-anchor="[14, 39]"
            ></l-icon>
            <l-tooltip>
              <span>{{ loc.name }}</span>
              <span v-if="loc.state !== 'finished'"> ({{ loc.state }})</span>
            </l-tooltip>
          </l-marker>
        </l-layer-group>
      </l-map>
    </b-overlay>
    <project-details
      :project="selectedLocation"
      :is-opened="isOpened"
      @close="onSidePanelClose"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { mapActions } from "pinia";
import { useLoadingStore } from "../../stores/loading.store";
import { useCategoryStore } from "../../stores/category.store";
import { useProjectStore } from "../../stores/project.store";

import {
  LatLng,
  LatLngBounds,
  latLngBounds,
  featureGroup,
  Marker,
} from "leaflet";
import {
  LMap,
  LControlLayers,
  LLayerGroup,
  LTileLayer,
  LMarker,
  LIcon,
  LTooltip,
} from "@vue-leaflet/vue-leaflet";
import ProjectDetails from "../../components/project/ProjectDetails.vue";
import projectService from "../../services/project.service";
import type { Project } from "@/interfaces/Project";

export default defineComponent({
  name: "LocationMap",
  components: {
    LMap,
    LControlLayers,
    LLayerGroup,
    LMarker,
    LIcon,
    LTileLayer,
    LTooltip,
    ProjectDetails,
  },
  data() {
    return {
      zoom: 5 as number,
      currentCenter: [7.0, -3.5],
      bounds: latLngBounds([
        [-14.5981259, 5.8997233],
        [8.9490075, 11.322326],
      ]) as LatLngBounds,
      maxBounds: latLngBounds([
        [-14.6, 5.9],
        [8.9490075, 11.322326],
      ]) as LatLngBounds,
      categories: [],
      isOpened: false as boolean,
      isLoadingMap: false as boolean,
      selectedLocation: undefined as Project | undefined,
      mapOptions: {
        zoomSnap: 0.5,
      },
    };
  },
  computed: {
    ...mapState(useCategoryStore, {
      getCategoryById: (store) => store.getById,
    }),
    ...mapState(useLoadingStore, {
      showLoadingSpinner: (store) => store.showLoadingSpinner as boolean,
    }),
    ...mapState(useProjectStore, {
      locations: (store) => store.projects as Array<Project>,
    }),
    projectsFinished(): Array<Project> {
      if (this.locations.length > 0) {
        return this.locations.filter(
          (loc: Project) => loc.state === "finished",
        );
      } else {
        return [];
      }
    },
    projectsUnderConstruction(): Array<Project> {
      if (this.locations.length > 0) {
        return this.locations.filter(
          (loc: Project) => loc.state === "under construction",
        );
      } else {
        return [];
      }
    },
    projectsPlanned(): Array<Project> {
      if (this.locations.length > 0) {
        return this.locations.filter((loc: Project) => loc.state === "planned");
      } else {
        return [];
      }
    },
    layerLabelProjectsFinished(): string {
      return `Projects: finished (${this.projectsFinished.length})`;
    },
    layerLabelProjectsUnderConstruction(): string {
      return `Projects: under construction (${this.projectsUnderConstruction.length})`;
    },
    layerLabelProjectsPlanned(): string {
      return `Projects: planned (${this.projectsPlanned.length})`;
    },
  },
  async mounted() {
    this.isLoadingMap = true;
    if (this.locations.length > 0) {
      this.updateMaxBounds();
    }
    const store = useProjectStore();
    // this subscription will be kept after the component is unmounted
    store.$subscribe(() => {
      this.updateMaxBounds();
    });
  },
  methods: {
    mapLoaded(): void {
      this.isLoadingMap = false;
    },
    addMarker(event: {
      latlng: any;
      originalEvent: { ctrlKey: any; altKey: any };
    }): void {
      if (
        this.zoom >= 9 &&
        event.latlng &&
        event.originalEvent.ctrlKey &&
        event.originalEvent.altKey
      ) {
        const name = prompt("Enter name:", "__TBD__");
        if (name) {
          projectService.add(event.latlng, name);
        }
      }
    },
    onMarkerClick(location: Project): void {
      this.selectedLocation = location;
      this.isOpened = true;
    },
    onSidePanelClose(): void {
      this.selectedLocation = undefined;
      this.isOpened = false;
    },
    getPin(location: Project): string {
      if (location.category && location.category.length === 0) {
        return "/pins/default.png";
      } else if (location.category && location.category.length === 1) {
        const category = this.getCategoryById(location.category[0]);
        return `/pins/${category?.name.toLowerCase()}.png`;
      } else if (location.category && location.category.length > 1) {
        let name = "";
        location.category.forEach((obj: any, i: number) => {
          const category = this.getCategoryById(location.category[i]);
          name += `${category?.name.toLowerCase()}-`;
        });
        name = name.slice(0, -1);
        return `/pins/${name}.png`;
      } else {
        return "/pins/default.png";
      }
    },
    pinClass(current: Project): string {
      let cssClass =
        this.selectedLocation?.id === current.id ? "marker-selected" : "";
      cssClass +=
        " marker-state-" + current.state?.toLowerCase().replace(" ", "-");
      return cssClass;
    },
    updateMaxBounds(): void {
      if (this.locations && this.locations.length > 0 && this.$refs.map) {
        const group = featureGroup(
          this.locations.map(
            (loc: Project) =>
              new Marker(new LatLng(loc.latitude, loc.longitude)),
          ),
        );
        //this.maxBounds = this.locations.map(
        //  (loc: { latitude: number; longitude: number }) => {
        //    return new LatLngBounds( new LatLng(loc.latitude, loc.longitude), new LatLng(loc.latitude, loc.longitude) );
        //  }
        //);
        const object = (this.$refs.map as any).leafletObject;
        if (object) {
          object.fitBounds(group.getBounds());
        }
      }
    },
    ...mapActions(useLoadingStore, ["updateLoading"]),
  },
});
</script>

<style lang="scss">
@import "leaflet/dist/leaflet.css";

.leaflet-top {
  top: calc(5rem + env(safe-area-inset-top));
}
.leaflet-left {
  left: env(safe-area-inset-left);
}
.leaflet-right {
  right: env(safe-area-inset-right);
}
.leaflet-bottom {
  bottom: env(safe-area-inset-bottom);
}
.leaflet-control-attribution {
  max-width: calc(100vw - 8.5rem);
  font-size: 0.75rem;
}
.leaflet-marker-icon {
  &:hover {
    transform: scale(1.5);
    filter: drop-shadow(0px 0px 10px rgba(210, 28, 28, 0.75));
  }
}
.marker-selected {
  transform: scale(1.25);
  filter: drop-shadow(0px 0px 4px rgb(178, 14, 14));
}

.marker-selected:hover {
  transform: scale(1.5);
  filter: drop-shadow(0px 0px 10px rgba(210, 28, 28, 0.75));
}

.marker-state-planned {
  filter: grayscale(90%) opacity(0.5);
}
.marker-state-under-construction {
  filter: grayscale(80%) opacity(0.9);
}
.marker-state-finished {
  filter: opacity(1);
}

.map {
  width: 100%;
  height: 100%;
}
</style>

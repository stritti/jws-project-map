<template>
  <div class="map">
    <l-map
      ref="map"
      class="map"
      v-model:zoom="zoom" :center="currentCenter"
      crs="EPSG:4326"
      :min-zoom="4"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <l-marker
        v-for="loc in locations"
        :key="loc.id"
        :lat-lng="[loc.latitude, loc.longitude]"
        :id="loc.id"
        :layer-type="loc.type"
        @click="onMarkerClick(loc)"
      >
        <l-icon
          :icon-url="getPin(loc)"
          :class-name="pinClass(loc)"
          :icon-size="[28, 39]"
          :icon-anchor="[14, 39]"
        ></l-icon>
        <l-tooltip>
          {{ loc.name }}
        </l-tooltip>
      </l-marker>
    </l-map>
    <project-details
     :project="selectedLocation"
     :is-opened="isOpened"
     @close="onSidePanelClose" />
  </div>
</template>

<script>
import {
  LMap,
  LTileLayer,
  LMarker,
  LIcon,
  LTooltip,
} from '@vue-leaflet/vue-leaflet'
import ProjectDetails from '@/components/ProjectDetails.vue'
import projectService from '@/services/project.service'

export default {
  name: 'LocationMap',
  components: {
    LMap,
    LMarker,
    LIcon,
    LTileLayer,
    LTooltip,
    ProjectDetails
  },
  data () {
    return {
      map: null,
      zoom: 5,
      currentCenter: [10.125649489417905, -1.9710101407658698],
      locations: [],
      isOpened: false,
      selectedLocation: null
    }
  },
  mounted () {
    projectService.getLocations().then(locations => {
      this.locations = locations;
    })
  },
  methods: {
    onMarkerClick (location) {
      this.selectedLocation = location
      this.isOpened = true
    },
    onSidePanelClose () {
      this.selectedLocation = null
      this.isOpened = false
    },
    getPin (location) {
      return projectService.getLocationTypeImage(location)
    },
    pinClass (current) {
      return this.selectedLocation?.id === current.id ? 'marker-selected' : ''
    }
  }

}
</script>

<style lang="scss">
@import "~leaflet/dist/leaflet.css";

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

.map {
  width: auto;
  height: calc(100vh - 155px);
}
</style>

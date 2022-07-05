<template>
  <div class="map">
    <b-overlay :show="loadingData" class="map__overlay">
    <l-map
      v-if="locations"
      ref="map"
      class="map"
      v-model:zoom="zoom" :center="currentCenter"
      crs="EPSG:4326"
      :min-zoom="4"
      :max-zoom="18"
      :zoom="zoom"
      :bounds="bounds"
      :use-global-leaflet="true"
      :options="mapOptions"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
        attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
      ></l-tile-layer>
      <LCustomMarkerCluster
        :options="markerClusterOptions"
      >
        <l-marker
          v-for="loc in markers"
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
      </LCustomMarkerCluster>
    </l-map>
    </b-overlay>
    <project-details
     :project="selectedLocation"
     :is-opened="isOpened"
     @close="onSidePanelClose" />
  </div>
</template>

<script>
import { mapState } from "pinia"
import { mapActions } from 'pinia'
import { useLoadingStore } from "@/store/loading.store"
import { useCategoryStore } from "@/store/category.store"
import { useProjectStore } from "@/store/project.store"

import { latLngBounds } from "leaflet"
import {
  LMap,
  LTileLayer,
  LMarker,
  LIcon,
  LTooltip,
} from '@vue-leaflet/vue-leaflet'
import LCustomMarkerCluster from '@/components/map/LCustomMarkerCluster'
import ProjectDetails from '@/components/project/ProjectDetails.vue'

export default {
  name: 'LocationMap',
  components: {
    LMap,
    LMarker,
    LIcon,
    LTileLayer,
    LTooltip,
    LCustomMarkerCluster,
    ProjectDetails
  },
  data () {
    return {
      zoom: 5,
      currentCenter: [10.12564948, -1.97101014],
      bounds: latLngBounds([
        [-14.59812590, 5.89972330],
        [8.94900750, 11.32232600]
      ]),
      maxBounds: latLngBounds([
        [-14.59812590, 5.89972330],
        [8.94900750, 11.32232600]
      ]),
      isOpened: false,
      selectedLocation: null,
      mapOptions: {
        zoomSnap: 0.5
      },
      markerClusterOptions: { // Put here options handled by leaflet-markerCluster (https://github.com/Leaflet/Leaflet.markercluster#options)
        animateAddingMarkers: true,
        maxClusterRadius: 30
      }
    }
  },
  async mounted () {
    if (this.locations) {
      this.updateMaxBounds()
    }
    const store = useProjectStore()
    // this subscription will be kept after the component is unmounted
    store.$subscribe(() => {
      this.updateMaxBounds()
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
      if(location.pincat !== null) {
        return `/pins/${location.pincat?.name.toLowerCase()}.png`
      } else {
        return '/pins/default.png'
      }
    },
    pinClass (current) {
      return this.selectedLocation?.id === current.id ? 'marker-selected' : ''
    },
    updateMaxBounds () {
      if(this.locations && this.locations.size > 0 &&  this.$refs.map) {
        this.maxBounds = this.locations.map(loc => { return [loc.latitude, loc.longitude]})
        this.$refs.map.leafletObject.fitBounds(this.maxBounds)
      }
    },
    ...mapActions(useLoadingStore, ['updateLoading']),
  },
  computed: {
    ...mapState(useCategoryStore, {
      getCategoryById: store => store.getById
    }),
    ...mapState(useLoadingStore, {
      loadingData: store => store.showLoadingSpinner
    }),
    ...mapState(useProjectStore, {
      locations: store => store.projects
    }),
    markers () {
      const marker = []
      if (this.locations && this.locations.length > 0) {
        this.locations.forEach(loc => {
          loc.category.forEach(cat => {
            marker.push({
              ...loc,
              pincat: this.getCategoryById(cat)
            })
          })
        })
      }
      return marker

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
  height: 100vh;

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
  }
}
</style>

<template>
  <div class="map">
    <b-overlay :show="showLoadingSpinner" class="map__overlay">
    <l-map
      v-if="locations"
      ref="map"
      class="map"
      v-model:zoom="zoom"
      :center="currentCenter"
      crs="EPSG:4326"
      :min-zoom="4"
      :zoom="zoom"
      :max-zoom="17"
      :bounds="bounds"
      :max--bounds="maxBounds"
      :use-global-leaflet="true"
      :options="mapOptions"
      @click="addMarker"
    >
      <l-control-layers ref="control"></l-control-layers>
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
        attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
      ></l-tile-layer>
      <l-layer-group
        layerType="overlay"
        name="Projects"
      >
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
  LControlLayers,
  LLayerGroup,
  LTileLayer,
  LMarker,
  LIcon,
  LTooltip,
} from '@vue-leaflet/vue-leaflet'
import ProjectDetails from '@/components/project/ProjectDetails.vue'
import projectService from '@/services/project.service'

export default {
  name: 'LocationMap',
  components: {
    LMap,
    LControlLayers,
    LLayerGroup,
    LMarker,
    LIcon,
    LTileLayer,
    LTooltip,
    ProjectDetails
  },
  data () {
    return {
      zoom: 5.5,
      currentCenter: [10.125649489417905, -1.9710101407658698],
      bounds: latLngBounds([
        [-14.59812590, 5.89972330],
        [8.94900750, 11.32232600]
      ]),
      maxBounds: latLngBounds([
        [-14.59812590, 5.89972330],
        [8.94900750, 11.32232600]
      ]),
      categories: [],
      isOpened: false,
      selectedLocation: null,
      mapOptions: {
        zoomSnap: 0.5
      },
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

      /*
      this.$refs.map.leafletObject.addEventListener('mousemove', (event) => {
        let lat = Math.round(event.latlng.lat * 100000) / 100000
        let lng = Math.round(event.latlng.lng * 100000) / 100000
        console.log(lat, lng)
      })
      */
    })
  },
  methods: {
    addMarker(event) {
      if(
        this.zoom >= 9 &&
        event.latlng &&
        event.originalEvent.ctrlKey &&
        event.originalEvent.altKey
      ) {
        const name = prompt("Enter name:", "__TBD__");
        if(name) {
          projectService.add(event.latlng, name)
        }
      }
    },
    onMarkerClick (location) {
      this.selectedLocation = location
      this.isOpened = true
    },
    onSidePanelClose () {
      this.selectedLocation = null
      this.isOpened = false
    },
    getPin (location) {
      if(location.category && location.category.length === 0) {
        return '/pins/default.png'
      } else if(location.category && location.category.length === 1) {
        const category = this.getCategoryById(location.category[0])
        return `/pins/${category?.name.toLowerCase()}.png`
      } else if(location.category && location.category.length > 1) {

        let name = ''
        location.category.forEach( (obj, i) => {
          const category = this.getCategoryById(location.category[i])
          name += `${category?.name}-`
        })
        name = name.slice(0, -1)
        return `/pins/${name.toLowerCase()}.png`
      } else {
        return '/pins/default.png'
      }
    },
    pinClass (current) {
      let cssClass = this.selectedLocation?.id === current.id ? 'marker-selected' : ''
      cssClass += ' marker-state-' + current.state?.toLowerCase().replace(' ', '-')
      return cssClass
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
      showLoadingSpinner: store => store.showLoadingSpinner
    }),
    ...mapState(useProjectStore, {
      locations: store => store.projects
    })
  }
}
</script>

<style lang="scss">
@import "~leaflet/dist/leaflet.css";

.leaflet-top {
    top: 5rem;
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
  width: auto;
  height: 100vh;

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
  }
}
</style>

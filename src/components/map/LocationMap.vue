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
        :title="loc.name"
        @click="onMarkerClick(loc)"
      >
        <l-tooltip>
          {{ loc.name }}
        </l-tooltip>
      </l-marker>
    </l-map>

    <VueSidePanel
      v-model="isOpened"
      :overlay-opacity="0"
      z-index="9999"
      side="right"
      :no-close="false"
      lock-scroll
      hide-close-btn
    >
      <template #header>
        <div class="map__sidepanel-header">
          <span class="close-btn" @click="onSidePanelClose">x</span>
          <h2>Project Details</h2>
        </div>
      </template>
      <template #default>
        <div v-if="selectedLocation"
          class="map__sidepanel-content">
          <h2>{{ selectedLocation.name }}</h2>
          <div v-if="selectedLocation.teaserImg">
            <img
              class="map__teaser-img"
              :src="selectedLocation.teaserImg[0].thumbnails.large.url" />
          </div>
          <p v-if="selectedLocation.notes"
            v-html="selectedLocation.notes"></p>
        </div>
      </template>
      <template #footer>
        <div class="map__sidepanel-footer">
          <p>
            <strong><a href="https://www.joerg-wolff-stiftung.de/">Jörg Wolff Stiftung</a></strong>,
            Kölner Straße 8, 70376 Stuttgart, Germany
          </p>
          <p>
            Tel. +49 (0) 711/540 04-10,
            <a href="mailto:info@joerg-wolff-stiftung.de">info@joerg-wolff-stiftung.de</a>
          </p>
        </div>
      </template>
    </VueSidePanel>

  </div>
</template>

<script>
import {
  LMap,
  LTileLayer,
  LMarker,
  LTooltip,
} from '@vue-leaflet/vue-leaflet'
import projectService from '@/services/project.service'

export default {
  name: 'LocationMap',
  components: {
    LMap,
    LMarker,
    LTileLayer,
    LTooltip
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
    }
  }

}
</script>

<style lang="scss" scoped>
@import "~leaflet/dist/leaflet.css";

.map {
  width: auto;
  height: calc(100vh - 155px);

  &__teaser-img {
    max-width: 440px;
    max-height: 380px;
    height: auto;
  }

  &__sidepanel-header {
    background-color: rgb(61, 94, 158);
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    padding: 20px;

    .close-btn {
      position: absolute;
      top: 0;
      right: 0;
      padding: 10px;
      cursor: pointer;
    }
  }
  &__sidepanel-content {
    padding: 20px;
  }

  &__sidepanel-footer {
    margin: 0;
    padding: 1rem;
    background-color: #000;
    color: #fff;
    p  {
      font-size: 12px;
    }
    a {
      background-color: #000;
      color: #fff;
      text-decoration: none;
    }
  }
}

</style>

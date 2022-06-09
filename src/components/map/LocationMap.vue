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
      >
        <l-tooltip>
          {{ loc.name }}
        </l-tooltip>
        <l-popup>
          <h3>{{ loc.name }}</h3>
          <div v-if="loc.teaserImg">
            <img
              class="map__teaser-img"
              :src="loc.teaserImg[0].thumbnails.large.url" />
          </div>
          <p v-if="loc.notes"
            v-html="loc.notes"></p>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script>
import {
  LMap,
  LTileLayer,
  LMarker,
  LTooltip,
  LPopup
} from '@vue-leaflet/vue-leaflet'
import projectService from '@/services/project.service'

export default {
  name: 'LocationMap',
  components: {
    LMap,
    LMarker,
    LTileLayer,
    LTooltip,
    LPopup
  },
  data () {
    return {
      map: null,
      zoom: 6,
      currentCenter: [10.125649489417905, -1.9710101407658698],
      locations: [],
      geojsonOptions: {
        // Options that don't rely on Leaflet methods.
      },
    }
  },
  async beforeMount() {
    // HERE is where to load Leaflet components!
    const { circleMarker } = await import("leaflet/dist/leaflet-src.esm");

    // And now the Leaflet circleMarker function can be used by the options:
    this.geojsonOptions.pointToLayer = (feature, latLng) =>
      circleMarker(latLng, { radius: 8 });
    this.mapIsReady = true;
  },
  mounted () {
    projectService.getLocations().then(locations => {
      this.locations = locations;
    })
  }

}
</script>

<style lang="scss" scoped>
@import "~leaflet/dist/leaflet.css";

.map {
  width: auto;
  height: 80vh;

  &__teaser-img {
    max-width: 240px;
    max-height: 240px;
    height: auto;
  }
}

</style>

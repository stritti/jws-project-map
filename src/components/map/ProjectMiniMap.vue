<template>
  <l-map
    :zoom="13"
    :center="[lat, lng]"
    :options="mapOptions"
    :use-global-leaflet="true"
    style="height: 300px; width: 100%"
  >
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
    <l-marker :lat-lng="[lat, lng]" :icon="detailMarkerIcon" />
  </l-map>
</template>

<script setup lang="ts">
import { computed } from "vue";
import L from "leaflet";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

defineProps<{
  lat: number;
  lng: number;
}>();

const mapOptions = {
  zoomControl: true,
  scrollWheelZoom: false,
};

const detailMarkerIcon = computed(() => {
  return L.divIcon({
    className: "detail-marker-icon",
    html: `<div style="
      width: 28px; height: 28px;
      background: #3d5e9e;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }) as unknown as L.Icon;
});
</script>

<template>
  <div class="home">
    <h1>JWF + Humanaktiv: Wells and Schools in Westafrica</h1>
    <location-map />
  </div>
</template>

<script>
import LocationMap from '@/components/map/LocationMap.vue'

export default {
  name: 'HomeView',
  components: {
    LocationMap
  }
}
</script>

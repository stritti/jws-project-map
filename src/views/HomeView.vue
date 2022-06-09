<template>
  <div class="home">
    <h1>JWF + Humanaktiv Wells and School Westafrica</h1>
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

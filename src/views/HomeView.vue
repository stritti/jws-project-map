<template>
  <div class="home">
    <h1>JWF + Humanaktiv: Projects in Westafrica</h1>
    <div class="project-map">
      <location-map />
    </div>
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
<style lang="scss" scoped>
.home {
  h1 {
    top: 0;
    right: 0;
    padding: 1rem;
    margin-left: 60px;
    position: absolute;
    z-index: 10;
    background-color: rgba($color: #ffffff, $alpha: .5);
  }

  .project-map {
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 1;
  }
}
</style>
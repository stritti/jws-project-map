<template>
  <div class="main-menu">
    <b-dropdown
      id="dropdown-dropup"
      dropup
      variant="primary"
      class="m-2"
    >
      <template #button-content>
        <bootstrap-icon icon="list"/> Menu
      </template>
      <b-dropdown-item to="/">Map</b-dropdown-item>
      <b-dropdown-item to="/project/">List</b-dropdown-item>
      <b-dropdown-item to="/about">About</b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import BootstrapIcon from '@dvuckovic/vue3-bootstrap-icons'
export default {
  name: 'MainMenu',
  components: {BootstrapIcon}

}
</script>

<style lang="scss" scoped>
.main-menu {
  position: fixed;
  bottom: 1rem;
  top: calc(100vh - 4rem);
  z-index: 999;
  filter: drop-shadow(4px 4px 4px rgb(25, 25, 25));
}
</style>
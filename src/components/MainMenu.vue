<template>
  <div class="main-menu">
    <b-dropdown id="dropdown-dropup" dropup text="Menu" variant="primary" class="m-2">
        <b-dropdown-item to="/">Map</b-dropdown-item>
        <b-dropdown-item to="/project/">List</b-dropdown-item>
        <b-dropdown-item to="/about">About</b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
export default {

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
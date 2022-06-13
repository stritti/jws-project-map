<template>
  <div class="main-menu">
    <b-dropdown id="dropdown-dropup" dropup text="Menu" variant="secondary" class="m-2">
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
  left: 1rem;
  z-index: 999;
}
</style>
<template>
  <div class="main-menu">
    <b-dropdown id="dropdown-dropup" dropup variant="primary" class="m-2">
      <template #button-content> <IBiList /> Menu </template>
      <b-dropdown-item to="/">Map</b-dropdown-item>
      <b-dropdown-item to="/project/">List</b-dropdown-item>
      <b-dropdown-item to="/about">About</b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MainMenu",
});
</script>

<style lang="scss" scoped>
.main-menu {
  z-index: 999;
  filter: drop-shadow(4px 4px 4px rgb(25, 25, 25));
}
</style>

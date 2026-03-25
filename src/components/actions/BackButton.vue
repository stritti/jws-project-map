<template>
  <b-button
    size="sm"
    title="go back"
    variant="light"
    class="back-button-inner d-flex align-items-center justify-content-center"
    @click="$router.go(-1)"
  >
    <IBiArrowLeft class="fs-5" />
  </b-button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BackButton",
});
</script>

<style lang="scss" scoped>
.back-button-inner {
  padding: 0;
  color: var(--bs-primary);
  border: 1px solid var(--bs-border-color);
  
  &:hover {
    background-color: var(--bs-primary);
    color: #fff;
    border-color: var(--bs-primary);
  }
}
</style>

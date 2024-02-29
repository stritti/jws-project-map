<template>
  <b-button size="sm" title="go back" variant="outline-light" @click="$router.go(-1)"
    >&lt;&nbsp;Back</b-button
  >
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BackButton",
});
</script>

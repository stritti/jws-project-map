<script setup lang="ts">
import { onMounted, ref } from "vue";

// Renders the default slot only after mount, so browser-only children
// (e.g. the Leaflet map) are never executed during SSG/hydration.
// Render the placeholder slot meanwhile, if given.
const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
});
</script>

<template>
  <slot v-if="mounted" />
  <slot v-else name="placeholder" />
</template>

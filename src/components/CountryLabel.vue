<template>
  <span v-if="countryId" class="country-label">
    <span :class="countryClass" aria-hidden="true"></span>&nbsp;{{ countryLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCountryStore } from "@/stores/country.store";

const props = withDefaults(
  defineProps<{
    countryId?: number | null;
  }>(),
  { countryId: null },
);

const countryStore = useCountryStore();

const countryLabel = computed<string>(() => {
  if (props.countryId && countryStore.getById(props.countryId)) {
    return countryStore.getDisplayName(props.countryId);
  } else {
    return "";
  }
});

const countryClass = computed(() => {
  if (props.countryId && countryStore.getById(props.countryId)) {
    return `fi fis fi-${countryStore.getById(props.countryId)?.code}`;
  } else {
    return "";
  }
});
</script>

<style lang="postcss" scoped>
@reference "../assets/main.css";

.country-label {
  @apply inline-flex items-center text-onSurface text-body-md leading-body-md gap-[var(--spacing-unit)];
}

/* Flag icon styling */
.country-label [class^="fi-"] {
  @apply text-[1.5rem] w-[2rem] inline-block leading-none align-middle;
}

/* Ensure proper aspect ratio for flags (typically 3:2 or 2:1) */
.country-label [class^="fi-"]::before {
  display: block;
  width: 1.5rem;
  height: 1rem;
  content: '';
}
</style>

<template>
  <span v-if="countryId" class="country-label" :class="{ compact }">
    <span :class="countryClass" aria-hidden="true"></span>&nbsp;{{ countryLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCountryStore } from "@/stores/country.store";

const props = withDefaults(
  defineProps<{
    countryId?: number | null;
    compact?: boolean;
  }>(),
  { countryId: null, compact: false },
);

const countryStore = useCountryStore();

const country = computed(() =>
  props.countryId ? countryStore.getById(props.countryId) : undefined,
);

const countryLabel = computed<string>(() =>
  country.value ? countryStore.getDisplayName(country.value.id) : "",
);

const countryClass = computed(() =>
  country.value ? `fi fis fi-${country.value.code}` : "",
);
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

/* Compact variant for dense rows (e.g. search suggestions) */
.country-label.compact {
  @apply text-label-sm gap-[calc(var(--spacing-unit)*0.5)];
}

.country-label.compact [class^="fi-"] {
  @apply w-[1.25rem];
}

.country-label.compact [class^="fi-"]::before {
  width: 1rem;
  height: 0.67rem;
}
</style>

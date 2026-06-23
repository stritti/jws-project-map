<template>
  <span v-if="countryId" class="country-label">
    <span :class="countryClass" aria-hidden="true"></span>&nbsp;{{ countryLabel }}
  </span>
</template>

<script lang="ts">
import { mapState } from "pinia";
import { useCountryStore } from "../stores/country.store";
import { defineComponent } from "vue";

export default defineComponent({
  name: "CountryLabel",
  props: {
    countryId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  computed: {
    ...mapState(useCountryStore, {
      getById: (store) => store.getById,
      getDisplayName: (store) => store.getDisplayName,
    }),
    countryLabel(): string {
      if (this.countryId && this.getById(this.countryId)) {
        return this.getDisplayName(this.countryId);
      } else {
        return "";
      }
    },
    countryClass() {
      if (this.countryId && this.getById(this.countryId)) {
        return `fi fis fi-${this.getById(this.countryId)?.code}`;
      } else {
        return "";
      }
    },
  },
});
</script>

<style lang="postcss" scoped>
.country-label {
  @apply inline-flex items-center text-onSurface text-body-md font-body-md leading-body-md gap-[var(--spacing-unit)];
}

/* Flag icon styling */
.country-label [class^="fi-"] {
  @apply text-[1.5rem] w-[2rem] inline-block leading-none align-middle;
}

/* Ensure proper aspect ratio for flags (typically 3:2 or 2:1) */
.country-label [class^="fi-"]::before {
  @apply block w-[1.5rem] h-[1rem] content-[''];
}
</style>

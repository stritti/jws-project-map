<template>
  <span v-if="countryId" class="country-label">
    <span :class="countryClass"></span>&nbsp;{{ countryLabel }}
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

<style lang="scss" scoped>
@use "@/assets/design-tokens.scss" as *;

.country-label {
  display: inline-flex;
  align-items: center;
  color: var(--color-on-surface);
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-body-md);
  line-height: var(--line-height-body-md);
  gap: var(--spacing-unit);
}

/* Flag icon styling */
.country-label [class^="fi-"] {
  font-size: 1.5rem; /* 24px height for flag */
  width: 2rem; /* 32px width to maintain aspect ratio */
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
}

/* Ensure proper aspect ratio for flags (typically 3:2 or 2:1) */
.country-label [class^="fi-"]::before {
  display: block;
  width: 1.5rem; /* 24px */
  height: 1rem;  /* 16px */
  content: "";
}
</style>

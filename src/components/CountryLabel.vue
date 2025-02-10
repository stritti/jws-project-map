<template>
  <span v-if="countryId" class="country-label">
    <span :class="countryClass"></span>&nbsp;{{ countryLabel }}
  </span>
</template>

<script lang="ts">
import "flag-icons/css/flag-icons.min.css";
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
    }),
    countryLabel(): string {
      if (this.countryId && this.getById(this.countryId)) {
        return this.getById(this.countryId)?.name as string;
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

<style lang="scss">
// Remove explicit import as we're now using the minified CSS
</style>

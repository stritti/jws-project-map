<template>
  <span v-if="countryId" class="country-label"
    ><span :class="countryClass"></span>&nbsp;{{ countryLabel }}
  </span>
</template>

<script lang="ts">
import { mapState } from "pinia";
import { useCountryStore } from "../stores/country.store";
import "flag-icons/sass/flag-icons.scss";

import { defineComponent } from "vue";

export default defineComponent({
  name: "CountryLabel",
  props: {
    countryId: {
      type: Array<string>,
      required: false,
      default: null,
    },
  },
  computed: {
    ...mapState(useCountryStore, {
      getById: (store) => store.getById,
    }),
    countryLabel(): string {
      if (this.countryId[0] && this.getById(this.countryId[0])) {
        return this.getById(this.countryId[0])?.name as string;
      } else {
        return "";
      }
    },
    countryClass() {
      if (this.countryId[0] && this.getById(this.countryId[0])) {
        return `fi fis fi-${this.getById(this.countryId[0])?.code}`;
      } else {
        return "";
      }
    },
  },
});
</script>

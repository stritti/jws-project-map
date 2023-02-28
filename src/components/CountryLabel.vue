<template>
  <span v-if="countryId" class="country-label">
    <span :class="countryClass"></span>&nbsp;{{ countryLabel }}
  </span>
</template>

<script lang="ts">
import { mapState } from 'pinia';
import { useCountryStore } from '../stores/country.store';
import 'flag-icons/sass/flag-icons.scss';

export default {
  name: 'CountryLabel',
  props: {
    countryId: {
      type: Array,
      required: false,
      default: null,
    },
  },
  computed: {
    ...mapState(useCountryStore, {
      getById: (store) => store.getById,
    }),
    countryLabel() {
      return this.getById(this.countryId[0]).name;
    },
    countryClass() {
      return `fi fis fi-${this.getById(this.countryId[0]).code}`;
    },
  },
};
</script>

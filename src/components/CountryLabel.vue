<template>
  <span
    v-if="countryId"
    class="country-label"
    v-text="countryLabel"
  ></span>
</template>

<script>
import { mapState } from 'pinia'
import { useCountryStore } from '@/store/country.store'

export default {
  name: 'CountryLabel',
  props: {
    countryId: {
      type: Array,
      required: false,
      default: null
    }
  },
  computed: {
    ...mapState(useCountryStore, {
      getById: store => store.getById
    }),
    countryLabel () {
      return this.getById(this.countryId[0]).name
    }
  }
}
</script>

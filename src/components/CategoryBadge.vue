<template>
  <b-badge pill :variant="typeVariant">{{displayName}}</b-badge>
</template>

<script>
export default {
  name: 'TypeBadge',
  props: {
    category: {
      type: Object,
      required: true
    }
  },
  computed: {
    typeVariant () {
      switch (this.category.name) {
        case 'well':
          return 'primary'
        case 'school':
          return 'warning'
        case 'school+well':
          return 'danger'
        default:
          return 'secondary'
      }
    },
    displayName () {
    switch (this.category.name) {
      case 'well':
        return 'Well'
      case 'school':
        return 'School'
      default:
        return this.category.name
    }
    }
  }


}
</script>

<style>

</style>
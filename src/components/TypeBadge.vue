<template>
  <b-badge pill :variant="typeVariant">{{displayName}}</b-badge>
</template>

<script>
export default {
  name: 'TypeBadge',
  props: {
    type: {
      type: String,
      required: true
    }
  },
  computed: {
    typeVariant () {
      switch (this.type) {
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
    switch (this.type) {
      case 'well':
        return 'Well'
      case 'school':
        return 'School'
      case 'school+well':
        return 'School & Well'
      default:
        return 'Unknown'
    }
    }
  }


}
</script>

<style>

</style>
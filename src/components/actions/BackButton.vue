<template>
  <b-button size="sm" title="go back" @click="$router.go(-1)"
    >&lt;&nbsp;Back</b-button
  >
</template>

<script lang="ts">
export default {
  name: 'BackButton',
};
</script>

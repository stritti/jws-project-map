<template>
  <b-button
    @click="$router.go(-1)"
    size="sm"
    title="go back">&lt;&nbsp;Back</b-button>
</template>

<script>
export default {
  name: "BackButton",
}
</script>

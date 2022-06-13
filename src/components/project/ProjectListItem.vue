<template>
  <router-link :to="`/project/${project.id}`">
    <b-card class="project-list-item">
      <b-card-img v-if="project.teaserImg"
        class="teaser-img"
        :src="project.teaserImg[0].thumbnails.large.url"
        :alt="project.name"
        top
        fluid
        />
        <div v-else class="teaser-img-placeholder"></div>
        <b-card-body>
        <b-card-text>
           <h3>{{ project.name }}</h3>
        </b-card-text>
      </b-card-body>
    </b-card>
  </router-link>
</template>

<script>
export default {
  name: 'ProjectListItem',
  props: {
    project: {
      type: Object,
      required: false,
      default: null
    }
  }
}
</script>

<style type="scss" scoped>
.project-list-item {
  width: 380px;
  margin: 1rem;
}
.teaser-img-placeholder {
  width: 100%;
  height: 230px;
  background-color: #eee;
}

</style>
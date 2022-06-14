<template>
  <router-link :to="`/project/${project.id}`">
    <b-card class="project-list-item" no-body>
      <b-card-img v-if="project.teaserImg"
        class="teaser-img"
        :src="project.teaserImg[0].thumbnails.large.url"
        :alt="project.name"
        img-top
        fluid
      />
      <div v-else class="teaser-img-placeholder"></div>
      <b-card-body>
        <b-card-text>
           <h3>{{ project.name }}</h3>
          <category-badge v-for="category in project.category"
              v-bind:key="category.id" :category="category" />
        </b-card-text>
      </b-card-body>
    </b-card>
  </router-link>
</template>

<script>
import CategoryBadge from '@/components/CategoryBadge.vue'

export default {
  components: { CategoryBadge },
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
  width: 320px;
  margin: 10px;
}
.teaser-img-placeholder {
  width: 100%;
  height: 230px;
  background-color: #eee;
}

</style>
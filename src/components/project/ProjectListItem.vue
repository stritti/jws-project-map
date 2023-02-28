<template>
  <router-link :to="`/project/${project.id}`">
    <b-card class="project-list-item" no-body>
      <b-card-img
        :class="imageStyleClasses"
        :src="teaserImage"
        :alt="project.name"
        top
        lazy
      />
      <h3 class="project-list-item__title text-truncate">
        {{ project.name }}
      </h3>
      <b-card-body :sub-title="null">
        <category-badge
          v-for="category in project.category"
          :key="category"
          :category-id="category"
        />
        <div v-if="project.country">
          <country-label :country-id="project.country" />
        </div>
        <div>Project State: {{ project.state }}</div>
      </b-card-body>
    </b-card>
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CategoryBadge from "../../components/CategoryBadge.vue";
import CountryLabel from "../../components/CountryLabel.vue";

export default defineComponent({
  name: "ProjectListItem",
  components: { CategoryBadge, CountryLabel },
  props: {
    project: {
      type: Object,
      required: true,
    },
  },
  computed: {
    teaserImage() {
      if (this.project.teaserImg) {
        return this.project.teaserImg[0].thumbnails.large.url;
      } else {
        return "/img/placeholder.png";
      }
    },
    imageStyleClasses() {
      return this.project.state.replace(" ", "-");
    },
  },
});
</script>

<style lang="scss" scoped>
a {
  color: inherit;
  text-decoration: none;
}

.project-list-item {
  min-height: 24rem;
  &__title {
    padding: 1rem;
    font-size: 1.2em;
    text-decoration: none;
    color: #eee;
    background-color: rgb(61, 94, 158);
  }

  .card-img-top {
    min-height: 15rem;
    max-height: 15rem;
    object-fit: cover;
    object-position: 100% 0;
  }
}

.under-construction {
  filter:grayscale(0.85) &::after {
    content: "... still under construction ...";
    position: absolute;
    top: 80px;
    white-space: pre;
    right: 15px;
    font-weight: bold;
    text-align: right;
    font-size: 30px;
  }
}

.planned {
  filter:grayscale(0.85) &::after {
    content: "just planned";
    position: absolute;
    top: 80px;
    white-space: pre;
    right: 15px;
    font-weight: bold;
    text-align: right;
    font-size: 30px;
  }
}
</style>

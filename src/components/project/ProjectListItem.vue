<template>
  <router-link :to="`/project/${project.id}`">
    <b-card class="project-list-item" no-body>
      <b-card-img
        :class="imageStyleClasses"
        :src="teaserImage"
        :lazy="true"
        :alt="project.name"
        top
      />
      <h3 class="project-list-item__title text-truncate">
        {{ project.name }}
      </h3>
      <b-card-body :sub-title="null">
        <div class="category-badges mb-2">
          <category-badge
            v-for="category in project.category"
            :key="category.Id"
            :category-id="category.Id"
          />
        </div>
        <div v-if="project.country && project.country.Id">
          <country-label :country-id="project.country.Id" />
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
      if (this.project.teaserImg && this.project.teaserImg.length > 0) {
        const img = this.project.teaserImg[0];
        return img.thumbnails?.card_cover?.signedUrl || img.signedUrl || "/img/placeholder.png";
      } else {
        return "/img/placeholder.png";
      }
    },
    imageStyleClasses() {
      return this.project.state ? this.project.state.replace(" ", "-") : "";
    },
  },
});
</script>

<style lang="scss">
a {
  color: inherit;
  text-decoration: none;
}

.project-list-item {
  min-height: 24rem;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: none !important;
  border-radius: 1.25rem !important;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  background: #fff;
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);

    .card-img-top {
      transform: scale(1.08);
    }

    .project-list-item__title {
      background: linear-gradient(
        135deg,
        rgb(70, 105, 175) 0%,
        rgb(61, 94, 158) 100%
      );
    }
  }

  &__title {
    padding: 1.25rem 1rem;
    font-size: 1.3rem;
    font-weight: 700;
    text-decoration: none;
    color: #fff;
    background: linear-gradient(
      135deg,
      rgb(61, 94, 158) 0%,
      rgb(45, 70, 120) 100%
    );
    margin: 0;
    transition: background 0.3s ease;
  }

  .card-img-top {
    min-height: 15rem;
    max-height: 15rem;
    object-fit: cover;
    object-position: center;
    transition: transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .category-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
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

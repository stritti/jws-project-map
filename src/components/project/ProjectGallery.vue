<template>
  <div v-if="project.gallery">
    <hr />
    <h2>Gallery</h2>
    <BCarousel controls indicators fade class="project-details__gallery">
      <BCarouselSlide v-for="img in images" :key="img.src" :img-src="img.src" fluid class="gallery__image"/>

      <BCarouselSlide v-for="video in videos" :key="video.src" class="gallery__video">
        <template #img>
          <vue3-video-player
            :src="video.src"
            :type="video.type"
            :muted="false"
            preload="auto"
          />
        </template>
      </BCarouselSlide>
    </BCarousel>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import type { Project } from '@/interfaces/Project';

export default defineComponent({
  name: 'ProjectGallery',
  props: {
    project: {
      type: Object as PropType<Project>,
      required: true
    }
  },
  computed: {
    images() {
      return this.project.gallery
        .filter((img: any) => img.mimetype.startsWith("image"))
        .map((img: any) => {
          return {
            src: img.signedUrl,
            w: img.width,
            h: img.height,
            thumbnail: img.thumbnails.card_cover.signedUrl,
          };
        });
    },
    videos() {
      return this.project.gallery
        .filter((item: any) => item.mimetype.startsWith("video"))
        .map((item: any) => {
          return {
            src: item.signedUrl,
            type: item.type,
            size: item.size,
          };
        });
    },
  }
});
</script>

<style lang="scss" scoped>
.project-details__gallery {
  margin-top: 1rem;
  margin-bottom: 1rem;
  max-width: 780px;
}
.gallery__image {
  min-width: 220px;
  width: auto;
  max-width: 780px;
  margin: 0.25rem;
}
.gallery__video {
  min-width: 220px;
  width: auto;
  max-width: 80vw;
  margin: 0.25rem;
}
</style>

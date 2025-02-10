<template>
  <div v-if="isVisible" class="fullscreen-gallery">
    <div class="gallery-close" @click="$emit('update:isVisible', false)">
      <span>&times;</span>
    </div>
    <BCarousel 
      ref="carousel"
      v-model="currentIndex" 
      controls 
      indicators 
      :interval="0" 
      no-hover-pause
      no-animation
      class="gallery-carousel"
    >
      <BCarouselSlide 
        v-for="(item, index) in galleryItems" 
        :key="index"
      >
        <template #img>
          <div class="gallery-content">
            <template v-if="item.mimetype.startsWith('image')">
              <img
                :src="item.signedUrl"
                :alt="item.name"
                class="gallery-image"
              />
            </template>
            <template v-else-if="item.mimetype.startsWith('video')">
              <vue3-video-player
                :src="item.signedUrl"
                :type="item.type"
                :muted="false"
                preload="auto"
                class="gallery-video"
              />
            </template>
          </div>
        </template>
        <template #caption>
          {{ item.name }}
        </template>
      </BCarouselSlide>
    </BCarousel>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';

export default defineComponent({
  name: 'ProjectGalleryModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    currentItem: {
      type: Object as PropType<any>,
      default: null
    },
    galleryItems: {
      type: Array as PropType<any[]>,
      default: () => []
    }
  },
  emits: ['update:isVisible'],
  setup(props) {
    const currentIndex = ref(0);
    const carousel = ref(null);

    const findCurrentIndex = () => {
      if (props.currentItem) {
        const index = props.galleryItems.findIndex(
          item => item.signedUrl === props.currentItem.signedUrl
        );
        return index !== -1 ? index : 0;
      }
      return 0;
    };

    watch(() => props.currentItem, () => {
      currentIndex.value = findCurrentIndex();
    }, { immediate: true });

    return {
      currentIndex,
      carousel
    };
  }
});
</script>

<style scoped>
.fullscreen-gallery {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
}

.gallery-close {
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 3rem;
  cursor: pointer;
  z-index: 10000;
}

.gallery-carousel {
  width: 100%;
  height: 100%;
}

.gallery-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
}

.gallery-image, .gallery-video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

:deep(.carousel-caption) {
  color: white;
  text-align: center;
  font-size: 1.2rem;
  max-width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  left: 50%;
  transform: translateX(-50%);
}

:deep(.carousel-control-prev-icon),
:deep(.carousel-control-next-icon) {
  width: 3rem;
  height: 3rem;
}
</style>

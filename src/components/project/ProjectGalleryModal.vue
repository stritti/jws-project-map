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
      background="rgba(0, 0, 0, 0.3)"
      class="gallery-carousel"
      @slide="onSlide"
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
              <div class="gallery-video">
                <vue3-video-player
                  ref="videoPlayers"
                  :src="item.signedUrl"
                  :type="item.type"
                  :muted="false"
                  preload="auto"

                />
              </div>
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
import { defineComponent, PropType, ref, watch, nextTick } from 'vue';

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
    const videoPlayers = ref([]);

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
      carousel,
      videoPlayers
    };
  },
  methods: {
    async onSlide() {
      // Pause all video players before changing slides
      await nextTick();
      if (this.videoPlayers) {
        this.videoPlayers.forEach((player: any) => {
          if (player) {
            try {
              player.pause();
            } catch (error) {
              console.warn('Could not pause video player', error);
            }
          }
        });
      }
    }
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
  top: 10px;
  right: 40px;
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
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}
.gallery-image {
  max-width: 100vw;
  max-height: 100vh;
  width: 100%;
  height: 100%;
  object-fit: contain;
  margin: 0;
}

.gallery-video {
  max-width: 80vw;
  max-height: 80vh;
  width: 100%;
  height: 100%;
  object-fit: contain;
  margin: 20px;
}

.gallery-content img,
.gallery-content .vue3-video-player {
  display: block; /* Ensure proper centering */
  margin-left: auto;
  margin-right: auto;
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

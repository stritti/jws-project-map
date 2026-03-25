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
              <div class="gallery-video" @click.stop>
                <video
                  ref="videoPlayers"
                  :src="item.signedUrl"
                  :type="item.mimetype"
                  controls
                  preload="metadata"
                  class="native-video-player"
                  style="width: 100%; height: 100%; object-fit: contain;"
                >
                  Your browser does not support the video tag.
                </video>
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
  background-color: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-close {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10000;
  transition: all 0.3s ease;
}

.gallery-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
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
  padding: 2rem;
  box-sizing: border-box;
  overflow: hidden;
}
.gallery-image {
  max-width: 90vw;
  max-height: 80vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.gallery-video {
  max-width: 90vw;
  max-height: 80vh;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
}

.native-video-player {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

:deep(.carousel-caption) {
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  width: 100%;
  padding: 4rem 2rem 2rem;
  bottom: 0;
  left: 0;
  right: 0;
  color: white;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 500;
}

:deep(.carousel-control-prev),
:deep(.carousel-control-next) {
  width: 10vw;
  z-index: 5;
  transition: opacity 0.3s ease;
}

:deep(.carousel-control-prev-icon),
:deep(.carousel-control-next-icon) {
  width: 3.5rem;
  height: 3.5rem;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));
}
</style>

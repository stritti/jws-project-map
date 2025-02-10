<template>
  <div v-if="isVisible" class="fullscreen-gallery">
    <div class="gallery-close" @click="$emit('update:isVisible', false)">
      <span>&times;</span>
    </div>
    <div class="gallery-navigation">
      <div
        v-if="galleryItems.length > 1"
        class="nav-prev"
        @click="prevItem"
      >
        &lt;
      </div>
      <div
        v-if="galleryItems.length > 1"
        class="nav-next"
        @click="nextItem"
      >
        &gt;
      </div>
    </div>
    <div class="gallery-content">
      <template v-if="currentItem.mimetype.startsWith('image')">
        <img
          :src="currentItem.signedUrl"
          :alt="currentItem.name"
          class="gallery-image"
        />
      </template>
      <template v-else-if="currentItem.mimetype.startsWith('video')">
        <vue3-video-player
          :src="currentItem.signedUrl"
          :type="currentItem.type"
          :muted="false"
          preload="auto"
          class="gallery-video"
        />
      </template>
    </div>
    <div class="gallery-caption">
      {{ currentItem.name }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue';

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
  setup(props, { emit }) {
    const currentIndex = ref(0);

    watch(() => props.currentItem, (newItem) => {
      if (newItem) {
        currentIndex.value = props.galleryItems.findIndex(
          item => item.signedUrl === newItem.signedUrl
        );
      }
    }, { immediate: true });

    const prevItem = () => {
      currentIndex.value = (currentIndex.value - 1 + props.galleryItems.length) % props.galleryItems.length;
    };

    const nextItem = () => {
      currentIndex.value = (currentIndex.value + 1) % props.galleryItems.length;
    };

    const currentGalleryItem = computed(() =>
      props.galleryItems[currentIndex.value]
    );

    return {
      currentIndex,
      prevItem,
      nextItem,
      currentGalleryItem
    };
  },
  computed: {
    currentItem(): any {
      return this.currentGalleryItem || this.galleryItems[0];
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

.gallery-navigation {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.nav-prev, .nav-next {
  color: white;
  font-size: 3rem;
  cursor: pointer;
  user-select: none;
  padding: 0 20px;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.nav-prev:hover, .nav-next:hover {
  opacity: 1;
}

.gallery-content {
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gallery-image, .gallery-video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.gallery-caption {
  position: absolute;
  bottom: 20px;
  color: white;
  text-align: center;
  font-size: 1.2rem;
  max-width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

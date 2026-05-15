<template>
  <div v-if="props.isVisible" class="fullscreen-gallery">
    <div class="gallery-close" @click="emit('update:isVisible', false)">
      <span>&times;</span>
    </div>
    <BCarousel
      v-model="currentIndex"
      controls
      indicators
      :interval="0"
      no-hover-pause
      no-animation
      background="rgba(0, 0, 0, 0.3)"
      class="gallery-carousel"
      @slid="onSlid"
    >
<BCarouselSlide
  v-for="(item, index) in props.galleryItems"
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
                  :ref="(el) => setVideoRef(index, el)"
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

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Attachment } from '@/interfaces/Attachment'

const props = defineProps<{
  isVisible: boolean
  currentItem: Attachment | null
  galleryItems: Attachment[]
}>()

const emit = defineEmits<{
  (e: 'update:isVisible', value: boolean): void
}>()

const currentIndex = ref(0)

/**
 * Store active video elements keyed by gallery index.
 * Callback ref pattern is needed for v-for — template refs on v-for
 * produce an array only via Options API `$refs`. In <script setup>
 * we manage them explicitly.
 */
const videoElements = ref<Map<number, HTMLVideoElement>>(new Map())

function setVideoRef(index: number, el: unknown) {
  if (el instanceof HTMLVideoElement) {
    videoElements.value.set(index, el)
  }
}

function onSlid() {
  // Pause all videos after a slide transition completes
  for (const video of videoElements.value.values()) {
    try {
      video.pause()
    } catch {
      // Silently ignore — video may already be paused / detached
    }
  }
}

function findCurrentIndex(): number {
  if (!props.currentItem) return 0
  const index = props.galleryItems.findIndex(
    (item) => item.signedUrl === props.currentItem?.signedUrl,
  )
  return index !== -1 ? index : 0
}

// Keep currentIndex in sync when the parent changes which item is active
watch(
  () => props.currentItem,
  () => {
    currentIndex.value = findCurrentIndex()
  },
  { immediate: true },
)
</script>

<style scoped>
@use "@/assets/design-tokens.scss" as *;

.fullscreen-gallery {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(var(--color-background-rgb), 0.95);
  backdrop-filter: blur(calc(var(--spacing-unit) * 2.5)); /* 10px */
  -webkit-backdrop-filter: blur(calc(var(--spacing-unit) * 2.5)); /* 10px */
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-close {
  position: absolute;
  top: calc(var(--spacing-unit) * 5); /* 20px */
  right: calc(var(--spacing-unit) * 5); /* 20px */
  width: calc(var(--spacing-unit) * 12); /* 48px */
  height: calc(var(--spacing-unit) * 12); /* 48px */
  background: rgba(var(--color-on-surface-rgb), 0.1);
  border: 1px solid rgba(var(--color-on-surface-rgb), 0.2);
  border-radius: var(--shape-round-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-on-surface);
  font-size: calc(var(--spacing-unit) * 7.5); /* 30px */
  cursor: pointer;
  z-index: 10000;
  transition: all 0.3s ease;
}

.gallery-close:hover {
  background: rgba(var(--color-on-surface-rgb), 0.2);
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
  padding: calc(var(--spacing-unit) * 5); /* 20px */
  box-sizing: border-box;
  overflow: hidden;
}
.gallery-image {
  max-width: calc(100vw - var(--spacing-unit) * 4); /* 90vw - 16px */
  max-height: calc(100vh - var(--spacing-unit) * 4); /* 80vh - 16px */
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: var(--shape-round-lg);
  box-shadow: 0 calc(var(--spacing-unit) * 5) calc(var(--spacing-unit) * 15) rgba(0,0,0,0.5);
}

.gallery-video {
  max-width: calc(100vw - var(--spacing-unit) * 4); /* 90vw - 16px */
  max-height: calc(100vh - var(--spacing-unit) * 4); /* 80vh - 16px */
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
  border-radius: var(--shape-round-lg);
  box-shadow: 0 calc(var(--spacing-unit) * 5) calc(var(--spacing-unit) * 15) rgba(0,0,0,0.5);
}

:deep(.carousel-caption) {
  background: linear-gradient(to top, rgba(var(--color-background-rgb), 0.8), transparent);
  width: 100%;
  padding: calc(var(--spacing-unit) * 10) calc(var(--spacing-unit) * 5) calc(var(--spacing-unit) * 5); /* 40px 20px 20px */
  bottom: 0;
  left: 0;
  right: 0;
  color: var(--color-on-surface);
  text-align: center;
  font-size: calc(var(--spacing-unit) * 5); /* 20px */
  font-weight: var(--font-weight-label-md);
}

:deep(.carousel-control-prev),
:deep(.carousel-control-next) {
  width: calc(100vw * 0.1); /* 10vw */
  z-index: 5;
  transition: opacity 0.3s ease;
}

:deep(.carousel-control-prev-icon),
:deep(.carousel-control-next-icon) {
  width: calc(var(--spacing-unit) * 8.75); /* 35px */
  height: calc(var(--spacing-unit) * 8.75); /* 35px */
  filter: drop-shadow(0 calc(var(--spacing-unit) * 0.5) calc(var(--spacing-unit) * 2) rgba(0,0,0,0.5));
}
</style>


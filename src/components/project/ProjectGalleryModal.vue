<template>
  <div v-if="props.isVisible" class="fullscreen-gallery" role="dialog" :aria-label="t('a11y.closeGallery')" tabindex="0" @keydown="onKeydown">
    <button class="gallery-close" @click="closeModal" :aria-label="t('a11y.closeGallery')">
      <span aria-hidden="true">&times;</span>
    </button>

    <button
      class="gallery-nav gallery-nav-prev"
      :class="{ 'gallery-nav-hidden': props.galleryItems.length <= 1 }"
      :aria-label="t('gallery.prevImage', 'Previous image')"
      @click="goPrev"
    >
      <span class="gallery-nav-icon gallery-nav-icon-prev" />
    </button>

    <button
      class="gallery-nav gallery-nav-next"
      :class="{ 'gallery-nav-hidden': props.galleryItems.length <= 1 }"
      :aria-label="t('gallery.nextImage', 'Next image')"
      @click="goNext"
    >
      <span class="gallery-nav-icon gallery-nav-icon-next" />
    </button>

    <BCarousel
      v-model="currentIndex"
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
                :alt="item.name || t('a11y.imageNotAvailable', 'Image not available')"
                class="gallery-image"
                @error="onImageError"
              />
            </template>
            <template v-else-if="item.mimetype.startsWith('video')">
              <div class="gallery-video">
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

    <!-- Screen reader announcement for image position -->
    <div class="sr-only" role="status" aria-live="polite">
      {{ props.isVisible ? t('a11y.imagePosition', { current: currentIndex + 1, total: props.galleryItems.length }) : '' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Attachment } from '@/interfaces/Attachment'
import { useFocusRestore } from '@/composables/useAccessibility'

const { t } = useI18n()
const { setTrigger, restoreFocus } = useFocusRestore()

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

function goPrev() {
  if (props.galleryItems.length <= 1) return
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = props.galleryItems.length - 1
  }
}

function goNext() {
  if (props.galleryItems.length <= 1) return
  if (currentIndex.value < props.galleryItems.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

function closeModal() {
  emit('update:isVisible', false)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    goPrev()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    goNext()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    closeModal()
  }

  function onImageError(event: Event) {
    const target = event.target as HTMLImageElement | null
    if (!target || target.src.endsWith("/img/placeholder.png")) return
    target.src = "/img/placeholder.png"
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

// Capture focus when modal opens, restore when it closes
watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      setTrigger()
    } else {
      restoreFocus()
    }
  },
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
  background-color: rgba(0, 0, 0, 0.88);
  z-index: 9999;
}

/* ── Close Button ── */
.gallery-close {
  position: fixed;
  top: 24px;
  right: 24px;
  left: auto;
  width: 48px;
  height: 48px;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 28px;
  cursor: pointer;
  z-index: 10010;
  transition: background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
  line-height: 1;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  flex-shrink: 0;
  outline: none;
}

.gallery-close:hover {
  background-color: rgba(0, 0, 0, 0.85);
  border-color: #ffffff;
  transform: scale(1.1);
}

.gallery-close:focus-visible {
  outline: 3px solid var(--color-secondary);
  outline-offset: 2px;
}

/* ── Custom Navigation Buttons ── */
.gallery-nav {
  position: absolute;
  top: 75px;
  bottom: 75px;
  width: 48px;
  z-index: 10005;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.3s ease, background-color 0.3s ease;
  padding: 0;
  margin: 0;
}

.gallery-nav-prev {
  left: 0;
}

.gallery-nav-next {
  right: 0;
}

.gallery-nav-hidden {
  display: none;
}

.gallery-nav:hover,
.gallery-nav:focus-visible {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.15);
}

/* Slightly brighter on any hover inside the gallery */
.fullscreen-gallery:hover .gallery-nav {
  opacity: 0.6;
}

.gallery-nav:hover {
  opacity: 1;
}

.gallery-nav-icon {
  display: block;
  width: 36px;
  height: 36px;
  background-size: 36px 36px;
  background-repeat: no-repeat;
  background-position: 50%;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
  transition: transform 0.2s ease;
}

.gallery-nav-icon-prev {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'/%3e%3c/svg%3e");
}

.gallery-nav-icon-next {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
}

.gallery-nav:hover .gallery-nav-icon {
  transform: scale(1.2);
}

/* ── Carousel ── */
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
  z-index: 1;
}

.native-video-player {
  max-width: 100%;
  max-height: 100%;
  border-radius: var(--shape-round-lg);
  box-shadow: 0 calc(var(--spacing-unit) * 5) calc(var(--spacing-unit) * 15) rgba(0,0,0,0.5);
}

/* ── Caption ── */
:deep(.carousel-caption) {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  width: 100%;
  padding: calc(var(--spacing-unit) * 10) calc(var(--spacing-unit) * 5) calc(var(--spacing-unit) * 5); /* 40px 20px 20px */
  bottom: 0;
  left: 0;
  right: 0;
  color: #ffffff;
  text-align: center;
  font-size: calc(var(--spacing-unit) * 5); /* 20px */
  font-weight: var(--font-weight-label-md);
}
</style>

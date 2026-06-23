<template>
  <div v-if="props.isVisible" ref="galleryRef" class="fullscreen-gallery" role="dialog" :aria-label="t('a11y.closeGallery')" tabindex="0" @keydown="onKeydown">
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

    <div class="gallery-carousel">
      <Transition name="slide-fade" mode="out-in">
        <div :key="currentIndex" class="gallery-slide">
          <div class="gallery-content">
            <template v-if="currentItem.mimetype.startsWith('image')">
              <img
                :src="currentItem.signedUrl"
                :alt="currentItem.name || t('a11y.imageNotAvailable', 'Image not available')"
                class="gallery-image"
              />
            </template>
            <template v-else-if="currentItem.mimetype.startsWith('video')">
              <div class="gallery-video">
                <video
                  ref="videoRef"
                  :src="currentItem.signedUrl"
                  :type="currentItem.mimetype"
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
          <div class="gallery-caption">
            {{ currentItem.name }}
          </div>
        </div>
      </Transition>
    </div>

    <!-- Screen reader announcement for image position -->
    <div class="sr-only" role="status" aria-live="polite">
      {{ props.isVisible ? t('a11y.imagePosition', { current: currentIndex + 1, total: props.galleryItems.length }) : '' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
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
const videoRef = ref<HTMLVideoElement | null>(null)

const currentItem = computed(() => {
  return props.galleryItems[currentIndex.value] || props.galleryItems[0]
})

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
  // Pause video before closing
  if (videoRef.value) {
    try {
      videoRef.value.pause()
    } catch {
      // Silently ignore
    }
  }
  emit('update:isVisible', false)
}

const galleryRef = ref<HTMLElement | null>(null)

function trapFocus(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !galleryRef.value) return
  const focusable = galleryRef.value.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

function onKeydown(e: KeyboardEvent) {
  trapFocus(e)
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
  async (visible) => {
    if (visible) {
      setTrigger()
      await nextTick()
      // Focus first focusable element inside the modal (close button)
      const firstFocusable = galleryRef.value?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      firstFocusable?.focus()
    } else {
      restoreFocus()
    }
  },
)
</script>

<style scoped lang="postcss">
.fullscreen-gallery {
  @apply fixed inset-0 w-screen h-screen bg-black/90 z-[9999];
}

/* Close Button */
.gallery-close {
  @apply fixed top-[24px] right-[24px] left-auto w-[48px] h-[48px] bg-black/55 backdrop-blur-[4px] border-2 border-white/70 rounded-full flex items-center justify-center text-white text-[28px] cursor-pointer z-[10010] transition-[background-color,border-color,transform] duration-300 leading-none p-0 m-0 box-border flex-shrink-0 outline-none;
}

.gallery-close:hover {
  @apply bg-black/85 border-white scale-110;
}

.gallery-close:focus-visible {
  @apply outline-3 outline-secondary outline-offset-2;
}

/* Custom Navigation Buttons */
.gallery-nav {
  @apply absolute top-[75px] bottom-[75px] w-[48px] z-[10005] flex items-center justify-center bg-none border-none cursor-pointer opacity-40 transition-[opacity,background-color] duration-300 p-0 m-0;
}

.gallery-nav-prev {
  @apply left-0;
}

.gallery-nav-next {
  @apply right-0;
}

.gallery-nav-hidden {
  @apply hidden;
}

.gallery-nav:hover,
.gallery-nav:focus-visible {
  @apply opacity-1000 bg-black/15;
}

/* Slightly brighter on any hover inside the gallery */
.fullscreen-gallery:hover .gallery-nav {
  @apply opacity-60;
}

.gallery-nav:hover {
  @apply opacity-1000;
}

.gallery-nav-icon {
  @apply block w-[36px] h-[36px] bg-[length:36px_36px] bg-no-repeat bg-center filter-drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] transition-transform duration-200;
}

.gallery-nav-icon-prev {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'/%3e%3c/svg%3e");
}

.gallery-nav-icon-next {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
}

.gallery-nav:hover .gallery-nav-icon {
  @apply scale-125;
}

/* Carousel */
.gallery-carousel {
  @apply w-full h-full;
}

.gallery-slide {
  @apply w-full h-full;
}

.gallery-content {
  @apply w-screen h-screen flex justify-center items-center p-[calc(var(--spacing-unit)*5)] box-border overflow-hidden;
}

.gallery-image {
  @apply max-w-[calc(100vw-var(--spacing-unit)*4)] max-h-[calc(100vh-var(--spacing-unit)*4)] w-auto h-auto object-contain rounded-round-large shadow-[0_calc(var(--spacing-unit)*5)_calc(var(--spacing-unit)*15)_rgba(0,0,0,0.5)];
}

.gallery-video {
  @apply max-w-[calc(100vw-var(--spacing-unit)*4)] max-h-[calc(100vh-var(--spacing-unit)*4)] w-full h-full flex items-center justify-center relative z-1;
}

.native-video-player {
  @apply max-w-full max-h-full rounded-round-large shadow-[0_calc(var(--spacing-unit)*5)_calc(var(--spacing-unit)*15)_rgba(0,0,0,0.5)];
}

/* Caption */
.gallery-caption {
  @apply absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-[calc(var(--spacing-unit)*5)] pb-[calc(var(--spacing-unit)*5)] pt-[calc(var(--spacing-unit)*5)] text-center text-white text-[calc(var(--spacing-unit)*5)] ;
}

/* Transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  @apply transition-all duration-300 ease-in-out;
}

.slide-fade-enter-from {
  @apply opacity-0 translate-x-[20px];
}

.slide-fade-leave-to {
  @apply opacity-0 translate-x-[-20px];
}

.sr-only {
  @apply absolute w-px h-px p-0 m-[-1px] overflow-hidden clip whitespace-nowrap border-0;
}
</style>

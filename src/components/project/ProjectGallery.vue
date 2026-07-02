<template>
  <div v-if="project.gallery && project.gallery.length > 0 || (project.teaserImg && project.teaserImg.length > 0)" class="project-gallery-section">
    <h2 class="gallery-title mb-4">{{ title }}</h2>
    <div class="gallery-grid">
      <div
        v-for="(item, index) in galleryItems"
        :key="index"
        class="gallery-item"
        role="button"
        tabindex="0"
        :aria-label="t('a11y.openImage', { name: item.name || project.name + ' image' })"
        @click="openModal(item)"
        @keydown.enter="openModal(item)"
        @keydown.space.prevent="openModal(item)"
      >
        <template v-if="item.mimetype?.startsWith('image') || !item.mimetype">
          <template v-if="!isErrored(item.thumbnails?.card_cover?.signedUrl || item.signedUrl || item.url)">
            <img
              :src="item.thumbnails?.card_cover?.signedUrl || item.signedUrl || item.url"
              :alt="item.name || project.name + ' image'"
              loading="lazy"
              @error="onImageError(item.thumbnails?.card_cover?.signedUrl || item.signedUrl || item.url)"
            />
            <div class="hover-overlay">
              <IBiZoomIn class="zoom-icon" />
            </div>
          </template>
          <div v-else class="image-fallback">
            <IBiImage class="fallback-icon" />
            <span class="fallback-text">{{ t('gallery.imageNotAvailable') || 'Bild nicht verfügbar' }}</span>
          </div>
        </template>
        <div
          v-else-if="item.mimetype.startsWith('video')"
          class="video-thumbnail"
        >
          <video
            :src="item.signedUrl"
            preload="metadata"
            muted
            playsinline
            class="video-preview"
          >
            Your browser does not support the video tag.
          </video>
          <div class="video-overlay">
            <div class="play-button"></div>
          </div>
        </div>
      </div>
    </div>
    <project-gallery-modal
      :is-visible="modalVisible"
      :current-item="currentItem"
      :gallery-items="galleryItems"
      @update:is-visible="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Project } from '@/interfaces/Project';
import type { Attachment } from '@/interfaces/Attachment';
import ProjectGalleryModal from './ProjectGalleryModal.vue';

const { t } = useI18n();

const props = defineProps<{
  project: Project;
  title?: string;
}>();

const modalVisible = ref(false);
const currentItem = ref<Attachment | null>(null);
const erroredImages = ref(new Set<string>());

// Include both gallery and teaser images
const galleryItems = computed(() => {
  const items: any[] = [];
  
  // Add gallery attachments
  if (props.project.gallery && props.project.gallery.length > 0) {
    items.push(...props.project.gallery);
  }
  
  // Add teaser images if no gallery
  if (props.project.teaserImg && props.project.teaserImg.length > 0) {
    props.project.teaserImg.forEach((img: any) => {
      items.push({
        ...img,
        name: img.name || props.project.name + ' teaser',
        mimetype: 'image',
        signedUrl: img.signedUrl,
        thumbnails: img.thumbnails || {},
      });
    });
  }
  
  return items;
});

function isErrored(src: string): boolean {
  return erroredImages.value.has(src);
}

function onImageError(src: string) {
  erroredImages.value = new Set([...erroredImages.value, src]);
}

function openModal(item: Attachment) {
  currentItem.value = item;
  modalVisible.value = true;
}

function closeModal() {
  modalVisible.value = false;
  currentItem.value = null;
}
</script>

<style lang="postcss" scoped>
.project-gallery-section {
  @apply relative mt-[3rem];
}

.gallery-title {
  @apply text-[2rem] font-extrabold text-onSurface flex items-center gap-[0.75rem];

  &::before {
    @apply content-[''] w-[6px] h-[1.5em] bg-primary rounded-[3px];
  }
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-auto-rows: 280px;
  gap: 1.5rem;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    grid-auto-rows: 240px;
  }
}

.gallery-item {
  @apply relative rounded-round-xl overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-[transform,box-shadow] duration-300 bg-surface;

  &:hover {
    @apply -translate-y-[6px] shadow-[0_12px_28px_rgba(0,0,0,0.12)] z-10;

    .hover-overlay {
      @apply opacity-100;
    }

    .video-overlay {
      @apply bg-black/40 backdrop-blur-[4px];

      .play-button {
        @apply scale-[1.15] bg-white;
      }
    }

    img {
      @apply scale-[1.08];
    }
  }

  &:focus-visible {
    @apply outline-3 outline-secondary outline-offset-2 -translate-y-[3px] shadow-[0_8px_20px_rgba(0,0,0,0.1)];
  }

  img {
    @apply w-full h-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.2,0.8,0.2,1)];
  }
}

.hover-overlay {
  @apply absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-center justify-center opacity-0 transition-opacity duration-300;

  .zoom-icon {
    @apply text-[2.5rem] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] scale-90 transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)];
  }
}

.gallery-item:hover .hover-overlay .zoom-icon {
  @apply scale-100;
}

.image-fallback {
  @apply w-full h-full flex flex-col items-center justify-center gap-2 bg-surface-variant text-onSurface-variant;
}

.fallback-icon {
  @apply text-[3rem] opacity-50;
}

.fallback-text {
  @apply text-label-md text-center px-4;
}

.video-thumbnail {
  @apply w-full h-full relative bg-surface;
}

.video-preview {
  @apply w-full h-full object-cover opacity-85;
}

.video-overlay {
  @apply absolute inset-0 bg-black/25 flex items-center justify-center transition-colors duration-300;
}

.play-button {
  @apply w-[72px] h-[72px] bg-white/90 backdrop-blur-[8px] rounded-full flex items-center justify-center transition-[transform,background-color] duration-300 relative shadow-[0_8px_24px_rgba(0,0,0,0.2)];

  &::after {
    @apply content-[''] absolute ml-[6px] border-solid border-t-[12px] border-b-[12px] border-l-[20px] border-transparent border-l-primary;
  }
}
</style>


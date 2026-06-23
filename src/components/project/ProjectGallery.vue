<template>
  <div v-if="project.gallery || project.teaserImg" class="project-gallery-section">
    <h2 class="gallery-title mb-4">{{ title }}</h2>
    <div class="gallery-grid">
      <div
        v-if="project.teaserImg"
        class="gallery-item teaser-item"
        role="button"
        tabindex="0"
        :aria-label="t('a11y.openImage', { name: project.teaserImg[0].name || t('a11y.imageNotAvailable') })"
        @click="openModal(project.teaserImg[0])"
        @keydown.enter="openModal(project.teaserImg[0])"
        @keydown.space.prevent="openModal(project.teaserImg[0])"
      >
        <img
          :src="project.teaserImg[0].signedUrl"
          :alt="project.name + ' - Teaser'"
          loading="lazy"
          @error="onImageError"
        />
        <div class="hover-overlay">
          <IBiZoomIn class="zoom-icon" />
        </div>
      </div>
      <div
        v-for="(item, index) in project.gallery"
        :key="index"
        class="gallery-item"
        role="button"
        tabindex="0"
        :aria-label="t('a11y.openImage', { name: item.name || t('a11y.imageNotAvailable') })"
        @click="openModal(item)"
        @keydown.enter="openModal(item)"
        @keydown.space.prevent="openModal(item)"
      >
        <template v-if="item.mimetype.startsWith('image')">
          <img
            :src="item.thumbnails?.card_cover?.signedUrl || item.signedUrl"
            :alt="item.name || project.name + ' image'"
            loading="lazy"
            @error="onImageError"
          />
          <div class="hover-overlay">
            <IBiZoomIn class="zoom-icon" />
          </div>
        </template>
        <div
          v-else-if="item.mimetype.startsWith('video')"
          class="video-thumbnail"
        >
          <video
            :src="item.signedUrl"
            preload="metadata"
            controls
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
      :gallery-items="galleryWithTeaserImg"
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
const imageError = ref(false);

const galleryWithTeaserImg = computed(() => {
  const gallery = props.project.gallery || [];
  const teaserImg = props.project.teaserImg ? [props.project.teaserImg[0]] : [];
  return [...teaserImg, ...gallery];
});

function openModal(item: Attachment) {
  currentItem.value = item;
  modalVisible.value = true;
}

function closeModal() {
  modalVisible.value = false;
  currentItem.value = null;
}

function onImageError() {
  imageError.value = true;
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
  auto-rows: 280px;
  gap: 1.5rem;

  @media (max-width: 576px) {
    grid-template-columns: 1;
    auto-rows: 240px;
  }
}

.gallery-item {
  @apply relative rounded-round-xl overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 bg-surface;

  &:hover {
    @apply -translate-y-[6px] shadow-[0_12px_28px_rgba(0,0,0,0.12)] z-10;

    .hover-overlay {
      @apply opacity-100;
    }

    .video-overlay {
      @apply bg-black/40 backdrop-blur-[4px];

      .play-button {
        @apply scale-115 bg-white;
      }
    }

    img {
      @apply scale-108;
    }
  }

  &:focus-visible {
    @apply outline-3 outline-secondary outline-offset-2 -translate-y-[3px] shadow-[0_8px_20px_rgba(0,0,0,0.1)];
  }

  img {
    @apply w-full h-full object-cover transition-transform duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)];
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

.video-thumbnail {
  @apply w-full h-full relative bg-surface;
}

.video-preview {
  @apply w-full h-full object-cover opacity-85;
}

.video-overlay {
  @apply absolute inset-0 bg-black/25 flex items-center justify-center transition-all duration-300;
}

.play-button {
  @apply w-[72px] h-[72px] bg-white/90 backdrop-blur-[8px] rounded-full flex items-center justify-center transition-all duration-300 relative shadow-[0_8px_24px_rgba(0,0,0,0.2)];

  &::after {
    @apply content-[''] absolute ml-[6px] border-solid border-t-[12px] border-b-[12px] border-l-[20px] border-transparent border-l-primary;
  }
}
</style>


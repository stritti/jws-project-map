<template>
  <div v-if="project.gallery || project.teaserImg" class="project-gallery-section">
    <h2 class="gallery-title mb-4">{{ title }}</h2>
    <div class="gallery-grid">
      <div
        v-if="project.teaserImg"
        class="gallery-item teaser-item"
        role="button"
        tabindex="0"
        :aria-label="'Open ' + (project.teaserImg[0].name || 'teaser image')"
        @click="openModal(project.teaserImg[0])"
        @keydown.enter="openModal(project.teaserImg[0])"
        @keydown.space.prevent="openModal(project.teaserImg[0])"
      >
        <img
          :src="project.teaserImg[0].signedUrl"
          :alt="project.name + ' Teaser Image'"
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
        :aria-label="'Open ' + (item.name || 'gallery item')"
        @click="openModal(item)"
        @keydown.enter="openModal(item)"
        @keydown.space.prevent="openModal(item)"
      >
        <template v-if="item.mimetype.startsWith('image')">
          <img
            :src="item.thumbnails?.card_cover?.signedUrl || item.signedUrl"
            :alt="item.name"
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

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';
import type { Project } from '@/interfaces/Project';
import { useAttachment } from '@/composables/useAttachment';
import ProjectGalleryModal from './ProjectGalleryModal.vue';

export default defineComponent({
  name: 'ProjectGallery',
  components: {
    ProjectGalleryModal
  },
  props: {
    project: {
      type: Object as PropType<Project>,
      required: true
    },
    title: {
      type: String,
      default: "Gallery"
    }
  },
  setup(props) {
    const modalVisible = ref(false);
    const currentItem = ref(null);
    const { onImageError } = useAttachment();

    const galleryWithTeaserImg = computed(() => {
      const gallery = props.project.gallery || [];
      const teaserImg = props.project.teaserImg ? [props.project.teaserImg[0]] : [];
      return [...teaserImg, ...gallery];
    });

    return {
      modalVisible,
      currentItem,
      galleryWithTeaserImg,
      onImageError
    };
  },
  methods: {
    openModal(item: any) {
      this.currentItem = item;
      this.modalVisible = true;
    },
    closeModal() {
      this.modalVisible = false;
      this.currentItem = null;
    }
  }
});
</script>

<style lang="scss" scoped>
.project-gallery-section {
  position: relative;
  margin-top: 3rem;
}

.gallery-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--jws-text-main, #212529);
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: "";
    width: 6px;
    height: 1.5em;
    background: var(--jws-primary, #3d5e9e);
    border-radius: 3px;
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
  position: relative;
  border-radius: 1.5rem;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  background: var(--jws-bg-subtle, #f0f0f0);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
    z-index: 2;

    .hover-overlay {
      opacity: 1;
    }

    .video-overlay {
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);

      .play-button {
        transform: scale(1.15);
        background: #fff;
      }
    }

    img {
      transform: scale(1.08);
    }
  }

  &:focus-visible {
    outline: 3px solid var(--color-secondary);
    outline-offset: 2px;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
}

.hover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;

  .zoom-icon {
    font-size: 2.5rem;
    color: #fff;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
    transform: scale(0.9);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
}

.gallery-item:hover .hover-overlay .zoom-icon {
  transform: scale(1);
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: var(--jws-bg-subtle, #f0f0f0);
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
}

.video-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.play-button {
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

  &::after {
    content: "";
    position: absolute;
    margin-left: 6px;
    border-style: solid;
    border-width: 12px 0 12px 20px;
    border-color: transparent transparent transparent var(--jws-primary, #3d5e9e);
  }
}
</style>


<template>
  <div v-if="project.gallery || project.teaserImg" class="project-gallery-section">
    <hr class="d-none" />
    <h2 class="section-title mb-4 mt-5">Gallery</h2>
    <div class="gallery-grid">
      <div
        v-if="project.teaserImg"
        class="gallery-item teaser-item"
        @click="openModal(project.teaserImg[0])"
      >
        <img
          :src="project.teaserImg[0].signedUrl"
          :alt="project.name + ' Teaser Image'"
          loading="lazy"
        />
        <div class="hover-overlay">
           <span class="zoom-icon">🔍</span>
        </div>
      </div>
      <div
        v-for="(item, index) in project.gallery"
        :key="index"
        class="gallery-item"
        @click="openModal(item)"
      >
        <template v-if="item.mimetype.startsWith('image')">
          <img
            :src="item.thumbnails?.card_cover?.signedUrl || item.signedUrl"
            :alt="item.name"
            loading="lazy"
          />
          <div class="hover-overlay">
             <span class="zoom-icon">🔍</span>
           </div>
        </template>
        <div
          v-else-if="item.mimetype.startsWith('video')"
          class="video-thumbnail"
        >
          <video
            :src="item.signedUrl"
            preload="metadata"
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
    }
  },
  setup(props) {
    const modalVisible = ref(false);
    const currentItem = ref(null);

    const galleryWithTeaserImg = computed(() => {
      const gallery = props.project.gallery || [];
      const teaserImg = props.project.teaserImg ? [props.project.teaserImg[0]] : [];
      return [...teaserImg, ...gallery];
    });

    return {
      modalVisible,
      currentItem,
      galleryWithTeaserImg
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
@use "@/assets/design-tokens.scss" as *;

.project-gallery-section {
  position: relative;
  margin-top: calc(var(--spacing-unit) * 16); /* 64px */
}

.section-title {
  font-size: calc(var(--spacing-unit) * 8); /* 32px */
  font-weight: 600; /* Closest to 800 in our system */
  color: var(--color-on-surface);
  margin-bottom: calc(var(--spacing-unit) * 8); /* 32px */
  display: flex;
  align-items: center;
  gap: var(--spacing-margin-sm); /* 12px */
  
  &::before {
    content: "";
    width: calc(var(--spacing-unit) * 1.5); /* 6px */
    height: 1.5em;
    background: var(--color-primary);
    border-radius: calc(var(--spacing-unit) * 0.75); /* 3px */
  }
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(calc(var(--spacing-unit) * 70), 1fr));
  grid-auto-rows: calc(var(--spacing-unit) * 70);
  gap: var(--spacing-margin-lg); /* 24px */
  margin-top: var(--spacing-margin-lg); /* 24px */
  
  @media (max-width: calc(var(--spacing-unit) * 144)) { /* 576px */
    grid-template-columns: 1fr;
    grid-auto-rows: calc(var(--spacing-unit) * 60); /* 240px */
  }
}

.gallery-item {
  position: relative;
  border-radius: var(--shape-round-xl); /* 1.5rem */
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 5) rgba(0, 0, 0, 0.06);
  transition: 0.3s ease;
  background: var(--color-surface-variant);
  
  &:hover {
    transform: translateY(calc(-1 * var(--spacing-unit) * 2)); /* -8px */
    box-shadow: 0 calc(var(--spacing-unit) * 3.75) calc(var(--spacing-unit) * 8.75) rgba(0, 0, 0, 0.12);
    z-index: 2;
    
    .hover-overlay {
      opacity: 1;
    }
    
    .video-overlay {
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(calc(var(--spacing-unit) * 1)); /* 4px */
      .play-button {
        transform: scale(1.15);
        background: var(--color-surface);
        color: var(--color-primary);
      }
    }
    
    img {
      transform: scale(1.1);
    }
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
  background: linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  .zoom-icon {
    font-size: calc(var(--spacing-unit) * 10); /* 40px */
    color: var(--color-on-primary);
    filter: drop-shadow(0 calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 3) rgba(0,0,0,0.3));
    transform: scale(0.9);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    user-select: none;
  }
}

.gallery-item:hover .hover-overlay .zoom-icon {
  transform: scale(1);
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: var(--color-background);
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
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s ease;
}

.play-button {
  width: calc(var(--spacing-unit) * 18); /* 72px */
  height: calc(var(--spacing-unit) * 18); /* 72px */
  background: rgba(var(--color-surface-rgb), 0.9);
  backdrop-filter: blur(calc(var(--spacing-unit) * 2)); /* 8px */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s ease;
  position: relative;
  box-shadow: 0 calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 6) rgba(0,0,0,0.2);
  
  &::after {
    content: '';
    position: absolute;
    margin-left: calc(var(--spacing-unit) * 1.5); /* 6px */
    border-style: solid;
    border-width: calc(var(--spacing-unit) * 3) 0 calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 5); /* 12px 0 12px 20px */
    border-color: transparent transparent transparent var(--color-primary);
  }
}
</style>


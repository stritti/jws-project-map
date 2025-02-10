<template>
  <div v-if="project.gallery">
    <hr />
    <h2>Gallery</h2>
    <div class="gallery-thumbnails">
      <div 
        v-for="(item, index) in project.gallery" 
        :key="index" 
        class="gallery-thumbnail"
        @click="openModal(item)"
      >
        <img 
          v-if="item.mimetype.startsWith('image')" 
          :src="item.thumbnails?.card_cover?.signedUrl || item.signedUrl" 
          :alt="item.name"
        />
        <div 
          v-else-if="item.mimetype.startsWith('video')" 
          class="video-thumbnail"
        >
          <span class="play-icon">▶</span>
        </div>
      </div>
    </div>
    <project-gallery-modal 
      :is-visible="modalVisible" 
      :current-item="currentItem"
      :gallery-items="project.gallery"
      @update:is-visible="closeModal"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
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
  setup() {
    const modalVisible = ref(false);
    const currentItem = ref(null);

    return {
      modalVisible,
      currentItem
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
.gallery-thumbnails {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.gallery-thumbnail {
  width: calc(33.333% - 0.5rem);
  max-width: 250px;
  aspect-ratio: 1/1;
  object-fit: cover;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.play-icon {
  color: white;
  font-size: 3rem;
  opacity: 0.8;
}
</style>

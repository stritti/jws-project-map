<template>
  <b-modal 
    v-model="isVisible" 
    :title="currentItem?.name || 'Gallery'" 
    size="xl" 
    centered 
    scrollable
  >
    <div v-if="currentItem" class="gallery-modal-content">
      <template v-if="currentItem.mimetype.startsWith('image')">
        <img 
          :src="currentItem.signedUrl" 
          :alt="currentItem.name" 
          class="img-fluid" 
        />
      </template>
      <template v-else-if="currentItem.mimetype.startsWith('video')">
        <vue3-video-player
          :src="currentItem.signedUrl"
          :type="currentItem.type"
          :muted="false"
          preload="auto"
        />
      </template>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

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
    }
  },
  emits: ['update:isVisible']
});
</script>

<style scoped>
.gallery-modal-content {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 70vh;
}
.gallery-modal-content img,
.gallery-modal-content video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>

<template>
  <div>
  <b-container>
    <div class="project-details">
    <b-skeleton-wrapper :loading="loading">
      <template #loading>
        <h1><b-skeleton width="75%" height="2rem"><h1></h1></b-skeleton></h1>
        <div><b-skeleton with="5em"></b-skeleton></div>
        <p>
          <b-skeleton width="85%"></b-skeleton>
          <b-skeleton width="55%"></b-skeleton>
          <b-skeleton width="70%"></b-skeleton>
        </p>
      </template>

      <div v-if="project">
        <h1>{{ project.name }}</h1>
        <h3><country-label :country-id="project.country" /></h3>
      </div>
      <div v-if="project.teaserImg">
        <b-img
            :src="project.teaserImg[0].thumbnails.large.url"
            :alt="project.name"
            fluid
        />
      </div>
      <markdown-text v-if="project.notes" :text="project.notes" />

      <div v-if="project.gallery">
        <h2>Gallery</h2>
        <vue-picture-swipe
          :items="images"
          :options="{shareEl: false}"
        ></vue-picture-swipe>
      </div>

      <div v-if="project.link">
        <b-button :href="project.link" variant="primary">
          more &hellip;
        </b-button>
      </div>
    </b-skeleton-wrapper>
    </div>
  </b-container>
  <site-footer />
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useProjectStore } from '@/store/project.store'
import VuePictureSwipe from 'vue3-picture-swipe'
import CountryLabel from '@/components/CountryLabel.vue'
import MarkdownText from '@/components/MarkdownText.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { useLoadingStore } from '@/store/loading.store'

export default {
  components: { CountryLabel, MarkdownText, VuePictureSwipe, SiteFooter },
  name: "ProjectDetailsView",
  computed: {
    ...mapState(useLoadingStore, {
      loading: state => state.showLoadingSpinner
    }),
    ...mapState(useProjectStore, {
      projectById: state => state.getById
    }),
    project () {
      return this.projectById(this.$route.params.projectId)
    },
    images () {
      return this.project.gallery.map(img => {
        return {
          src: img.url,
          w: img.width,
          h: img.height,
          thumbnail: img.thumbnails.large.url
        }
      })
    }
  }
}
</script>

<style lang="scss">
.project-details {
  min-height: calc(100vh - 7rem);
  padding: 1rem;
}

.gallery-thumbnail {
  img {
    width: 220px;
  }
}
</style>

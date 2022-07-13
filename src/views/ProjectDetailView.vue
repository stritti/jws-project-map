<template>
  <div class="header">
    <b-container>
      <b-skeleton-wrapper :loading="loading">
        <template #loading>
          <b-row>
            <b-col cols="2">
              <b-skeleton width="25%" height="10px" />
            </b-col>
            <b-col cols="20">
              <h1><b-skeleton width="75%" height="2rem"></b-skeleton></h1>
              <h3><b-skeleton with="5em"></b-skeleton></h3>
            </b-col>
          </b-row>
        </template>
        <div v-if="project">
          <b-row>
            <b-col cols="3" md="1">
              <back-button class="back-btn"/>
            </b-col>
            <b-col>
              <h1>{{ project.name }}</h1>
              <h3><country-label :country-id="project.country" /></h3>
            </b-col>
          </b-row>
        </div>
      </b-skeleton-wrapper>
    </b-container>
  </div>
  <b-container>
    <div class="project-details">
    <b-skeleton-wrapper :loading="loading">
      <template #loading>
        <p>
          <b-skeleton width="85%"></b-skeleton>
          <b-skeleton width="55%"></b-skeleton>
          <b-skeleton width="70%"></b-skeleton>
        </p>
      </template>

      <div v-if="project">
        <div class="teaser">
          <b-img
            v-if="project.teaserImg"
            class="teaser__img"
            :src="project.teaserImg[0].thumbnails.large.url"
            :alt="project.name"
            fluid
          />
          <div class="action-bar">
            <share-button
              class="action-btn share"
              :title="project.name"
              :text="project.name"
              :url="$route.path"
              :fixed="true"
            />
            <navigate-button
              class="action-btn navigate"
              :lat="project.latitude"
              :lng="project.longitude"
            />
          </div>
        </div>
        <h2>Details</h2>
        <table class="project-details__meta">
          <tr v-if="project.name">
            <th>Name:</th>
            <td>{{ project.name }}</td>
          </tr>
          <tr v-if="project.country">
            <th>Country:</th>
            <td><country-label :country-id="project.country" /></td>
          </tr>
          <tr v-if="project.state">
            <th>State:</th>
            <td>{{ project.state }}</td>
          </tr>
          <tr v-if="project.since">
            <th>Since:</th>
            <td>{{ project.since }}</td>
          </tr>
          <tr v-if="project.category">
            <th>Category:</th>
            <td>
              <category-badge
                v-for="category in project.category"
                v-bind:key="category"
                :category-id="category"
              />
            </td>
          </tr>
        </table>
        <div
          v-if="project.notes"
          class="project-details__description"
        >
          <hr />
          <h2>Description</h2>
          <markdown-text
            class="project-details__notes"
            :text="project.notes"
          />
        </div>

        <div v-if="project.link">
          <b-button :href="project.link" variant="primary">
            more &hellip;
          </b-button>
        </div>

        <div
          v-if="project.gallery"
          class="project-details__gallery"
        >
          <hr />
          <h2>Gallery</h2>
          <vue-picture-swipe
            :items="images"
            :options="{shareEl: false}"
          ></vue-picture-swipe>

          <div
            v-for="video in videos"
            :key="video.src"
            class="gallery__video">
            <vue3-video-player
              :src="video.src"
              >
            </vue3-video-player>
          </div>
        </div>
      </div>
    </b-skeleton-wrapper>
    </div>
  </b-container>
  <site-footer />
</template>

<script>
import { mapState } from 'pinia'
import { useProjectStore } from '@/store/project.store'
import VuePictureSwipe from 'vue3-picture-swipe'
import CountryLabel from '@/components/CountryLabel.vue'
import CategoryBadge from '@/components/CategoryBadge.vue'
import MarkdownText from '@/components/MarkdownText.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { useLoadingStore } from '@/store/loading.store'
import BackButton from '@/components/actions/BackButton.vue'
import ShareButton from '@/components/actions/ShareButton.vue'
import NavigateButton from '../components/actions/NavigateButton.vue'

export default {
  name: "ProjectDetailsView",
  props: {
    projectId: {
      type: String,
      required: true
    }
  },
  components: { CountryLabel, CategoryBadge, MarkdownText, VuePictureSwipe, SiteFooter, BackButton, ShareButton, NavigateButton },
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
      return this.project.gallery
        .filter(img => img.type.startsWith('image'))
        .map(img => {
          return {
            src: img.url,
            w: img.width,
            h: img.height,
            thumbnail: img.thumbnails.large.url
          }
      })
    },
    videos () {
      return this.project.gallery
        .filter(item => item.type.startsWith('video'))
        .map(item => {
          return {
            src: item.url,
            type: item.type,
            size: item.size
          }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  padding: 1rem;
  background-color: #969696;
  border-bottom: 1px solid #e5e5e5;
  h3 {
    color: #e5e5e5;
  }
}
.teaser {
  position: relative;
  min-height: 3rem;
  &__img {
    top: 0;
    left: 0;
    width: 100%;
    max-height: 50vh;
    object-fit: cover;
    object-position: 50% 50%;
  }
  .action-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
.action-btn {
  margin: 0.5rem;
  filter: opacity(0.75);
}

.project-details {
  min-height: calc(100vh - 7rem);
  padding: 1rem;
  &__meta, &__notes {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
}
.back-btn {
  margin-right: 1rem;
  float: left;
}
.gallery-thumbnail {
  img {
    min-width: 220px;
    width: auto;
    max-width: 80vw;
    margin: 0.25rem;
  }
}
.gallery__video {
    min-width: 220px;
  width: auto;
  max-width: 80vw;
  margin: 0.25rem;
}
</style>

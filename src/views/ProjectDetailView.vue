<template>
  <div class="header">
    <b-container>
      <b-placeholder-wrapper :loading="loading">
        <template #loading>
          <b-row>
            <b-col cols="2">
              <b-placeholder width="25%" height="10px" />
            </b-col>
            <b-col cols="20">
              <h1><b-placeholder width="75%" height="2rem"></b-placeholder></h1>
            </b-col>
          </b-row>
        </template>
        <div v-if="project">
          <b-row>
            <b-col cols="3" md="1" >
              <back-button class="back-btn" />
            </b-col>
            <b-col>
              <h1 class="title">
                {{ project.name }}
              </h1>
            </b-col>
            <b-col cols="3" class="text-end" >
              <category-badge
                v-for="category in project.category"
                :key="category"
                :category-id="category"
              />
            </b-col>
          </b-row>
        </div>
      </b-placeholder-wrapper>
    </b-container>
  </div>
  <b-container fluid>
    <b-placeholder-wrapper :loading="loading">
      <div v-if="project" class="teaser">
        <div
          class="teaser__img"
          :style="{ backgroundImage: `url(${teaserImage})` }"
        >
          <div class="action-bar container">
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
      </div>
    </b-placeholder-wrapper>
  </b-container>
  <b-container>
    <div class="project-details">
      <b-placeholder-wrapper :loading="loading">
        <template #loading>
          <p>
            <b-placeholder width="85%"></b-placeholder>
            <b-placeholder width="55%"></b-placeholder>
            <b-placeholder width="70%"></b-placeholder>
          </p>
        </template>

        <div v-if="project">
          <h2>Details</h2>
          <table class="project-details__meta">
            <thead>
            <tr >
              <th >Name:</th>
              <td v-if="project.name">{{ project.name }}</td>
              <th >Country:</th>
              <td v-if="project.country"><country-label :country-id="project.country" /></td>
            </tr>
            <tr >
              <th v-if="project.state">State:</th>
              <td v-if="project.state">{{ project.state }}</td>
              <th v-if="project.since">Since:</th>
              <td v-if="project.since">{{ project.since }}</td>
            </tr>
            <tr v-if="project.category">
              <th>Category:</th>
              <td colspan="3">
                <category-badge
                  v-for="category in project.category"
                  :key="category"
                  :category-id="category"
                />
              </td>
            </tr>
            </thead>
          </table>
          <div v-if="project.notes" class="project-details__description">
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

          <div v-if="project.gallery">
            <hr />
            <h2>Gallery</h2>
            <BCarousel controls indicators fade class="project-details__gallery">
              <BCarouselSlide v-for="img in images" :key="img.src" :img-src="img.src" fluid class="gallery__image"/>

              <BCarouselSlide v-for="video in videos" :key="video.src" class="gallery__video">
                <template #img>
                  <vue3-video-player
                    :src="video.src"
                    :type="video.type"
                    :muted="false"
                    preload="auto"
                  />
                </template>
              </BCarouselSlide>
            </BCarousel>
          </div>
        </div>
      </b-placeholder-wrapper>
    </div>
  </b-container>
  <site-footer />
</template>

<script lang="ts">
import { mapState } from "pinia";
import { useProjectStore } from "../stores/project.store";
import CountryLabel from "../components/CountryLabel.vue";
import CategoryBadge from "../components/CategoryBadge.vue";
import MarkdownText from "../components/MarkdownText.vue";
import SiteFooter from "../components/SiteFooter.vue";
import { useLoadingStore } from "../stores/loading.store";
import BackButton from "../components/actions/BackButton.vue";
import ShareButton from "../components/actions/ShareButton.vue";
import NavigateButton from "../components/actions/NavigateButton.vue";

import { defineComponent } from "vue";
import type { Project } from "@/interfaces/Project";

export default defineComponent({
  name: "ProjectDetailView",
  components: {
    CountryLabel,
    CategoryBadge,
    MarkdownText,
    SiteFooter,
    BackButton,
    ShareButton,
    NavigateButton,
  },
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(useLoadingStore, {
      loading: (state) => state.showLoadingSpinner as boolean,
    }),
    ...mapState(useProjectStore, {
      projectById: (state) => state.getById,
    }),
    project(): Project {
      const id = parseInt(this.$route.params.projectId as string);
      return this.projectById(id);
    },
    teaserImage(): string {
      if (this.project.teaserImg) {
        return this.project.teaserImg[0].signedUrl;
      } else {
        return "/img/placeholder.png";
      }
    },
    images() {
      return this.project.gallery
        .filter((img: any) => img.mimetype.startsWith("image"))
        .map((img: any) => {
          return {
            src: img.signedUrl,
            w: img.width,
            h: img.height,
            thumbnail: img.thumbnails.card_cover.signedUrl,
          };
        });
    },
    videos() {
      return this.project.gallery
        .filter((item: any) => item.mimetype.startsWith("video"))
        .map((item: any) => {
          return {
            src: item.signedUrl,
            type: item.type,
            size: item.size,
          };
        });
    },
  },
});
</script>

<style lang="scss" scoped>
.container-fluid {
  padding: 0;
}
.header {
  position: fixed;
  top: 0;
  width: 100%;
  padding-top: 1rem;
  background-color: var(--bs-secondary);
  border-bottom: 1px solid var(--bs-secondary-text-emphasis);
  z-index: 99;

  .title {
    color: var(--bs-secondary-bg-subtle);
  }
}
.teaser {
  height: 50vh;
  overflow-x: hidden;
  overflow-y: auto;
  perspective: 2px;
  &__img {
    /* Full height */
    height: 100%;

    /* Create the parallax scrolling effect */
    background-attachment: fixed;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
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

  &__meta {
    th {
      text-align: right;
      padding-right: 0.25rem;
    }
    td {
      padding-left: 0.25rem;
      padding-right: 1rem;
    }
  }
  &__meta,
  &__notes {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  &__gallery {
    margin-top: 1rem;
    margin-bottom: 1rem;
    max-width: 780px;
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
    max-width: 780px;
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

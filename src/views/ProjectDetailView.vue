<template>
  <div class="header">
    <b-container>
      <b-placeholder-wrapper :loading="loading">
        <template #loading>
          <b-row>
            <b-col cols="2">
              <b-placeholder width="25%" height="10px" />
            </b-col>
            <b-col cols="auto">
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
                :key="category.Id"
                :category-id="category.Id"
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
              <td><country-label v-if="project.country" :country-id="project.country.Id" /></td>
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
                  :key="category.Id"
                  :category-id="category.Id"
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

          <project-gallery v-if="project.gallery" :project="project" />
        </div>
      </b-placeholder-wrapper>
    </div>
  </b-container>
  <site-footer />
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { useProjectStore } from "../stores/project.store";
import { useCategoryStore } from "../stores/category.store";
import { useCountryStore } from "../stores/country.store";
import CountryLabel from "../components/CountryLabel.vue";
import CategoryBadge from "../components/CategoryBadge.vue";
import MarkdownText from "../components/MarkdownText.vue";
import SiteFooter from "../components/SiteFooter.vue";
import { useLoadingStore } from "../stores/loading.store";
import BackButton from "../components/actions/BackButton.vue";
import ShareButton from "../components/actions/ShareButton.vue";
import NavigateButton from "../components/actions/NavigateButton.vue";
import ProjectGallery from "@/components/project/ProjectGallery.vue";
import ProjectGalleryModal from "@/components/project/ProjectGalleryModal.vue";
import type { Project } from "@/interfaces/Project";

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const loadingStore = useLoadingStore();
const projectStore = useProjectStore();
const categoryStore = useCategoryStore();
const countryStore = useCountryStore();

// Load data before mount to start fetching earlier
onBeforeMount(() => {
  Promise.all([
    projectStore.load(),
    categoryStore.load(),
    countryStore.load(),
  ]);
});

const loading = computed(() => loadingStore.showLoadingSpinner);
const project = computed((): Project | undefined => {
  const id = parseInt(route.params.projectId as string);
  return projectStore.getById(id);
});

const teaserImage = computed(() => {
  if (project.value?.teaserImg) {
    return project.value.teaserImg[0].signedUrl;
  } else {
    return "/img/placeholder.png";
  }
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
}
.back-btn {
  margin-right: 1rem;
  float: left;
}
</style>

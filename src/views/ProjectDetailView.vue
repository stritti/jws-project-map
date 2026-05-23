<template>
  <div class="project-page">
    <!-- Sticky header bar: back button + project title -->
    <div class="page-header-sticky">
      <b-container>
        <b-placeholder-wrapper :loading="loading">
          <template #loading>
            <b-row class="align-items-center py-2">
              <b-col cols="auto">
                <b-placeholder width="44px" height="44px" class="rounded-circle" />
              </b-col>
              <b-col>
                <h2><b-placeholder width="50%" height="2rem"></b-placeholder></h2>
              </b-col>
            </b-row>
          </template>
          <div v-if="project" class="page-header d-flex flex-wrap align-items-center gap-3 py-2">
            <back-button v-if="!isIFrame" class="back-btn shadow-sm d-none d-md-flex" />
            <h1 class="title mb-0 flex-grow-1 fw-bold">
              {{ project.name }}
            </h1>
          </div>
        </b-placeholder-wrapper>
      </b-container>
    </div>

    <!-- Floating back button for mobile -->
    <button
      v-if="!isIFrame && project"
      class="floating-back-btn d-md-none"
      :aria-label="t('nav.back')"
      :title="t('nav.back')"
      @click="goBack"
    >
      <IBiArrowLeft class="floating-back-icon" aria-hidden="true" />
    </button>

    <b-container fluid class="px-0 px-md-3">
      <b-placeholder-wrapper :loading="loading">
         <template #loading>
             <b-placeholder width="100%" height="40vh" class="rounded-4 mb-4"></b-placeholder>
         </template>
        <div v-if="project" class="teaser-wrapper">
          <div
            class="teaser-card"
            :style="{ backgroundImage: teaserBackgroundImage }"
          >
            <div class="action-bar d-flex gap-2">
              <share-button
                class="action-btn share glass-btn"
                :title="project.name"
                :text="project.name"
                :url="$route.path"
                :fixed="false"
              />
              <navigate-button
                class="action-btn navigate glass-btn"
                :lat="project.latitude"
                :lng="project.longitude"
              />
            </div>
          </div>
        </div>
      </b-placeholder-wrapper>
    </b-container>


    <b-container class="mt-5">
      <div class="project-details">
        <b-placeholder-wrapper :loading="loading">
          <template #loading>
            <div class="info-grid mb-5">
               <b-placeholder v-for="i in 3" :key="i" width="100%" height="80px" class="rounded-3" />
            </div>
            <p>
              <b-placeholder width="85%" class="mb-2"></b-placeholder>
              <b-placeholder width="55%" class="mb-2"></b-placeholder>
              <b-placeholder width="70%"></b-placeholder>
            </p>
          </template>

          <div v-if="project">
            
            <!-- Category tiles -->
            <div v-if="project.category?.length" class="category-tiles mb-4">
              <div
                v-for="category in project.category"
                :key="category.id"
                class="category-tile"
                :style="categoryTileStyle(category.id)"
              >
                {{ categoryName(category.id) }}
              </div>
            </div>

            <div class="info-grid mb-5">
               <div class="info-card" v-if="project.country">
                  <div class="info-icon">
                    <IBiGlobe2 />
                  </div>
                  <div class="info-content">
                    <span class="info-label">{{ t("project.detail.country") }}</span>
                    <strong class="info-value"><country-label :country-id="project.country.id" /></strong>
                  </div>
               </div>
               
               <div class="info-card" v-if="project.state">
                  <div class="info-icon">
                    <IBiCheck2Circle />
                  </div>
                  <div class="info-content">
                    <span class="info-label">{{ t("project.detail.state") }}</span>
                    <span class="state-badge" :class="project.state.replace(' ', '-')">
                      {{ stateLabel }}
                    </span>
                  </div>
               </div>

               <div class="info-card" v-if="project.since">
                  <div class="info-icon">
                    <IBiCalendar3 />
                  </div>
                  <div class="info-content">
                    <span class="info-label">{{ t("project.detail.since") }}</span>
                    <strong class="info-value">{{ formattedSince }}</strong>
                  </div>
               </div>
            </div>

            <!-- Mini location map -->
            <div v-if="project.latitude && project.longitude" class="location-section mb-5">
              <h2 class="section-title mb-4">{{ t("project.detail.location") }}</h2>
              <div class="mini-map rounded-4 overflow-hidden shadow-sm">
                <l-map
                  :zoom="13"
                  :center="[project.latitude, project.longitude]"
                  :options="mapOptions"
                  :use-global-leaflet="true"
                  style="height: 300px; width: 100%"
                >
                  <l-tile-layer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    layer-type="base"
                    name="OpenStreetMap"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <l-marker
                    :lat-lng="[project.latitude, project.longitude]"
                    :icon="detailMarkerIcon"
                  />
                </l-map>
              </div>
            </div>

            <div v-if="project.notes" class="project-details__description mb-5">
              <h2 class="section-title mb-4">{{ t("project.detail.description") }}</h2>
              <div class="notes-content">
                <markdown-text
                   class="project-details__notes"
                   :text="project.notes"
                />
              </div>
            </div>

            <div v-if="project.link" class="mb-5">
              <b-button :href="project.link" variant="primary" class="rounded-pill px-4 py-2 shadow-sm fw-bold border-0" target="_blank" rel="noopener noreferrer">
                {{ t("project.detail.more") }}
              </b-button>
            </div>

            <project-gallery v-if="project.gallery || project.teaserImg" :project="project" :title="t('gallery.title')" />
          </div>
        </b-placeholder-wrapper>
      </div>
    </b-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectStore } from "@/features/projects/stores/project.store";
import { useCategoryStore } from "@/stores/category.store";
import { useCountryStore } from "@/stores/country.store";
import CountryLabel from "@/components/CountryLabel.vue";
import CategoryBadge from "@/components/CategoryBadge.vue";
import { useWebFrame } from "@/composables/useWebFrame";
import { useLoadingStore } from "@/stores/loading.store";
import BackButton from "@/components/actions/BackButton.vue";
import ShareButton from "@/components/actions/ShareButton.vue";
import NavigateButton from "@/components/actions/NavigateButton.vue";
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import type { Project } from "@/interfaces/Project";
import { useGeoTags } from "@/composables/useGeoTags";
import L from "leaflet";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

const { isIFrame } = useWebFrame();
const { t, locale } = useI18n();
const router = useRouter();

const MarkdownText = defineAsyncComponent(
  () => import("@/components/MarkdownText.vue"),
);

const ProjectGallery = defineAsyncComponent(
  () => import("@/components/project/ProjectGallery.vue"),
);

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

function goBack() {
  router.go(-1);
}

// Load data before mount to start fetching earlier
onBeforeMount(() => {
  Promise.all([projectStore.load(), categoryStore.load(), countryStore.load()]);
});

const loading = computed(() => {
  if (project.value) return false;
  return loadingStore.showLoadingSpinner || projectStore.loading || projectStore.projects.length === 0;
});

const project = computed((): Project | undefined => {
  const id = parseInt(route.params.projectId as string);
  return projectStore.projects.find((p) => p.id === id);
});

// Implement GEO-tags for SEO
useGeoTags(project);

const formattedSince = computed(() => {
  if (!project.value?.since) return "";
  return new Date(project.value.since).toLocaleDateString(locale.value, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const teaserImage = computed(() => {
  if (project.value?.teaserImg && project.value.teaserImg.length > 0) {
    return project.value.teaserImg[0].signedUrl;
  }
  return "/img/placeholder.png";
});

const teaserBackgroundImage = computed(() => {
  if (teaserImage.value) {
    return `url("${teaserImage.value}"), url("/img/placeholder.png")`;
  }
  return 'url("/img/placeholder.png")';
});

const stateKeyMap: Record<string, string> = {
  finished: "finished",
  "under construction": "underConstruction",
  planned: "planned",
};

const stateLabel = computed(() => {
  const key = project.value?.state;
  if (!key) return "";
  const localeKey = stateKeyMap[key];
  return localeKey ? t(`project.state.${localeKey}`) : key;
});

const mapOptions = {
  zoomControl: true,
  scrollWheelZoom: false,
};

function categoryName(id: number): string {
  return categoryStore.getDisplayName(id);
}

function categoryTileStyle(id: number): Record<string, string> {
  const cat = categoryStore.getById(id);
  if (cat?.color) {
    return { backgroundColor: cat.color, color: "#fff" };
  }
  return { backgroundColor: "var(--jws-bg-subtle)", color: "var(--jws-text-main)" };
}

const detailMarkerIcon = computed(() => {
  return L.divIcon({
    className: "detail-marker-icon",
    html: `<div style="
      width: 28px; height: 28px;
      background: #3d5e9e;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }) as unknown as L.Icon;
});
</script>

<style lang="scss" scoped>
.project-page {
  padding-bottom: 4rem;
  background-color: var(--jws-bg-subtle);
}


.page-header-sticky {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--jws-bg-subtle, #f8f9fa);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}


.page-header {
  .title {
    font-size: 2.75rem;
    font-weight: 800;
    color: var(--jws-primary);
    letter-spacing: -0.03em;
    line-height: 1.1;
    
    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
  }
}

:deep(.back-btn) {
  border-radius: 50% !important;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  background: #fff !important;
  border: 1px solid var(--bs-primary) !important;
  color: var(--bs-primary) !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05) !important;
  
  &:hover {
    transform: translateX(-4px);
    background: var(--bs-primary) !important;
    color: #fff !important;
    box-shadow: 0 4px 15px rgba(61, 94, 158, 0.2) !important;
  }
}

.floating-back-btn {
  position: fixed;
  // No bottom filter bar on this view, so place near the screen edge (matching FloatingMeta .on-detail)
  bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
  left: calc(1rem + env(safe-area-inset-left, 0px));
  z-index: 999;
  // 44px matches the iOS HIG minimum touch target size
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-on-surface, #1e293b);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    color: var(--color-secondary, #3d5e9e);
  }

  .floating-back-icon {
    font-size: 1.35rem;
    line-height: 1;
  }
}

.teaser-wrapper {
  padding: 0;
  margin-top: 1rem;
  
  @media (min-width: 768px) {
    padding: 0 1.5rem;
  }
}

.teaser-card {
  position: relative;
  height: 60vh;
  min-height: 400px;
  max-height: 700px;
  width: 100%;
  border-radius: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow: var(--jws-shadow-lg);
  overflow: hidden;
  
  animation: revealImage 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;

  @media (min-width: 768px) {
    border-radius: var(--jws-radius-xl);
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%);
    pointer-events: none;
  }
}

@keyframes revealImage {
  from { transform: scale(1.1); opacity: 0; filter: blur(10px); }
  to { transform: scale(1); opacity: 1; filter: blur(0); }
}

.action-bar {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  z-index: 10;
  display: flex;
  gap: 1rem;
}

:deep(.glass-btn) {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #fff !important;
  border-radius: 50px !important;
  padding: 0.75rem 1.5rem !important;
  font-weight: 600;
  transition: var(--jws-transition);
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.25) !important;
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: var(--jws-radius-lg);
  border: 1px solid rgba(0,0,0,0.03);
  box-shadow: var(--jws-shadow-sm);
  transition: var(--jws-transition);

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--jws-shadow-md);
    border-color: var(--jws-primary-light);
  }
}

.info-icon {
  font-size: 1.5rem;
  background: var(--jws-bg-subtle);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  color: var(--jws-primary);
  flex-shrink: 0;
}

.state-badge {
  display: inline-block;
  position: static;
  padding: 0.35rem 1rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;

  &.finished {
    background: #198754;
    color: #fff;
  }

  &.under-construction {
    background: #ffc107;
    color: #212529;
  }

  &.planned {
    background: #3d5e9e;
    color: #fff;
  }
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--jws-text-muted);
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--jws-text-main);
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--jws-text-main);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  &::before {
    content: "";
    width: 6px;
    height: 1.5em;
    background: var(--jws-primary);
    border-radius: 3px;
  }
}

:deep(.notes-content) {
  font-size: 1.5rem;
  line-height: 1.8;
  color: var(--jws-text-main);
  opacity: 0.9;
  
  p {
    margin-bottom: 2rem;
  }
}

.category-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.category-tile {
  padding: 0.5rem 1.25rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.mini-map {
  border: 1px solid rgba(0, 0, 0, 0.05);
  line-height: 0;

  :deep(.leaflet-control-attribution) {
    font-size: 9px;
  }
}
</style>

<!-- Unscoped: Leaflet renders its DOM outside Vue's scope -->
<style lang="scss">
.detail-marker-icon {
  background: none !important;
  border: none !important;
}
</style>

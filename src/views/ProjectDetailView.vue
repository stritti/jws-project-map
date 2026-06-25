<template>
  <div class="project-page">
    <!-- Sticky header bar: back button + project title -->
    <div class="page-header-sticky" :class="{ 'header-scrolled': headerScrolled }">
      <div class="container mx-auto px-4">
        <div v-if="loading" class="flex items-center py-2">
          <div class="w-11 h-11 rounded-full animate-pulse bg-outline-variant/20"></div>
          <div class="ml-4 flex-1">
            <h2 class="w-1/2 h-8 animate-pulse bg-outline-variant/20 rounded"></h2>
          </div>
        </div>
        <div v-if="project" class="page-header flex flex-wrap items-center gap-3 py-2">
          <back-button v-if="!isIFrame" class="back-btn shadow-sm hidden md:flex" />
          <h1 class="title mb-0 flex-grow-1 font-bold">
            {{ project.name }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Floating back button for mobile -->
    <button
      v-if="!isIFrame && project"
      class="floating-back-btn md:hidden"
      :aria-label="t('nav.back')"
      :title="t('nav.back')"
      @click="goBack"
    >
      <IBiArrowLeft class="floating-back-icon" aria-hidden="true" />
    </button>

    <div class="container mx-auto px-0 md:px-3">
      <div v-if="loading" class="w-full h-[40vh] rounded-round-xl mb-4 animate-pulse bg-outline-variant/20"></div>
      <div v-if="project" class="teaser-wrapper">
        <div
          class="teaser-card"
          :style="{ backgroundImage: `url(${teaserImage})` }"
        >
          <div class="action-bar flex gap-2">
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
    </div>

    <div class="container mx-auto mt-5 px-4">
      <div class="project-details">
        <div v-if="loading" class="info-grid mb-5">
          <div v-for="i in 3" :key="i" class="h-20 rounded-round-large animate-pulse bg-outline-variant/20"></div>
        </div>
        <div v-if="loading" class="space-y-2">
          <div class="w-4/5 h-6 animate-pulse bg-outline-variant/20 rounded mb-2"></div>
          <div class="w-2/3 h-6 animate-pulse bg-outline-variant/20 rounded mb-2"></div>
          <div class="w-3/4 h-6 animate-pulse bg-outline-variant/20 rounded"></div>
        </div>

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
            <div class="mini-map rounded-round-large overflow-hidden shadow-sm">
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
            <a :href="project.link" class="btn btn-primary shadow-sm font-bold border-0" target="_blank" rel="noopener noreferrer">
              {{ t("project.detail.more") }}
            </a>
          </div>

          <project-gallery v-if="(project.gallery && project.gallery.length > 0) || (project.teaserImg && project.teaserImg.length > 0)" :project="project" :title="t('gallery.title')" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onMounted, onUnmounted, ref } from "vue";
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
import { useStructuredData } from "@/composables/useStructuredData";
import { parseProjectId } from "@/utils/slug";
import L from "leaflet";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

const { isIFrame } = useWebFrame();
const { t, locale } = useI18n();
const router = useRouter();

// Collapse the sticky header when scrolled past the heading
const SCROLL_THRESHOLD = 20;
const headerScrolled = ref(false);

function onScroll() {
  headerScrolled.value = window.scrollY > SCROLL_THRESHOLD;
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});

const MarkdownText = defineAsyncComponent(
  () => import("@/components/MarkdownText.vue"),
);

import ProjectGallery from "@/components/project/ProjectGallery.vue";

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
  const id = parseProjectId(route.params.projectId as string);
  return projectStore.projects.find((p) => p.id === id);
});

// Implement GEO-tags for SEO
useGeoTags(project);

// JSON-LD structured data for search engines
useStructuredData(project);

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

<style lang="postcss" scoped>
.project-page {
  @apply pb-[4rem] bg-surface;
}

.page-header-sticky {
  @apply sticky top-0 z-[100] bg-white/85 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-[padding,box-shadow] duration-300 ease-in-out;

  &.header-scrolled {
    @apply pt-[0.2rem] pb-[0.1rem] shadow-[0_2px_8px_rgba(0,0,0,0.05)];

    .title {
      @apply text-base p-0 leading-[1.3];
    }
  }
}

.page-header {
  .title {
    @apply text-[1.5rem] font-bold text-primary tracking-[-0.02em] leading-[1.2] transition-all duration-300 ease-in-out;

    @media (max-width: 768px) {
      font-size: 1.25rem;
      padding-top: 0.375rem;
      padding-bottom: 0.375rem;
    }
  }
}

:deep(.back-btn) {
  border-radius: 9999px;
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition-property: all;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
  background-color: white;
  border: 1px solid #3d5e9e;
  color: #3d5e9e;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

:deep(.back-btn:hover) {
  transform: translateX(-0.25rem);
  background-color: #3d5e9e;
  color: white;
  box-shadow: 0 4px 15px rgba(61, 94, 158, 0.2);
}

.floating-back-btn {
  @apply fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-[calc(1rem+env(safe-area-inset-left,0px))] z-[999] w-11 h-11 rounded-full border border-black/10 bg-white/90 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] cursor-pointer flex items-center justify-center text-onSurface transition-all duration-200 ease-in-out;

  &:hover {
    @apply bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.12)] text-secondary;
  }

  .floating-back-icon {
    @apply text-[1.35rem] leading-none;
  }
}

.teaser-wrapper {
  padding: 0;
  margin-top: 0.25rem;

  @media (min-width: 768px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
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
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  animation: revealImage 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;

  @media (min-width: 768px) {
    border-radius: 1rem;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.4));
    pointer-events: none;
  }
}

.action-bar {
  @apply absolute bottom-[2rem] right-[2rem] z-10 flex gap-[1rem];
}

:deep(.glass-btn) {
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 9999px;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  font-weight: 600;
  transition-property: all;
  transition-duration: 300ms;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

:deep(.glass-btn:hover) {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
}

.info-grid {
  @apply grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[2rem];
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition-property: all;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  border-color: #6a8fd4;
}

.info-icon {
  @apply text-[1.5rem] bg-surface w-[56px] h-[56px] flex items-center justify-center rounded-round-xl text-primary flex-shrink-0;
}

.state-badge {
  @apply inline-block px-[1rem] py-[0.35rem] rounded-full text-[0.85rem] font-bold uppercase tracking-[0.03em];

  &.finished {
    @apply bg-finished text-white;
  }

  &.under-construction {
    @apply bg-underConstruction text-black;
  }

  &.planned {
    @apply bg-planned text-white;
  }
}

.info-content {
  @apply flex flex-col;
}

.info-label {
  @apply text-[0.75rem] font-bold uppercase tracking-[0.1em] text-onSurface-variant mb-[0.25rem];
}

.info-value {
  @apply text-[1.2rem] font-bold text-onSurface flex items-center;
}

.section-title {
  @apply text-[2rem] font-extrabold text-onSurface mb-[2rem] flex items-center gap-[0.75rem];

  &::before {
    content: '';
    width: 6px;
    height: 1.5em;
    background-color: #3d5e9e;
    border-radius: 3px;
  }
}

:deep(.notes-content) {
  font-size: 1.5rem;
  line-height: 1.8;
  color: #191c1d;
  opacity: 0.9;
}

:deep(.notes-content p) {
  margin-bottom: 2rem;
}

.category-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.category-tile {
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.mini-map {
  border: 1px solid rgba(0, 0, 0, 0.05);
  line-height: 1;
}

.mini-map :deep(.leaflet-control-attribution) {
  font-size: 9px;
}
</style>

/* Unscoped: Leaflet renders its DOM outside Vue's scope */
<style lang="postcss">
.detail-marker-icon {
  @apply bg-transparent border-none;
}
</style>

/* Custom animations */
@keyframes revealImage {
  from {
    transform: scale(1.1);
    opacity: 0;
    filter: blur(10px);
  }
  to {
    transform: scale(1);
    opacity: 1;
    filter: blur(0);
  }
}

.animate-reveal-image {
  animation: revealImage 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

<template>
  <div class="project-page">
    <!-- Sticky header bar: back button + project title -->
    <header class="page-header-sticky" :class="{ 'header-scrolled': headerScrolled }">
      <div class="container mx-auto px-4 md:px-6">
        <div v-if="loading" class="flex items-center py-2" aria-hidden="true">
          <div class="w-11 h-11 rounded-full animate-pulse bg-outline-variant/20"></div>
          <div class="ml-4 flex-1">
            <div class="w-1/2 h-8 animate-pulse bg-outline-variant/20 rounded"></div>
          </div>
        </div>
        <div v-if="project" class="page-header flex flex-wrap items-center gap-3 py-2">
          <back-button v-if="!isIFrame" class="back-btn shadow-sm" />
          <h1 class="title mb-0 flex-grow-1 font-bold" id="project-title">
            {{ project.name }}
          </h1>
        </div>
      </div>
    </header>

    <!-- Floating back button for mobile -->
    <button
      v-if="!isIFrame && project"
      type="button"
      class="floating-back-btn"
      :aria-label="t('a11y.backToList')"
      :title="t('a11y.backToList')"
      @click="goBack"
    >
      <IBiArrowLeft class="floating-back-icon" aria-hidden="true" />
    </button>

    <div class="container mx-auto px-0 md:px-6">
      <div v-if="loading" class="teaser-skeleton" aria-hidden="true"></div>
      <div v-if="project" class="teaser-wrapper">
        <div
          class="teaser-card"
          :style="{ backgroundImage: `url(${teaserImage})` }"
        >
          <!-- The image role sits on its own element: role="img" makes every
               descendant presentational, which would hide the action buttons
               below from assistive technology. -->
          <div
            class="teaser-visual"
            role="img"
            :aria-label="project.name"
          ></div>
          <div class="action-bar" role="group" :aria-label="t('a11y.projectActions')">
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

    <div class="container mx-auto px-4 md:px-6">
      <!-- Single live region for the whole skeleton: one status, not four -->
      <div
        v-if="loading"
        class="loading-stack"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span class="sr-only">{{ t("project.detail.loading") }}</span>
        <div class="skeleton-row" aria-hidden="true">
          <div v-for="i in 3" :key="i" class="skeleton-cell"></div>
        </div>
        <div class="mt-8 space-y-3" aria-hidden="true">
          <div class="h-4 w-4/5 animate-pulse rounded bg-outline-variant/20"></div>
          <div class="h-4 w-2/3 animate-pulse rounded bg-outline-variant/20"></div>
          <div class="h-4 w-3/4 animate-pulse rounded bg-outline-variant/20"></div>
        </div>
      </div>

      <!-- A rejected or timed-out request gets a message and a retry instead
           of an endless skeleton, and it wins over "not found": the project
           may well exist, we just could not hear back. -->
      <div v-else-if="loadFailed" class="not-found not-found--error" role="alert">
        <IBiExclamationCircle class="not-found__icon" aria-hidden="true" />
        <h1 class="not-found__title">{{ t("project.loadError.title") }}</h1>
        <p class="not-found__text">{{ t("project.loadError.text") }}</p>
        <button type="button" class="btn btn-primary" @click="retryLoad">
          <IBiArrowClockwise aria-hidden="true" />
          {{ t("project.loadError.retry") }}
        </button>
      </div>

      <div v-else-if="!project" class="not-found">
        <IBiExclamationCircle class="not-found__icon" aria-hidden="true" />
        <h1 class="not-found__title">{{ t("project.notFound.title") }}</h1>
        <p class="not-found__text">{{ t("project.notFound.text") }}</p>
        <button type="button" class="btn btn-primary" @click="goToList">
          <IBiArrowLeft aria-hidden="true" />
          {{ t("a11y.backToList") }}
        </button>
      </div>

      <div v-else class="project-details">
        <!-- Category tiles -->
        <div
          v-if="project.category?.length"
          class="category-tiles mb-6"
          role="list"
          :aria-label="t('a11y.categoriesFilter')"
        >
          <div
            v-for="category in project.category"
            :key="category.id"
            class="category-tile"
            :style="categoryTileStyle(category.id)"
            role="listitem"
          >
            {{ categoryName(category.id) }}
          </div>
        </div>

        <!-- Metadata: one grouped panel, hairline dividers instead of three cards -->
        <dl class="meta-panel mb-8" :aria-label="t('a11y.projectInformation')">
          <div v-if="project.country" class="meta-cell">
            <dt class="meta-label">
              <IBiGlobe2 class="meta-icon" aria-hidden="true" />
              {{ t("project.detail.country") }}
            </dt>
            <dd class="meta-value">
              <country-label :country-id="project.country.id" />
            </dd>
          </div>

          <div class="meta-cell">
            <dt class="meta-label">
              <IBiCheck2Circle class="meta-icon" aria-hidden="true" />
              {{ t("project.detail.state") }}
            </dt>
            <dd class="meta-value">
              <StateBadge :state="project.state" />
            </dd>
          </div>

          <div v-if="project.since" class="meta-cell">
            <dt class="meta-label">
              <IBiCalendar3 class="meta-icon" aria-hidden="true" />
              {{ t("project.detail.since") }}
            </dt>
            <dd class="meta-value">{{ formattedSince }}</dd>
          </div>
        </dl>

        <div v-if="project.link" class="mb-8">
          <a
            :href="project.link"
            class="btn btn-primary website-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IBiBoxArrowUpRight aria-hidden="true" />
            {{ t("project.detail.website") }}
          </a>
        </div>

        <section
          v-if="project.notes"
          class="mb-8"
          aria-labelledby="project-description-title"
        >
          <h2 id="project-description-title" class="section-title">
            {{ t("project.detail.description") }}
          </h2>
          <div class="notes-content">
            <markdown-text :text="project.notes" />
          </div>
        </section>

        <!-- Mini location map -->
        <section
          v-if="project.latitude && project.longitude"
          class="mb-8"
          aria-labelledby="project-location-title"
        >
          <h2 id="project-location-title" class="section-title">
            {{ t("project.detail.location") }}
          </h2>
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
        </section>

        <template v-if="project">
          <project-gallery
            v-if="project.gallery && project.gallery.length > 0"
            :project="project"
            :title="t('gallery.title')"
          />
        </template>
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
import { useWebFrame } from "@/composables/useWebFrame";
import { useBackNavigation } from "@/composables/useBackNavigation";
import { useLoadingStore } from "@/stores/loading.store";
import BackButton from "@/components/actions/BackButton.vue";
import ShareButton from "@/components/actions/ShareButton.vue";
import NavigateButton from "@/components/actions/NavigateButton.vue";
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import type { Project } from "@/interfaces/Project";
import StateBadge from "@/components/StateBadge.vue";
import { useGeoTags } from "@/composables/useGeoTags";
import { useStructuredData } from "@/composables/useStructuredData";
import { isScrollLocked } from "@/composables/useScrollLock";
import { parseProjectId } from "@/utils/slug";
import { readableTextColor } from "@/utils/color";
import L from "leaflet";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

const { isIFrame } = useWebFrame();
const { t, locale } = useI18n();

// Collapse the sticky header when scrolled past the heading
const SCROLL_THRESHOLD = 20;
const headerScrolled = ref(false);

function onScroll() {
  // A fullscreen overlay freezes the document, which reports scrollY 0. Reacting
  // to it would expand this header and reflow the page under the overlay.
  if (isScrollLocked()) return;
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
const router = useRouter();
const loadingStore = useLoadingStore();
const projectStore = useProjectStore();
const categoryStore = useCategoryStore();
const countryStore = useCountryStore();

const { goBack } = useBackNavigation();

// Deep links to an unknown project must not leave an empty page behind.
function goToList() {
  router.push({ name: "ProjectList" });
}

// Load data before mount to start fetching earlier
onBeforeMount(() => {
  Promise.all([projectStore.load(), categoryStore.load(), countryStore.load()]);
});

const loadFailed = computed(
  () => !project.value && projectStore.error !== null,
);

const loading = computed(() => {
  if (project.value) return false;
  // A failed load must surface as an error with a retry, not as an endless
  // skeleton (the request may have timed out or been rejected).
  if (loadFailed.value) return false;
  // `projects.length === 0` is not a loading signal: the store marks itself
  // `initialized` even for an empty or unexpected payload, so that term stayed
  // true forever and the page sat on its skeleton with no way out.
  if (projectStore.initialized) return false;
  return loadingStore.showLoadingSpinner || projectStore.loading;
});

function retryLoad() {
  void projectStore.load({ force: true });
}

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

const mapOptions = {
  zoomControl: true,
  scrollWheelZoom: false,
};

function categoryName(id: number): string {
  return categoryStore.getDisplayName(id);
}

// Category colors come from NocoDB, so the foreground is picked by measured
// contrast: white wins on the brand blue, dark text wins on mid-tone colors
// such as #ff6a00 where white only reaches 2.9:1.
const DARK_TEXT = "#212529"; // --jws-text-main
const LIGHT_TEXT = "#ffffff";

function categoryTileStyle(id: number): Record<string, string> {
  const cat = categoryStore.getById(id);
  if (cat?.color) {
    return {
      backgroundColor: cat.color,
      color: readableTextColor(cat.color, LIGHT_TEXT, DARK_TEXT),
    };
  }
  return { backgroundColor: "var(--jws-bg-subtle)", color: "var(--jws-text-main)" };
}

const detailMarkerIcon = computed(() => {
  return L.divIcon({
    className: "detail-marker-icon",
    html: '<div class="detail-marker-dot"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }) as unknown as L.Icon;
});
</script>

<style lang="postcss" scoped>
@reference "../assets/main.css";

.project-page {
  @apply pb-[4rem] bg-surface;
}

.page-header-sticky {
  @apply sticky top-0 z-[1001] bg-white/85 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-[padding,box-shadow] duration-300 ease-in-out;

  &.header-scrolled {
    @apply pt-[0.2rem] pb-[0.1rem] shadow-[0_2px_8px_rgba(0,0,0,0.05)];

    .title {
      @apply text-base p-0 leading-[1.3];
    }
  }
}

/* Respect reduced motion: solid bg instead of expensive backdrop-filter */
@media (prefers-reduced-motion: reduce) {
  .page-header-sticky {
    background-color: rgba(255, 255, 255, 0.97) !important;
    backdrop-filter: none !important;
  }
}

.page-header {
  .title {
    @apply text-[1.5rem] font-bold text-primary tracking-[-0.02em] leading-[1.2] transition-[font-size] duration-300 ease-in-out;

    @media (max-width: 768px) {
      font-size: 1.25rem;
      padding-top: 0.375rem;
      padding-bottom: 0.375rem;
    }
  }
}

:deep(.back-btn) {
  display: none;

  .back-button-inner {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }

  /* Desktop keeps the in-header back button; mobile gets the floating one */
  @media (min-width: 768px) {
    display: flex;
  }
}

.floating-back-btn {
  @apply fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-[calc(1rem+env(safe-area-inset-left,0px))] z-[999] w-11 h-11 rounded-full border border-black/10 bg-white/90 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] cursor-pointer flex items-center justify-center text-onSurface transition-[color,box-shadow] duration-200 ease-in-out;

  &:hover {
    @apply bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.12)] text-secondary;
  }

  @media (min-width: 768px) {
    display: none;
  }

  .floating-back-icon {
    @apply text-[1.35rem] leading-none;
  }
}

.teaser-wrapper {
  padding: 0;
  margin-top: 0.25rem;
}

.teaser-skeleton {
  /* Same box as .teaser-card below, so the hero does not resize when the
     image arrives. */
  @apply mt-1 w-full animate-pulse bg-outline-variant/20;
  height: 52vh;
  min-height: 320px;
  max-height: 460px;

  @media (min-width: 768px) {
    height: 60vh;
    min-height: 400px;
    max-height: 700px;
  }
}

.teaser-visual {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.teaser-card {
  position: relative;
  height: 52vh;
  min-height: 320px;
  max-height: 460px;
  width: 100%;
  border-radius: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  animation: revealImage 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;

  @media (min-width: 768px) {
    height: 60vh;
    min-height: 400px;
    max-height: 700px;
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
  @apply absolute bottom-8 right-4 z-10 flex flex-wrap gap-3 md:right-8;
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

/* Metadata: one panel whose 1px gaps reveal the divider tone beneath */
.meta-panel {
  @apply grid gap-px overflow-hidden rounded-round-large border border-outline-variant/60 bg-outline-variant/60;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  margin: 0;
}

.meta-cell {
  @apply flex flex-col gap-[0.375rem] bg-white px-6 py-5;
}

.meta-label {
  @apply flex items-center gap-2 text-label-md font-semibold uppercase tracking-[0.08em] text-onSurface-variant;
}

.meta-icon {
  @apply text-[1rem] text-primary;
}

.meta-value {
  @apply m-0 text-body-lg font-semibold text-onSurface;
}

.meta-value :deep(.country-label) {
  @apply text-body-lg font-semibold;
}

.website-cta {
  @apply inline-flex items-center gap-2 font-semibold;
}

.section-title {
  @apply flex items-center gap-3 text-[clamp(1.375rem,1.15rem+0.8vw,1.625rem)] font-extrabold leading-tight text-onSurface;
  margin-bottom: 1rem;

  &::before {
    content: '';
    flex: none;
    width: 6px;
    height: 1.35em;
    @apply rounded-[3px] bg-primary;
  }
}

/* Reading column: documented body step, comfortable measure, no dead 1.5rem wrapper rule */
.notes-content {
  @apply max-w-[68ch] text-body-lg text-onSurface;
  line-height: 1.7;
}

.notes-content :deep(.markdown-text) {
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}

.notes-content :deep(p:last-child) {
  margin-bottom: 0;
}

.loading-stack {
  margin-top: 1.5rem;
}

.skeleton-row {
  @apply grid gap-4;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
}

.skeleton-cell {
  @apply h-[5.5rem] animate-pulse rounded-round-large bg-outline-variant/20;
}

.not-found {
  @apply mx-auto mt-16 flex max-w-[34rem] flex-col items-center gap-4 text-center;
}

.not-found__icon {
  @apply text-[2.5rem] text-onSurface-variant;
}

.not-found__title {
  @apply m-0 text-headline-md font-bold tracking-tight text-onSurface;
}

.not-found__text {
  @apply m-0 text-body-lg text-onSurface-variant;
}

.category-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-tile {
  @apply rounded-round-full px-3 py-1.5 text-label-md font-semibold uppercase tracking-[0.03em];
}

.mini-map {
  border: 1px solid rgba(0, 0, 0, 0.05);
  line-height: 1;
}

.mini-map :deep(.leaflet-control-attribution) {
  font-size: 9px;
}

/* One authored moment: the hero reveal. Everything else stays still. */
@media (prefers-reduced-motion: reduce) {
  .teaser-card {
    animation: none;
  }

  .floating-back-btn,
  .page-header-sticky,
  .page-header .title,
  :deep(.glass-btn) {
    transition: none;
  }

  :deep(.glass-btn:hover) {
    transform: none;
  }
}
</style>

/* Unscoped: Leaflet renders its DOM outside Vue's scope */
<style lang="postcss">
@reference "../assets/main.css";

.detail-marker-icon {
  @apply bg-transparent border-none;
}

.detail-marker-dot {
  @apply h-7 w-7 rounded-full border-[3px] border-white bg-primary shadow-[0_2px_8px_rgba(0,0,0,0.3)];
}

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
</style>

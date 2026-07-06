<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="hide" @keydown.escape="hide">
    <div 
      class="modal-content rounded-round-xl border-0 shadow-lg bg-white max-w-lg mx-4 my-8" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="search-modal-title"
      aria-describedby="search-modal-desc"
    >
      <div class="modal-header border-0 pb-0 flex items-center justify-between p-4">
        <h2 id="search-modal-title" class="sr-only">{{ t('search.resultsLabel') }}</h2>
        <p id="search-modal-desc" class="sr-only">{{ t('a11y.searchInput') }}</p>
        <MainMenu
          ref="searchBarRef"
          v-model="query"
          v-model:state-filter="stateFilter"
          :placeholder="t('search.placeholderShort')"
          :filter-label="t('search.filter')"
          @escape="hide()"
        />
        <button 
          class="close-btn" 
          @click="hide" 
          :aria-label="t('a11y.closeSearch')"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <!-- Results -->
      <div class="search-results" role="region" :aria-label="t('a11y.searchResultsLabel')">
        <!-- Hint when query is too short -->
        <div v-if="query.trim().length < 2" class="p-4 text-center text-onSurface-variant" role="status">
          <IBiSearch style="font-size: 2rem; opacity: 0.3" aria-hidden="true" />
          <p class="mt-2 mb-0 text-label-sm">{{ t("search.minChars") }}</p>
        </div>

        <!-- No results -->
        <div
          v-else-if="results.length === 0"
          class="p-4 text-center text-onSurface-variant"
          role="status"
          aria-live="polite"
        >
          <IBiEmojiDizzy style="font-size: 2rem; opacity: 0.3" aria-hidden="true" />
          <p class="mt-2 mb-0 text-label-sm">{{ t("search.noResults") }} <strong>{{ query }}</strong></p>
        </div>

        <!-- Result list -->
        <div 
          v-else 
          class="result-list" 
          role="listbox" 
          id="search-results-list" 
          :aria-label="t('a11y.searchResultsLabel')"
        >
          <button
            v-for="(project, index) in results"
            :key="project.id"
            role="option"
            :aria-label="`${project.name}, ${t('a11y.viewProjectDetails')}`"
            class="result-item flex items-start gap-3 py-3 px-4 w-full text-left"
            @click="navigate(project)"
            @keydown.enter="navigate(project)"
            @keydown.space.prevent="navigate(project)"
            :tabindex="index === 0 ? 0 : -1"
          >
            <!-- Thumbnail -->
            <img
              v-if="getTeaserImage(project)"
              :src="getTeaserImage(project)"
              :alt="project.name"
              class="result-thumb rounded-round-default" 
              loading="lazy"
            />
            <div v-else class="result-thumb-placeholder rounded-round-default flex items-center justify-center">
              <IBiGlobe2 class="text-onSurface-variant" aria-hidden="true" />
            </div>

            <div class="flex-grow-1 overflow-hidden">
              <div class="font-semibold text-truncate">{{ project.name }}</div>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <StateBadge :state="project.state" />
                <span v-if="project.country" class="text-label-sm text-onSurface-variant flex items-center gap-1">
                  <IBiGeoAlt aria-hidden="true" />
                  {{ project.country.fields.Name }}
                </span>
              </div>
            </div>

            <IBiChevronRight class="text-onSurface-variant self-center" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Footer hint -->
      <div v-if="results.length > 0" class="search-footer px-4 py-2 flex items-center gap-3 text-onSurface-variant text-label-sm border-t border-outline-variant">
        <span aria-hidden="true"><kbd>↑</kbd> <kbd>↓</kbd> {{ t('a11y.navigate') }}</span>
        <span aria-hidden="true"><kbd>Enter</kbd> {{ t('a11y.open') }}</span>
        <span aria-hidden="true"><kbd>Esc</kbd> {{ t('a11y.close') }}</span>
        <span class="ml-auto" aria-live="polite">{{ t("a11y.searchResultsAnnouncement", { count: results.length }) }}</span>
      </div>
      <div class="sr-only" role="status" aria-live="polite">
        {{ results.length > 0 ? t("a11y.searchResultsAnnouncement", { count: results.length }) : (query.length >= 2 ? t("a11y.noResultsAnnouncement") : '') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const { t } = useI18n();

const emit = defineEmits<{
  (e: "hidden"): void;
}>();

import { useProjectStore } from "@/features/projects/stores/project.store";
import type { Project } from "@/interfaces/Project";
import { useProjectSearch } from "@/composables/useProjectSearch";
import { useWebFrame } from "@/composables/useWebFrame";
import { useSearchStore } from "@/stores/search.store";
import MainMenu from "./MainMenu.vue";
import StateBadge from "@/components/StateBadge.vue";
import { useFocusRestore } from "@/composables/useAccessibility";

const router = useRouter();
const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);

const { query, stateFilter, results, reset } = useProjectSearch(projects);
const { navigateToProject } = useWebFrame();

const isVisible = ref(false);
const searchBarRef = ref<InstanceType<typeof MainMenu> | null>(null);
const { setTrigger, restoreFocus } = useFocusRestore();

function show() {
  setTrigger();
  isVisible.value = true;
  document.body.style.overflow = 'hidden';
  nextTick(() => {
    searchBarRef.value?.focus();
  });
}

function hide() {
  isVisible.value = false;
  document.body.style.overflow = '';
  reset();
  restoreFocus();
  emit("hidden");
}

function onHidden() {
  reset();
  restoreFocus();
  emit("hidden");
}

async function onShown() {
  await nextTick();
  searchBarRef.value?.focus();
}

function navigate(project: { id: number; name: string }) {
  hide();
  navigateToProject(project);
}

function getTeaserImage(project: Project) {
  if (project.teaserImg && project.teaserImg.length > 0) {
    const img = project.teaserImg[0];
    // Use small thumbnail for the search list to save bandwidth, fallback to card_cover or original signedUrl
    return img.thumbnails?.small?.signedUrl || img.thumbnails?.card_cover?.signedUrl || img.signedUrl || "/img/placeholder.png";
  }
  return "/img/placeholder.png";
}

// Handle keyboard navigation in results
function handleResultKeydown(e: KeyboardEvent, project: Project) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    navigate(project);
  }
}

// Ctrl+K / Cmd+K keyboard shortcut
function handleKeydown(e: KeyboardEvent) {
  // Don't open if user is currently typing in another input
  if (
    document.activeElement?.tagName === "INPUT" ||
    document.activeElement?.tagName === "TEXTAREA"
  ) {
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    const searchStore = useSearchStore();
    searchStore.openSearch();
  }
}

// Trap focus inside modal
function trapFocus(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !isVisible.value) return;

  const modal = e.currentTarget as HTMLElement;
  const focusable = modal.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));

defineExpose({ show, hide });
</script>

<style lang="postcss" scoped>
.search-results {
  @apply max-h-[60vh] overflow-y-auto;
}

.result-list {
  @apply divide-y divide-outline-variant;
}

.result-item {
  @apply cursor-pointer bg-surface rounded-round-default transition-[background-color,transform] duration-150 hover:bg-surface-variant hover:-translate-y-0.5 active:translate-y-0 focus:outline-2 focus:outline-secondary focus:outline-offset-2;
}

.result-item:focus-visible {
  @apply outline-2 outline-secondary outline-offset-2;
}

.result-thumb {
  @apply w-[calc(var(--spacing-unit)*8)] h-[calc(var(--spacing-unit)*8)] object-cover flex-shrink-0 rounded-round-default;
}

.result-thumb-placeholder {
  @apply w-[calc(var(--spacing-unit)*8)] h-[calc(var(--spacing-unit)*8)] flex-shrink-0 bg-surface-variant rounded-round-default flex items-center justify-center text-onSurface-variant text-[calc(var(--font-size-body-md)*1.2)];
}

.search-footer {
  @apply bg-surface-variant border-t border-outline-variant px-[var(--spacing-unit)] py-[var(--spacing-unit)] text-label-sm text-onSurface-variant;

  kbd {
    @apply bg-surface border border-outline text-onSurface text-label-sm px-[calc(var(--spacing-unit)*0.25)] py-[calc(var(--spacing-unit)*0.5)] rounded-round-default;
  }
}

kbd {
  @apply bg-surface border border-outline text-onSurface text-label-sm px-[calc(var(--spacing-unit)*0.25)] py-[calc(var(--spacing-unit)*0.5)] rounded-round-default;
}

.modal-overlay {
  @apply fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4;
}

.modal-content {
  @apply w-full max-w-lg mx-4 my-8;
}

.modal-header {
  @apply border-0 pb-0 flex items-center justify-between p-4;
}

.close-btn {
  @apply w-8 h-8 rounded-full border-none bg-transparent text-onSurface flex items-center justify-center text-[22px] cursor-pointer leading-none transition-all duration-200 hover:bg-black/10 focus:outline-2 focus:outline-secondary focus:outline-offset-2;
}

.close-btn:focus-visible {
  @apply outline-2 outline-secondary outline-offset-2;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
